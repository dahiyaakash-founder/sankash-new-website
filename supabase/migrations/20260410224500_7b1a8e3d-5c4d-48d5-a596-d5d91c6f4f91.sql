DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'trip_conversion_status'
  ) THEN
    CREATE TYPE public.trip_conversion_status AS ENUM ('won', 'lost', 'pending', 'partially_converted');
  END IF;
END
$$;

ALTER TABLE public.lead_trip_brains
  ADD COLUMN IF NOT EXISTS latest_conversion_status text,
  ADD COLUMN IF NOT EXISTS outcome_learning_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS outcome_learning_version text NOT NULL DEFAULT 'outcome-learning-v1';

ALTER TABLE public.lead_ops_copilot
  ADD COLUMN IF NOT EXISTS outcome_learning_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS outcome_learning_version text NOT NULL DEFAULT 'outcome-learning-v1';

ALTER TABLE public.trip_market_memory
  ADD COLUMN IF NOT EXISTS latest_conversion_status text,
  ADD COLUMN IF NOT EXISTS outcome_feedback_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS outcome_learning_version text NOT NULL DEFAULT 'outcome-learning-v1';

CREATE TABLE IF NOT EXISTS public.lead_trip_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  unified_case_id uuid REFERENCES public.lead_trip_brains(id) ON DELETE SET NULL,
  conversion_status public.trip_conversion_status NOT NULL DEFAULT 'pending',
  conversion_date timestamptz,
  product_converted_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  loan_amount numeric,
  booked_amount numeric,
  quote_amount_at_outcome numeric,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  traveler_profile_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_page text,
  source_type text,
  owner_user_id uuid,
  pitch_angle_that_worked text,
  originally_anonymous boolean NOT NULL DEFAULT false,
  upload_count integer NOT NULL DEFAULT 0,
  itinerary_count integer NOT NULL DEFAULT 0,
  lead_classification_at_outcome public.trip_lead_classification,
  intent_score_at_outcome integer NOT NULL DEFAULT 0,
  conversion_probability_band_at_outcome text,
  recommendation_outputs_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  product_fit_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  multi_itinerary_type text,
  source_profile_label text,
  first_upload_at timestamptz,
  contact_captured_at timestamptz,
  time_from_first_upload_to_conversion_hours numeric,
  time_from_contact_capture_to_conversion_hours numeric,
  learning_weight numeric NOT NULL DEFAULT 1,
  benchmark_confidence_weight numeric NOT NULL DEFAULT 1,
  active_for_learning boolean NOT NULL DEFAULT true,
  explanation text,
  outcome_learning_version text NOT NULL DEFAULT 'outcome-learning-v1',
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_destination_outcome_benchmarks (
  benchmark_key text PRIMARY KEY,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  duration_bucket text,
  traveler_bucket text,
  package_mode text,
  sample_count integer NOT NULL DEFAULT 0,
  won_case_count integer NOT NULL DEFAULT 0,
  lost_case_count integer NOT NULL DEFAULT 0,
  partial_case_count integer NOT NULL DEFAULT 0,
  pending_case_count integer NOT NULL DEFAULT 0,
  conversion_rate_weighted numeric NOT NULL DEFAULT 0,
  anonymous_origin_win_rate numeric NOT NULL DEFAULT 0,
  benchmark_confidence_score numeric NOT NULL DEFAULT 0,
  common_winning_pitch_angles_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  common_converted_products_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  guidance_summary text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_pitch_outcome_memory (
  pitch_angle text NOT NULL,
  domestic_or_international text NOT NULL DEFAULT 'unknown',
  multi_itinerary_type text NOT NULL DEFAULT 'single_itinerary',
  sample_count integer NOT NULL DEFAULT 0,
  won_count integer NOT NULL DEFAULT 0,
  lost_count integer NOT NULL DEFAULT 0,
  partial_case_count integer NOT NULL DEFAULT 0,
  win_rate numeric NOT NULL DEFAULT 0,
  anonymous_origin_win_rate numeric NOT NULL DEFAULT 0,
  average_quote_amount numeric,
  common_products_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  guidance_summary text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pitch_angle, domestic_or_international, multi_itinerary_type)
);

CREATE TABLE IF NOT EXISTS public.trip_product_outcome_memory (
  product_code text NOT NULL,
  domestic_or_international text NOT NULL DEFAULT 'unknown',
  package_mode text NOT NULL DEFAULT 'unknown',
  sample_count integer NOT NULL DEFAULT 0,
  won_count integer NOT NULL DEFAULT 0,
  lost_count integer NOT NULL DEFAULT 0,
  partial_case_count integer NOT NULL DEFAULT 0,
  win_rate numeric NOT NULL DEFAULT 0,
  avg_loan_amount numeric,
  avg_booked_amount numeric,
  common_pitch_angles_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  guidance_summary text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_code, domestic_or_international, package_mode)
);

CREATE TABLE IF NOT EXISTS public.trip_outcome_learning_queue (
  lead_id uuid PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
  unified_case_id uuid REFERENCES public.lead_trip_brains(id) ON DELETE SET NULL,
  reason text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  last_error text,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trip_outcome_learning_queue_status_check CHECK (status IN ('pending', 'processing', 'done', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_lead_trip_outcomes_status_date ON public.lead_trip_outcomes(conversion_status, conversion_date DESC);
CREATE INDEX IF NOT EXISTS idx_lead_trip_outcomes_benchmark ON public.lead_trip_outcomes(destination_city, destination_country, domestic_or_international);
CREATE INDEX IF NOT EXISTS idx_trip_outcome_learning_queue_status_due_at ON public.trip_outcome_learning_queue(status, due_at);
CREATE INDEX IF NOT EXISTS idx_trip_destination_outcome_benchmarks_scope ON public.trip_destination_outcome_benchmarks(domestic_or_international, package_mode);

ALTER TABLE public.lead_trip_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_destination_outcome_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_pitch_outcome_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_product_outcome_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_outcome_learning_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Role-scoped trip outcome visibility" ON public.lead_trip_outcomes;
CREATE POLICY "Role-scoped trip outcome visibility"
ON public.lead_trip_outcomes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leads l
    WHERE l.id = lead_id
      AND public.can_view_lead(auth.uid(), l.assigned_to)
  )
);

DROP POLICY IF EXISTS "Ops can view destination outcome benchmarks" ON public.trip_destination_outcome_benchmarks;
CREATE POLICY "Ops can view destination outcome benchmarks"
ON public.trip_destination_outcome_benchmarks
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP POLICY IF EXISTS "Ops can view pitch outcome memory" ON public.trip_pitch_outcome_memory;
CREATE POLICY "Ops can view pitch outcome memory"
ON public.trip_pitch_outcome_memory
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP POLICY IF EXISTS "Ops can view product outcome memory" ON public.trip_product_outcome_memory;
CREATE POLICY "Ops can view product outcome memory"
ON public.trip_product_outcome_memory
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP POLICY IF EXISTS "Ops can view outcome learning queue" ON public.trip_outcome_learning_queue;
CREATE POLICY "Ops can view outcome learning queue"
ON public.trip_outcome_learning_queue
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP TRIGGER IF EXISTS update_lead_trip_outcomes_updated_at ON public.lead_trip_outcomes;
CREATE TRIGGER update_lead_trip_outcomes_updated_at
BEFORE UPDATE ON public.lead_trip_outcomes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_destination_outcome_benchmarks_updated_at ON public.trip_destination_outcome_benchmarks;
CREATE TRIGGER update_trip_destination_outcome_benchmarks_updated_at
BEFORE UPDATE ON public.trip_destination_outcome_benchmarks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_pitch_outcome_memory_updated_at ON public.trip_pitch_outcome_memory;
CREATE TRIGGER update_trip_pitch_outcome_memory_updated_at
BEFORE UPDATE ON public.trip_pitch_outcome_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_product_outcome_memory_updated_at ON public.trip_product_outcome_memory;
CREATE TRIGGER update_trip_product_outcome_memory_updated_at
BEFORE UPDATE ON public.trip_product_outcome_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_outcome_learning_queue_updated_at ON public.trip_outcome_learning_queue;
CREATE TRIGGER update_trip_outcome_learning_queue_updated_at
BEFORE UPDATE ON public.trip_outcome_learning_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.queue_trip_outcome_learning(
  _lead_id uuid,
  _reason text,
  _payload jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _brain_id uuid;
BEGIN
  SELECT id INTO _brain_id
  FROM public.lead_trip_brains
  WHERE lead_id = _lead_id;

  INSERT INTO public.trip_outcome_learning_queue (lead_id, unified_case_id, reason, payload_json, status, requested_at, due_at, processed_at, last_error)
  VALUES (_lead_id, _brain_id, _reason, coalesce(_payload, '{}'::jsonb), 'pending', now(), now(), NULL, NULL)
  ON CONFLICT (lead_id)
  DO UPDATE
    SET unified_case_id = COALESCE(EXCLUDED.unified_case_id, public.trip_outcome_learning_queue.unified_case_id),
        reason = EXCLUDED.reason,
        payload_json = public.trip_outcome_learning_queue.payload_json || EXCLUDED.payload_json,
        status = 'pending',
        requested_at = now(),
        due_at = now(),
        processed_at = NULL,
        last_error = NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_trip_outcome_learning_from_lead_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.queue_trip_outcome_learning(
      NEW.id,
      'lead_inserted',
      jsonb_build_object('source', 'leads', 'event', TG_OP)
    );
    RETURN NEW;
  END IF;

  IF
    NEW.status IS DISTINCT FROM OLD.status OR
    NEW.outcome IS DISTINCT FROM OLD.outcome OR
    NEW.quote_amount IS DISTINCT FROM OLD.quote_amount OR
    NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR
    NEW.metadata_json IS DISTINCT FROM OLD.metadata_json OR
    NEW.updated_at IS DISTINCT FROM OLD.updated_at
  THEN
    PERFORM public.queue_trip_outcome_learning(
      NEW.id,
      CASE
        WHEN NEW.status IS DISTINCT FROM OLD.status OR NEW.outcome IS DISTINCT FROM OLD.outcome THEN 'lead_outcome_changed'
        ELSE 'lead_commercial_data_changed'
      END,
      jsonb_build_object('source', 'leads', 'event', TG_OP)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_trip_outcome_learning_from_lead_change ON public.leads;
CREATE TRIGGER trigger_trip_outcome_learning_from_lead_change
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_trip_outcome_learning_from_lead_change();

CREATE OR REPLACE FUNCTION public.rebuild_trip_destination_outcome_benchmarks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE TABLE public.trip_destination_outcome_benchmarks;

  WITH base AS (
    SELECT
      o.*,
      b.benchmark_key,
      b.destination_city,
      b.destination_country,
      b.domestic_or_international,
      public.duration_bucket(b.duration_days) AS duration_bucket,
      public.traveler_bucket(b.traveller_count_total) AS traveler_bucket,
      COALESCE(NULLIF(b.package_mode, ''), 'unknown') AS package_mode
    FROM public.lead_trip_outcomes o
    JOIN public.lead_trip_brains b ON b.id = o.unified_case_id
    WHERE o.active_for_learning
  ),
  pitch_counts AS (
    SELECT
      benchmark_key,
      pitch_angle_that_worked AS pitch_angle,
      COUNT(*) AS cnt
    FROM base
    WHERE conversion_status = 'won'
      AND pitch_angle_that_worked IS NOT NULL
    GROUP BY benchmark_key, pitch_angle_that_worked
  ),
  product_counts AS (
    SELECT
      benchmark_key,
      product_code,
      COUNT(*) AS cnt
    FROM base
    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(base.product_converted_json, '[]'::jsonb)) AS product_code
    WHERE conversion_status IN ('won', 'partially_converted')
    GROUP BY benchmark_key, product_code
  ),
  rollup AS (
    SELECT
      benchmark_key,
      MAX(destination_city) AS destination_city,
      MAX(destination_country) AS destination_country,
      MAX(domestic_or_international) AS domestic_or_international,
      MAX(duration_bucket) AS duration_bucket,
      MAX(traveler_bucket) AS traveler_bucket,
      MAX(package_mode) AS package_mode,
      COUNT(*) AS sample_count,
      COUNT(*) FILTER (WHERE conversion_status = 'won') AS won_case_count,
      COUNT(*) FILTER (WHERE conversion_status = 'lost') AS lost_case_count,
      COUNT(*) FILTER (WHERE conversion_status = 'partially_converted') AS partial_case_count,
      COUNT(*) FILTER (WHERE conversion_status = 'pending') AS pending_case_count,
      COALESCE(
        SUM(
          CASE
            WHEN conversion_status = 'won' THEN learning_weight
            WHEN conversion_status = 'partially_converted' THEN learning_weight * 0.6
            ELSE 0
          END
        ) / NULLIF(SUM(learning_weight), 0),
        0
      ) AS conversion_rate_weighted,
      COALESCE(
        SUM(
          CASE
            WHEN conversion_status = 'won' AND originally_anonymous AND contact_captured_at IS NOT NULL THEN learning_weight
            ELSE 0
          END
        ) / NULLIF(SUM(CASE WHEN originally_anonymous THEN learning_weight ELSE 0 END), 0),
        0
      ) AS anonymous_origin_win_rate,
      LEAST(
        100,
        ROUND(((COUNT(*) * 8)::numeric + COALESCE(SUM(benchmark_confidence_weight), 0) * 10)::numeric, 1)
      ) AS benchmark_confidence_score
    FROM base
    GROUP BY benchmark_key
  )
  INSERT INTO public.trip_destination_outcome_benchmarks (
    benchmark_key,
    destination_city,
    destination_country,
    domestic_or_international,
    duration_bucket,
    traveler_bucket,
    package_mode,
    sample_count,
    won_case_count,
    lost_case_count,
    partial_case_count,
    pending_case_count,
    conversion_rate_weighted,
    anonymous_origin_win_rate,
    benchmark_confidence_score,
    common_winning_pitch_angles_json,
    common_converted_products_json,
    guidance_summary
  )
  SELECT
    rollup.benchmark_key,
    rollup.destination_city,
    rollup.destination_country,
    rollup.domestic_or_international,
    rollup.duration_bucket,
    rollup.traveler_bucket,
    rollup.package_mode,
    rollup.sample_count,
    rollup.won_case_count,
    rollup.lost_case_count,
    rollup.partial_case_count,
    rollup.pending_case_count,
    ROUND(rollup.conversion_rate_weighted::numeric, 4),
    ROUND(rollup.anonymous_origin_win_rate::numeric, 4),
    rollup.benchmark_confidence_score,
    COALESCE((
      SELECT jsonb_agg(sub.pitch_angle)
      FROM (
        SELECT pitch_angle
        FROM pitch_counts
        WHERE benchmark_key = rollup.benchmark_key
        ORDER BY cnt DESC, pitch_angle ASC
        LIMIT 3
      ) sub
    ), '[]'::jsonb),
    COALESCE((
      SELECT jsonb_agg(sub.product_code)
      FROM (
        SELECT product_code
        FROM product_counts
        WHERE benchmark_key = rollup.benchmark_key
        ORDER BY cnt DESC, product_code ASC
        LIMIT 4
      ) sub
    ), '[]'::jsonb),
    CASE
      WHEN rollup.won_case_count > 0 THEN
        'Outcome memory shows this trip shape can convert, especially when the pitch stays focused on value clarity and the strongest matching product.'
      WHEN rollup.sample_count > 0 THEN
        'Outcome memory exists, but wins are still limited, so treat it as directional guidance.'
      ELSE
        'Outcome memory is still building for this trip shape.'
    END
  FROM rollup;
END;
$$;

CREATE OR REPLACE FUNCTION public.rebuild_trip_pitch_outcome_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE TABLE public.trip_pitch_outcome_memory;

  WITH base AS (
    SELECT
      o.*,
      COALESCE(NULLIF(o.pitch_angle_that_worked, ''), 'unknown') AS pitch_angle,
      COALESCE(NULLIF(o.multi_itinerary_type, ''), 'single_itinerary') AS multi_itinerary_type,
      COALESCE(NULLIF(o.domestic_or_international, ''), 'unknown') AS domestic_or_international
    FROM public.lead_trip_outcomes o
    WHERE o.active_for_learning
      AND o.pitch_angle_that_worked IS NOT NULL
  ),
  product_counts AS (
    SELECT
      pitch_angle,
      domestic_or_international,
      multi_itinerary_type,
      product_code,
      COUNT(*) AS cnt
    FROM base
    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(base.product_converted_json, '[]'::jsonb)) AS product_code
    GROUP BY pitch_angle, domestic_or_international, multi_itinerary_type, product_code
  )
  INSERT INTO public.trip_pitch_outcome_memory (
    pitch_angle,
    domestic_or_international,
    multi_itinerary_type,
    sample_count,
    won_count,
    lost_count,
    partial_case_count,
    win_rate,
    anonymous_origin_win_rate,
    average_quote_amount,
    common_products_json,
    guidance_summary
  )
  SELECT
    base.pitch_angle,
    base.domestic_or_international,
    base.multi_itinerary_type,
    COUNT(*) AS sample_count,
    COUNT(*) FILTER (WHERE base.conversion_status = 'won') AS won_count,
    COUNT(*) FILTER (WHERE base.conversion_status = 'lost') AS lost_count,
    COUNT(*) FILTER (WHERE base.conversion_status = 'partially_converted') AS partial_case_count,
    ROUND(
      COALESCE(
        SUM(CASE WHEN base.conversion_status = 'won' THEN base.learning_weight ELSE 0 END) / NULLIF(SUM(base.learning_weight), 0),
        0
      )::numeric,
      4
    ) AS win_rate,
    ROUND(
      COALESCE(
        SUM(CASE WHEN base.conversion_status = 'won' AND base.originally_anonymous AND base.contact_captured_at IS NOT NULL THEN base.learning_weight ELSE 0 END)
        / NULLIF(SUM(CASE WHEN base.originally_anonymous THEN base.learning_weight ELSE 0 END), 0),
        0
      )::numeric,
      4
    ) AS anonymous_origin_win_rate,
    AVG(base.quote_amount_at_outcome) AS average_quote_amount,
    COALESCE((
      SELECT jsonb_agg(sub.product_code)
      FROM (
        SELECT product_code
        FROM product_counts
        WHERE product_counts.pitch_angle = base.pitch_angle
          AND product_counts.domestic_or_international = base.domestic_or_international
          AND product_counts.multi_itinerary_type = base.multi_itinerary_type
        ORDER BY cnt DESC, product_code ASC
        LIMIT 4
      ) sub
    ), '[]'::jsonb),
    CASE
      WHEN COUNT(*) FILTER (WHERE base.conversion_status = 'won') > 0 THEN 'This pitch angle has produced real wins in similar cases.'
      ELSE 'This pitch angle is present in memory, but its closing power is still unclear.'
    END
  FROM base
  GROUP BY base.pitch_angle, base.domestic_or_international, base.multi_itinerary_type;
END;
$$;

CREATE OR REPLACE FUNCTION public.rebuild_trip_product_outcome_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE TABLE public.trip_product_outcome_memory;

  WITH base AS (
    SELECT
      o.*,
      COALESCE(NULLIF(o.domestic_or_international, ''), 'unknown') AS domestic_or_international,
      COALESCE(NULLIF((o.traveler_profile_json ->> 'package_mode'), ''), 'unknown') AS package_mode
    FROM public.lead_trip_outcomes o
    WHERE o.active_for_learning
  ),
  expanded AS (
    SELECT
      base.domestic_or_international,
      base.package_mode,
      base.pitch_angle_that_worked,
      base.conversion_status,
      base.learning_weight,
      base.loan_amount,
      base.booked_amount,
      product_code
    FROM base
    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(base.product_converted_json, '[]'::jsonb)) AS product_code
  ),
  pitch_counts AS (
    SELECT
      product_code,
      domestic_or_international,
      package_mode,
      pitch_angle_that_worked,
      COUNT(*) AS cnt
    FROM expanded
    WHERE pitch_angle_that_worked IS NOT NULL
    GROUP BY product_code, domestic_or_international, package_mode, pitch_angle_that_worked
  )
  INSERT INTO public.trip_product_outcome_memory (
    product_code,
    domestic_or_international,
    package_mode,
    sample_count,
    won_count,
    lost_count,
    partial_case_count,
    win_rate,
    avg_loan_amount,
    avg_booked_amount,
    common_pitch_angles_json,
    guidance_summary
  )
  SELECT
    expanded.product_code,
    expanded.domestic_or_international,
    expanded.package_mode,
    COUNT(*) AS sample_count,
    COUNT(*) FILTER (WHERE expanded.conversion_status = 'won') AS won_count,
    COUNT(*) FILTER (WHERE expanded.conversion_status = 'lost') AS lost_count,
    COUNT(*) FILTER (WHERE expanded.conversion_status = 'partially_converted') AS partial_case_count,
    ROUND(
      COALESCE(
        SUM(CASE WHEN expanded.conversion_status = 'won' THEN expanded.learning_weight ELSE 0 END)
        / NULLIF(SUM(expanded.learning_weight), 0),
        0
      )::numeric,
      4
    ) AS win_rate,
    AVG(expanded.loan_amount) AS avg_loan_amount,
    AVG(expanded.booked_amount) AS avg_booked_amount,
    COALESCE((
      SELECT jsonb_agg(sub.pitch_angle_that_worked)
      FROM (
        SELECT pitch_angle_that_worked
        FROM pitch_counts
        WHERE pitch_counts.product_code = expanded.product_code
          AND pitch_counts.domestic_or_international = expanded.domestic_or_international
          AND pitch_counts.package_mode = expanded.package_mode
        ORDER BY cnt DESC, pitch_angle_that_worked ASC
        LIMIT 3
      ) sub
    ), '[]'::jsonb),
    CASE
      WHEN COUNT(*) FILTER (WHERE expanded.conversion_status = 'won') > 0 THEN 'This product has converted in comparable cases and should influence product-fit guidance.'
      ELSE 'This product appears in memory, but there is limited win proof so far.'
    END
  FROM expanded
  GROUP BY expanded.product_code, expanded.domestic_or_international, expanded.package_mode;
END;
$$;

CREATE OR REPLACE FUNCTION public.run_daily_trip_intelligence_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_intelligence_refresh_queue (lead_id, reason, payload_json, status, requested_at, due_at)
  SELECT
    lead_id,
    'daily_refresh',
    jsonb_build_object('source', 'daily_cron'),
    'pending',
    now(),
    now()
  FROM public.lead_trip_brains
  WHERE
    intelligence_refreshed_at < now() - interval '1 day'
    OR traveler_intelligence_version <> 'traveler-intelligence-v1'
    OR ops_copilot_version <> 'ops-copilot-v2'
    OR benchmark_engine_version <> 'benchmark-engine-v2'
    OR outcome_learning_version <> 'outcome-learning-v1'
  ON CONFLICT (lead_id)
  DO UPDATE
    SET reason = EXCLUDED.reason,
        payload_json = public.trip_intelligence_refresh_queue.payload_json || EXCLUDED.payload_json,
        status = 'pending',
        requested_at = now(),
        due_at = now(),
        processed_at = NULL;

  INSERT INTO public.trip_post_analysis_enrichment_queue (lead_id, unified_case_id, enrichment_type, reason, payload_json, status, requested_at, due_at)
  SELECT
    lead_id,
    id,
    'source_likelihood',
    'daily_refresh',
    jsonb_build_object('source', 'daily_cron'),
    'pending',
    now(),
    now()
  FROM public.lead_trip_brains
  WHERE
    source_profile_label IS NULL
    OR coalesce(source_profile_confidence, '') = ''
    OR benchmark_engine_version <> 'benchmark-engine-v2'
  ON CONFLICT (lead_id)
  DO UPDATE
    SET reason = EXCLUDED.reason,
        payload_json = public.trip_post_analysis_enrichment_queue.payload_json || EXCLUDED.payload_json,
        status = 'pending',
        requested_at = now(),
        due_at = now(),
        processed_at = NULL,
        unified_case_id = EXCLUDED.unified_case_id;

  INSERT INTO public.trip_outcome_learning_queue (lead_id, unified_case_id, reason, payload_json, status, requested_at, due_at)
  SELECT
    b.lead_id,
    b.id,
    'daily_refresh',
    jsonb_build_object('source', 'daily_cron'),
    'pending',
    now(),
    now()
  FROM public.lead_trip_brains b
  LEFT JOIN public.lead_trip_outcomes o ON o.lead_id = b.lead_id
  LEFT JOIN public.leads l ON l.id = b.lead_id
  WHERE
    o.id IS NULL
    OR o.last_synced_at < now() - interval '1 day'
    OR b.outcome_learning_version <> 'outcome-learning-v1'
    OR coalesce(l.status, '') IN ('converted', 'closed_lost')
    OR coalesce(l.outcome, '') IN ('won', 'lost')
  ON CONFLICT (lead_id)
  DO UPDATE
    SET reason = EXCLUDED.reason,
        payload_json = public.trip_outcome_learning_queue.payload_json || EXCLUDED.payload_json,
        status = 'pending',
        requested_at = now(),
        due_at = now(),
        processed_at = NULL,
        unified_case_id = EXCLUDED.unified_case_id;

  PERFORM public.rebuild_trip_destination_benchmarks();
  PERFORM public.rebuild_trip_hotel_frequency();
  PERFORM public.rebuild_trip_similar_cases();
  PERFORM public.rebuild_trip_destination_outcome_benchmarks();
  PERFORM public.rebuild_trip_pitch_outcome_memory();
  PERFORM public.rebuild_trip_product_outcome_memory();
END;
$$;
