ALTER TABLE public.lead_trip_brains
  ADD COLUMN IF NOT EXISTS intent_signals_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS intent_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversion_probability_band text NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS decision_stage text,
  ADD COLUMN IF NOT EXISTS likely_customer_motive text,
  ADD COLUMN IF NOT EXISTS recommended_pitch_angle text,
  ADD COLUMN IF NOT EXISTS intent_explanation text,
  ADD COLUMN IF NOT EXISTS intent_confidence text,
  ADD COLUMN IF NOT EXISTS multi_itinerary_type text NOT NULL DEFAULT 'single_itinerary',
  ADD COLUMN IF NOT EXISTS multi_itinerary_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS recommendation_engine_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS top_recommendations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS suggested_alternative_destinations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_products_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS suggested_pitch_sequence_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benchmark_price_position text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS source_likelihood_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_profile_label text,
  ADD COLUMN IF NOT EXISTS source_profile_confidence text;

ALTER TABLE public.lead_trip_brains
  ALTER COLUMN ops_copilot_version SET DEFAULT 'ops-copilot-v2',
  ALTER COLUMN benchmark_engine_version SET DEFAULT 'benchmark-engine-v2';

ALTER TABLE public.lead_ops_copilot
  ADD COLUMN IF NOT EXISTS intent_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS multi_itinerary_read_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS top_recommendations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS suggested_alternative_destinations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_products_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS suggested_pitch_sequence_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benchmark_price_position text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS conversion_probability_band text NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS decision_stage text,
  ADD COLUMN IF NOT EXISTS likely_customer_motive text,
  ADD COLUMN IF NOT EXISTS recommended_pitch_angle text,
  ADD COLUMN IF NOT EXISTS intent_explanation text,
  ADD COLUMN IF NOT EXISTS intent_confidence text,
  ADD COLUMN IF NOT EXISTS source_likelihood_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS best_pitch_angle text;

ALTER TABLE public.lead_ops_copilot
  ALTER COLUMN ops_copilot_version SET DEFAULT 'ops-copilot-v2';

ALTER TABLE public.trip_market_memory
  ADD COLUMN IF NOT EXISTS learning_signal_class text NOT NULL DEFAULT 'research_signal',
  ADD COLUMN IF NOT EXISTS learning_weight numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS benchmark_signal_weight numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS benchmark_price_position text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS conversion_probability_band text NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS decision_stage text,
  ADD COLUMN IF NOT EXISTS likely_customer_motive text,
  ADD COLUMN IF NOT EXISTS recommended_pitch_angle text,
  ADD COLUMN IF NOT EXISTS multi_itinerary_type text NOT NULL DEFAULT 'single_itinerary',
  ADD COLUMN IF NOT EXISTS recommendation_engine_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_likelihood_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_profile_label text,
  ADD COLUMN IF NOT EXISTS source_profile_confidence text;

ALTER TABLE public.trip_market_memory
  ALTER COLUMN benchmark_engine_version SET DEFAULT 'benchmark-engine-v2';

ALTER TABLE public.trip_destination_benchmarks
  ADD COLUMN IF NOT EXISTS weighted_sample_score numeric NOT NULL DEFAULT 0;

ALTER TABLE public.trip_hotel_frequency
  ADD COLUMN IF NOT EXISTS weighted_case_score numeric NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.lead_trip_intent_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  unified_case_id uuid REFERENCES public.lead_trip_brains(id) ON DELETE SET NULL,
  source_page text,
  audience_type public.audience_type,
  contact_present boolean NOT NULL DEFAULT false,
  first_upload_at timestamptz,
  latest_upload_at timestamptz,
  contact_captured_at timestamptz,
  session_count integer NOT NULL DEFAULT 1,
  return_visit_count integer NOT NULL DEFAULT 0,
  total_public_page_views integer NOT NULL DEFAULT 0,
  pages_visited_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  page_types_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_spent_before_upload_seconds integer,
  viewed_traveler_page boolean NOT NULL DEFAULT false,
  viewed_emi_page boolean NOT NULL DEFAULT false,
  viewed_emi_section boolean NOT NULL DEFAULT false,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  os_name text,
  browser_name text,
  uploaded_multiple_itineraries boolean NOT NULL DEFAULT false,
  distinct_destination_count integer NOT NULL DEFAULT 0,
  same_destination_repeat boolean NOT NULL DEFAULT false,
  days_to_trip_start integer,
  quote_size_band text,
  trip_size_band text,
  raw_signal_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  intent_score integer NOT NULL DEFAULT 0,
  conversion_probability_band text NOT NULL DEFAULT 'low',
  decision_stage text,
  likely_customer_motive text,
  recommended_pitch_angle text,
  intent_explanation text,
  intent_confidence text,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_post_analysis_enrichment_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  unified_case_id uuid REFERENCES public.lead_trip_brains(id) ON DELETE SET NULL,
  enrichment_type text NOT NULL DEFAULT 'source_likelihood',
  reason text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trip_post_analysis_enrichment_queue_status_check CHECK (status IN ('pending', 'processing', 'done', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_lead_trip_intent_signals_intent_score ON public.lead_trip_intent_signals(intent_score);
CREATE INDEX IF NOT EXISTS idx_trip_post_analysis_enrichment_queue_status_due_at ON public.trip_post_analysis_enrichment_queue(status, due_at);

ALTER TABLE public.lead_trip_intent_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_post_analysis_enrichment_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Role-scoped trip intent visibility" ON public.lead_trip_intent_signals;
CREATE POLICY "Role-scoped trip intent visibility"
ON public.lead_trip_intent_signals
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

DROP POLICY IF EXISTS "Ops can view trip post analysis queue" ON public.trip_post_analysis_enrichment_queue;
CREATE POLICY "Ops can view trip post analysis queue"
ON public.trip_post_analysis_enrichment_queue
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP TRIGGER IF EXISTS update_lead_trip_intent_signals_updated_at ON public.lead_trip_intent_signals;
CREATE TRIGGER update_lead_trip_intent_signals_updated_at
BEFORE UPDATE ON public.lead_trip_intent_signals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_post_analysis_enrichment_queue_updated_at ON public.trip_post_analysis_enrichment_queue;
CREATE TRIGGER update_trip_post_analysis_enrichment_queue_updated_at
BEFORE UPDATE ON public.trip_post_analysis_enrichment_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.rebuild_trip_destination_benchmarks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE TABLE public.trip_destination_benchmarks;

  INSERT INTO public.trip_destination_benchmarks (
    benchmark_key,
    destination_city,
    destination_country,
    domestic_or_international,
    duration_bucket,
    traveler_bucket,
    package_mode,
    sample_count,
    weighted_sample_score,
    min_total_price,
    max_total_price,
    avg_total_price,
    median_total_price,
    common_hotels_json,
    common_inclusions_json,
    common_exclusions_json,
    product_fit_summary_json,
    updated_at
  )
  WITH eligible AS (
    SELECT *
    FROM public.trip_market_memory
    WHERE active_for_benchmark = true
      AND coalesce(lead_classification::text, '') <> 'noise'
  ),
  bench AS (
    SELECT
      benchmark_key,
      max(destination_city) AS destination_city,
      max(destination_country) AS destination_country,
      max(domestic_or_international) AS domestic_or_international,
      public.trip_duration_bucket(max(duration_days)) AS duration_bucket,
      public.trip_traveler_bucket(max(traveller_count_total)) AS traveler_bucket,
      max(package_mode) AS package_mode,
      count(*) AS sample_count,
      sum(coalesce(benchmark_signal_weight, 1)) AS weighted_sample_score,
      min(total_price) AS min_total_price,
      max(total_price) AS max_total_price,
      sum(total_price * coalesce(benchmark_signal_weight, 1)) / nullif(sum(coalesce(benchmark_signal_weight, 1)), 0) AS avg_total_price,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY total_price) AS median_total_price
    FROM eligible
    WHERE benchmark_key IS NOT NULL
      AND total_price IS NOT NULL
    GROUP BY benchmark_key
  ),
  hotel_counts AS (
    SELECT
      tmm.benchmark_key,
      hotel_name,
      sum(coalesce(tmm.benchmark_signal_weight, 1)) AS use_score,
      row_number() OVER (PARTITION BY tmm.benchmark_key ORDER BY sum(coalesce(tmm.benchmark_signal_weight, 1)) DESC, hotel_name) AS rn
    FROM eligible tmm
    CROSS JOIN LATERAL jsonb_array_elements_text(tmm.hotel_names_json) hotel_name
    WHERE tmm.benchmark_key IS NOT NULL
    GROUP BY tmm.benchmark_key, hotel_name
  ),
  inclusion_counts AS (
    SELECT
      tmm.benchmark_key,
      tag,
      sum(coalesce(tmm.benchmark_signal_weight, 1)) AS use_score,
      row_number() OVER (PARTITION BY tmm.benchmark_key ORDER BY sum(coalesce(tmm.benchmark_signal_weight, 1)) DESC, tag) AS rn
    FROM eligible tmm
    CROSS JOIN LATERAL jsonb_array_elements_text(tmm.inclusions_tags_json) tag
    WHERE tmm.benchmark_key IS NOT NULL
    GROUP BY tmm.benchmark_key, tag
  ),
  exclusion_counts AS (
    SELECT
      tmm.benchmark_key,
      tag,
      sum(coalesce(tmm.benchmark_signal_weight, 1)) AS use_score,
      row_number() OVER (PARTITION BY tmm.benchmark_key ORDER BY sum(coalesce(tmm.benchmark_signal_weight, 1)) DESC, tag) AS rn
    FROM eligible tmm
    CROSS JOIN LATERAL jsonb_array_elements_text(tmm.exclusions_tags_json) tag
    WHERE tmm.benchmark_key IS NOT NULL
    GROUP BY tmm.benchmark_key, tag
  ),
  product_summary AS (
    SELECT
      benchmark_key,
      jsonb_build_object(
        'emi_candidate_cases', count(*) FILTER (WHERE coalesce((product_fit_flags_json ->> 'emi_eligible')::boolean, false)),
        'no_cost_emi_candidate_cases', count(*) FILTER (WHERE coalesce((product_fit_flags_json ->> 'no_cost_emi_candidate')::boolean, false)),
        'insurance_candidate_cases', count(*) FILTER (WHERE coalesce((product_fit_flags_json ->> 'travel_insurance_candidate')::boolean, false)),
        'rebuild_candidate_cases', count(*) FILTER (WHERE coalesce((product_fit_flags_json ->> 'rebuild_candidate')::boolean, false)),
        'weighted_emi_candidate_score', sum(coalesce(benchmark_signal_weight, 1)) FILTER (WHERE coalesce((product_fit_flags_json ->> 'emi_eligible')::boolean, false))
      ) AS product_fit_summary_json
    FROM eligible
    WHERE benchmark_key IS NOT NULL
    GROUP BY benchmark_key
  )
  SELECT
    bench.benchmark_key,
    bench.destination_city,
    bench.destination_country,
    bench.domestic_or_international,
    bench.duration_bucket,
    bench.traveler_bucket,
    bench.package_mode,
    bench.sample_count,
    bench.weighted_sample_score,
    bench.min_total_price,
    bench.max_total_price,
    bench.avg_total_price,
    bench.median_total_price,
    coalesce((
      SELECT jsonb_agg(hotel_name ORDER BY use_score DESC, hotel_name)
      FROM hotel_counts
      WHERE benchmark_key = bench.benchmark_key AND rn <= 5
    ), '[]'::jsonb),
    coalesce((
      SELECT jsonb_agg(tag ORDER BY use_score DESC, tag)
      FROM inclusion_counts
      WHERE benchmark_key = bench.benchmark_key AND rn <= 6
    ), '[]'::jsonb),
    coalesce((
      SELECT jsonb_agg(tag ORDER BY use_score DESC, tag)
      FROM exclusion_counts
      WHERE benchmark_key = bench.benchmark_key AND rn <= 6
    ), '[]'::jsonb),
    coalesce(product_summary.product_fit_summary_json, '{}'::jsonb),
    now()
  FROM bench
  LEFT JOIN product_summary
    ON product_summary.benchmark_key = bench.benchmark_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.rebuild_trip_hotel_frequency()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE TABLE public.trip_hotel_frequency;

  INSERT INTO public.trip_hotel_frequency (destination_key, hotel_name, case_count, weighted_case_score, last_seen_at)
  SELECT
    public.trip_destination_key(destination_city, destination_country) AS destination_key,
    hotel_name,
    count(*) AS case_count,
    sum(coalesce(benchmark_signal_weight, 1)) AS weighted_case_score,
    max(last_seen_at) AS last_seen_at
  FROM public.trip_market_memory
  CROSS JOIN LATERAL jsonb_array_elements_text(hotel_names_json) hotel_name
  WHERE active_for_benchmark = true
    AND coalesce(lead_classification::text, '') <> 'noise'
  GROUP BY public.trip_destination_key(destination_city, destination_country), hotel_name;
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

  PERFORM public.rebuild_trip_destination_benchmarks();
  PERFORM public.rebuild_trip_hotel_frequency();
  PERFORM public.rebuild_trip_similar_cases();
END;
$$;
