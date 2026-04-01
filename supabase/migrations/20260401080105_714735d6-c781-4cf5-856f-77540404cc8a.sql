CREATE OR REPLACE FUNCTION public.upsert_lead_with_dedup(
  _full_name text,
  _email text DEFAULT NULL::text,
  _mobile_number text DEFAULT NULL::text,
  _company_name text DEFAULT NULL::text,
  _message text DEFAULT NULL::text,
  _audience_type audience_type DEFAULT NULL::audience_type,
  _lead_source_page text DEFAULT NULL::text,
  _lead_source_type lead_source_type DEFAULT NULL::lead_source_type,
  _quote_file_url text DEFAULT NULL::text,
  _quote_file_name text DEFAULT NULL::text,
  _quote_amount numeric DEFAULT NULL::numeric,
  _city text DEFAULT NULL::text,
  _destination_type text DEFAULT NULL::text,
  _detected_trip_type text DEFAULT 'unknown'::text,
  _emi_flag boolean DEFAULT false,
  _insurance_flag boolean DEFAULT false,
  _pg_flag boolean DEFAULT false,
  _website_url text DEFAULT NULL::text,
  _metadata_json jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _existing_id uuid;
  _result_id uuid;
  _is_duplicate boolean := false;
  _cutoff timestamptz := now() - interval '24 hours';
  _assignee uuid;
  _normalized_mobile text := regexp_replace(coalesce(_mobile_number, ''), '[^0-9]+', '', 'g');
  _normalized_email text := nullif(lower(btrim(coalesce(_email, ''))), '');
  _incoming_metadata jsonb := coalesce(_metadata_json, '{}'::jsonb);
BEGIN
  IF _normalized_mobile IS NOT NULL AND _normalized_mobile <> '' AND length(_normalized_mobile) > 10 THEN
    _normalized_mobile := right(_normalized_mobile, 10);
  END IF;

  IF _normalized_mobile = '' THEN
    _normalized_mobile := NULL;
  END IF;

  SELECT ur.user_id INTO _assignee
  FROM public.user_roles ur
  JOIN public.profiles p
    ON p.user_id = ur.user_id
   AND p.status = 'active'
  WHERE ur.role IN ('team_supervisor', 'admin', 'super_admin')
  ORDER BY (
    SELECT count(*)
    FROM public.leads l
    WHERE l.assigned_to = ur.user_id
      AND l.status NOT IN ('converted', 'closed_lost')
  ) ASC,
  ur.user_id
  LIMIT 1;

  IF _normalized_mobile IS NOT NULL THEN
    SELECT l.id INTO _existing_id
    FROM public.leads l
    WHERE (
      CASE
        WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
          THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
        ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
      END
    ) = _normalized_mobile
      AND l.created_at >= _cutoff
    ORDER BY l.updated_at DESC, l.created_at DESC
    LIMIT 1;
  END IF;

  IF _existing_id IS NULL AND _normalized_email IS NOT NULL THEN
    SELECT l.id INTO _existing_id
    FROM public.leads l
    WHERE nullif(lower(btrim(coalesce(l.email, ''))), '') = _normalized_email
      AND l.created_at >= _cutoff
    ORDER BY l.updated_at DESC, l.created_at DESC
    LIMIT 1;
  END IF;

  IF _existing_id IS NOT NULL THEN
    UPDATE public.leads
    SET
      full_name = COALESCE(NULLIF(_full_name, ''), full_name),
      email = COALESCE(_normalized_email, email),
      mobile_number = COALESCE(_normalized_mobile, mobile_number),
      message = COALESCE(NULLIF(_message, ''), message),
      notes = CASE
        WHEN NULLIF(_message, '') IS NULL THEN notes
        ELSE concat_ws(E'\n\n', notes, '[Re-submission from ' || COALESCE(_lead_source_page, 'website') || '] ' || _message)
      END,
      quote_file_url = COALESCE(_quote_file_url, quote_file_url),
      quote_file_name = COALESCE(_quote_file_name, quote_file_name),
      quote_amount = COALESCE(_quote_amount, quote_amount),
      company_name = COALESCE(NULLIF(_company_name, ''), company_name),
      city = COALESCE(NULLIF(_city, ''), city),
      destination_type = COALESCE(NULLIF(_destination_type, ''), destination_type),
      detected_trip_type = CASE
        WHEN _detected_trip_type IS NOT NULL AND _detected_trip_type <> '' AND _detected_trip_type <> 'unknown'
          THEN _detected_trip_type
        ELSE detected_trip_type
      END,
      audience_type = COALESCE(_audience_type, audience_type),
      lead_source_page = COALESCE(_lead_source_page, lead_source_page),
      lead_source_type = COALESCE(_lead_source_type, lead_source_type),
      website_url = COALESCE(NULLIF(_website_url, ''), website_url),
      emi_flag = COALESCE(_emi_flag, emi_flag),
      insurance_flag = COALESCE(_insurance_flag, insurance_flag),
      pg_flag = COALESCE(_pg_flag, pg_flag),
      assigned_to = COALESCE(assigned_to, _assignee),
      metadata_json = coalesce(metadata_json, '{}'::jsonb)
        || _incoming_metadata
        || jsonb_build_object(
          'last_resubmission_at', now(),
          'last_resubmission_source', COALESCE(_lead_source_type::text, 'unknown'),
          'resubmission_count', COALESCE((metadata_json ->> 'resubmission_count')::integer, 0) + 1
        ),
      updated_at = now()
    WHERE id = _existing_id;

    INSERT INTO public.lead_activity (lead_id, activity_type, description)
    VALUES (
      _existing_id,
      'resubmission',
      CASE
        WHEN _lead_source_type = 'traveler_quote_unlock'::lead_source_type
          THEN 'Traveler re-submitted quote/unlock request'
        ELSE 'New submission merged into existing lead'
      END
    );

    _result_id := _existing_id;
    _is_duplicate := true;
  ELSE
    _result_id := gen_random_uuid();

    INSERT INTO public.leads (
      id,
      full_name,
      email,
      mobile_number,
      company_name,
      message,
      audience_type,
      lead_source_page,
      lead_source_type,
      quote_file_url,
      quote_file_name,
      quote_amount,
      city,
      destination_type,
      detected_trip_type,
      emi_flag,
      insurance_flag,
      pg_flag,
      website_url,
      metadata_json,
      assigned_to
    ) VALUES (
      _result_id,
      _full_name,
      _normalized_email,
      _normalized_mobile,
      _company_name,
      _message,
      _audience_type,
      _lead_source_page,
      _lead_source_type,
      _quote_file_url,
      _quote_file_name,
      _quote_amount,
      _city,
      _destination_type,
      _detected_trip_type,
      _emi_flag,
      _insurance_flag,
      _pg_flag,
      _website_url,
      _incoming_metadata,
      _assignee
    );

    _is_duplicate := false;
  END IF;

  RETURN jsonb_build_object(
    'id', _result_id,
    'is_duplicate', _is_duplicate,
    'assigned_to', _assignee
  );
END;
$function$;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT
    tr.*,
    lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT
    o.*,
    sum(
      CASE
        WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours'
          THEN 1
        ELSE 0
      END
    ) OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT
    c.dedup_key,
    c.cluster_id,
    (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can
    ON can.dedup_key = c.dedup_key
   AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
),
assignee AS (
  SELECT ur.user_id
  FROM public.user_roles ur
  JOIN public.profiles p
    ON p.user_id = ur.user_id
   AND p.status = 'active'
  WHERE ur.role IN ('team_supervisor', 'admin', 'super_admin')
  ORDER BY (
    SELECT count(*)
    FROM public.leads l
    WHERE l.assigned_to = ur.user_id
      AND l.status NOT IN ('converted', 'closed_lost')
  ) ASC,
  ur.user_id
  LIMIT 1
),
rollup AS (
  SELECT d.canonical_id, max(l.updated_at) AS max_updated_at
  FROM dupes d
  JOIN public.leads l ON l.id = d.duplicate_id
  GROUP BY d.canonical_id
)
UPDATE public.lead_attachments la
SET lead_id = d.canonical_id
FROM dupes d
WHERE la.lead_id = d.duplicate_id;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
)
UPDATE public.lead_notes ln
SET lead_id = d.canonical_id
FROM dupes d
WHERE ln.lead_id = d.duplicate_id;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
)
UPDATE public.lead_status_history lsh
SET lead_id = d.canonical_id
FROM dupes d
WHERE lsh.lead_id = d.duplicate_id;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
)
UPDATE public.itinerary_analysis ia
SET lead_id = d.canonical_id
FROM dupes d
WHERE ia.lead_id = d.duplicate_id;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
)
UPDATE public.lead_activity la
SET lead_id = d.canonical_id
FROM dupes d
WHERE la.lead_id = d.duplicate_id;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
),
assignee AS (
  SELECT ur.user_id
  FROM public.user_roles ur
  JOIN public.profiles p
    ON p.user_id = ur.user_id
   AND p.status = 'active'
  WHERE ur.role IN ('team_supervisor', 'admin', 'super_admin')
  ORDER BY (
    SELECT count(*)
    FROM public.leads l
    WHERE l.assigned_to = ur.user_id
      AND l.status NOT IN ('converted', 'closed_lost')
  ) ASC,
  ur.user_id
  LIMIT 1
),
rollup AS (
  SELECT d.canonical_id, max(l.updated_at) AS max_updated_at, count(*) AS merged_count
  FROM dupes d
  JOIN public.leads l ON l.id = d.duplicate_id
  GROUP BY d.canonical_id
)
UPDATE public.leads l
SET assigned_to = COALESCE(l.assigned_to, (SELECT user_id FROM assignee)),
    updated_at = GREATEST(l.updated_at, r.max_updated_at),
    metadata_json = coalesce(l.metadata_json, '{}'::jsonb)
      || jsonb_build_object(
        'last_resubmission_at', now(),
        'last_resubmission_source', 'traveler_quote_unlock',
        'resubmission_count', GREATEST(COALESCE((l.metadata_json ->> 'resubmission_count')::integer, 0), r.merged_count)
      )
FROM rollup r
WHERE l.id = r.canonical_id;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
)
INSERT INTO public.lead_activity (lead_id, activity_type, description)
SELECT DISTINCT d.canonical_id, 'resubmission', 'Traveler re-submitted quote/unlock request'
FROM dupes d;

WITH traveler_rows AS (
  SELECT
    l.id,
    l.created_at,
    l.updated_at,
    CASE
      WHEN nullif(lower(btrim(coalesce(l.email, ''))), '') IS NOT NULL
        THEN 'email:' || lower(btrim(l.email))
      WHEN nullif(
        CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END,
        ''
      ) IS NOT NULL
        THEN 'mobile:' || CASE
          WHEN length(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')) > 10
            THEN right(regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g'), 10)
          ELSE regexp_replace(coalesce(l.mobile_number, ''), '[^0-9]+', '', 'g')
        END
      ELSE 'lead:' || l.id::text
    END AS dedup_key
  FROM public.leads l
  WHERE l.lead_source_type = 'traveler_quote_unlock'::lead_source_type
),
ordered AS (
  SELECT tr.*, lag(tr.created_at) OVER (PARTITION BY tr.dedup_key ORDER BY tr.created_at) AS prev_created_at
  FROM traveler_rows tr
),
clustered AS (
  SELECT o.*, sum(CASE WHEN o.prev_created_at IS NULL OR o.created_at - o.prev_created_at > interval '24 hours' THEN 1 ELSE 0 END)
    OVER (PARTITION BY o.dedup_key ORDER BY o.created_at) AS cluster_id
  FROM ordered o
),
canonical AS (
  SELECT c.dedup_key, c.cluster_id, (array_agg(c.id ORDER BY c.updated_at DESC, c.created_at DESC))[1] AS canonical_id
  FROM clustered c
  GROUP BY c.dedup_key, c.cluster_id
),
dupes AS (
  SELECT c.id AS duplicate_id, can.canonical_id
  FROM clustered c
  JOIN canonical can ON can.dedup_key = c.dedup_key AND can.cluster_id = c.cluster_id
  WHERE c.id <> can.canonical_id
)
DELETE FROM public.leads l
USING dupes d
WHERE l.id = d.duplicate_id;