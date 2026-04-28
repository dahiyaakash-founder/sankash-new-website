CREATE OR REPLACE FUNCTION public.upsert_lead_with_dedup(_full_name text, _email text DEFAULT NULL::text, _mobile_number text DEFAULT NULL::text, _company_name text DEFAULT NULL::text, _message text DEFAULT NULL::text, _audience_type audience_type DEFAULT NULL::audience_type, _lead_source_page text DEFAULT NULL::text, _lead_source_type lead_source_type DEFAULT NULL::lead_source_type, _quote_file_url text DEFAULT NULL::text, _quote_file_name text DEFAULT NULL::text, _quote_amount numeric DEFAULT NULL::numeric, _city text DEFAULT NULL::text, _destination_type text DEFAULT NULL::text, _detected_trip_type text DEFAULT 'unknown'::text, _emi_flag boolean DEFAULT false, _insurance_flag boolean DEFAULT false, _pg_flag boolean DEFAULT false, _website_url text DEFAULT NULL::text, _metadata_json jsonb DEFAULT '{}'::jsonb)
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
  _uid_shibani  uuid := '301e2938-8952-4cf1-ba33-4c26d2f88bc6';
  _uid_madhumita uuid := '1362c9d5-692d-4bf7-a40c-cb5701a27982';
  _uid_lakshay  uuid := 'f244475a-1c04-408d-9c9e-68b41a4987d9';
  _uid_ayushi   uuid := '078484c9-32d3-4203-a334-6ee5bee926a9';
BEGIN
  IF _normalized_mobile IS NOT NULL AND _normalized_mobile <> '' AND length(_normalized_mobile) > 10 THEN
    _normalized_mobile := right(_normalized_mobile, 10);
  END IF;
  IF _normalized_mobile = '' THEN _normalized_mobile := NULL; END IF;

  IF _normalized_mobile IS NOT NULL THEN
    IF length(_normalized_mobile) <> 10 THEN
      RETURN jsonb_build_object('error', 'Invalid mobile number: must be 10 digits', 'id', null, 'is_duplicate', false);
    END IF;
    IF left(_normalized_mobile, 1) NOT IN ('6', '7', '8', '9') THEN
      RETURN jsonb_build_object('error', 'Invalid mobile number: must start with 6, 7, 8, or 9', 'id', null, 'is_duplicate', false);
    END IF;
  END IF;

  CASE _lead_source_type::text
    WHEN 'contact_form' THEN _assignee := _uid_shibani;
    WHEN 'demo_request' THEN _assignee := _uid_shibani;
    WHEN 'support_request' THEN _assignee := _uid_shibani;
    WHEN 'traveler_quote_unlock' THEN _assignee := _uid_madhumita;
    WHEN 'agent_quote_review' THEN _assignee := _uid_madhumita;
    WHEN 'itinerary_upload' THEN _assignee := _uid_madhumita;
    WHEN 'traveler_emi_enquiry' THEN _assignee := _uid_madhumita;
    WHEN 'sandbox_access_request' THEN _assignee := _uid_madhumita;
    WHEN 'production_access_request' THEN _assignee := _uid_madhumita;
    WHEN 'integration_query' THEN _assignee := _uid_madhumita;
    WHEN 'insurance_query' THEN _assignee := _uid_ayushi;
    ELSE
      SELECT ur.user_id INTO _assignee
      FROM public.user_roles ur
      JOIN public.profiles p ON p.user_id = ur.user_id AND p.status = 'active'
      WHERE ur.role IN ('team_supervisor', 'admin', 'super_admin')
      ORDER BY (
        SELECT count(*) FROM public.leads l
        WHERE l.assigned_to = ur.user_id AND l.status NOT IN ('converted', 'closed_lost')
      ) ASC, ur.user_id
      LIMIT 1;
  END CASE;

  IF _insurance_flag = true AND _assignee IS DISTINCT FROM _uid_ayushi THEN
    IF _lead_source_type IS NULL OR _lead_source_type::text = 'contact_form' THEN
      _assignee := _uid_ayushi;
    END IF;
  END IF;

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
        WHEN _lead_source_type = 'traveler_emi_enquiry'::lead_source_type
          THEN 'Traveler re-submitted EMI enquiry'
        ELSE 'New submission merged into existing lead'
      END
    );

    _result_id := _existing_id;
    _is_duplicate := true;
  ELSE
    _result_id := gen_random_uuid();

    INSERT INTO public.leads (
      id, full_name, email, mobile_number, company_name, message,
      audience_type, lead_source_page, lead_source_type,
      quote_file_url, quote_file_name, quote_amount,
      city, destination_type, detected_trip_type,
      emi_flag, insurance_flag, pg_flag,
      website_url, metadata_json, assigned_to
    ) VALUES (
      _result_id, _full_name, _normalized_email, _normalized_mobile,
      _company_name, _message, _audience_type, _lead_source_page, _lead_source_type,
      _quote_file_url, _quote_file_name, _quote_amount,
      _city, _destination_type, _detected_trip_type,
      _emi_flag, _insurance_flag, _pg_flag,
      _website_url, _incoming_metadata, _assignee
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