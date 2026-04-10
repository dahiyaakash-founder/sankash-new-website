
-- ============================================================
-- 1. lead_trip_brains
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_trip_brains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  latest_analysis_id uuid,
  source_page text,
  audience_type text,
  lead_classification text NOT NULL DEFAULT 'research_lead',
  contact_present boolean NOT NULL DEFAULT false,
  analysis_count integer NOT NULL DEFAULT 0,
  attachment_count integer NOT NULL DEFAULT 0,
  parsing_confidence text DEFAULT 'low',
  extracted_completeness_score integer DEFAULT 0,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  travel_start_date text,
  travel_end_date text,
  duration_days integer,
  duration_nights integer,
  total_price numeric,
  price_per_person numeric,
  currency text DEFAULT 'INR',
  traveller_count_total integer,
  adults_count integer,
  children_count integer,
  infants_count integer,
  travel_agent_name text,
  customer_name text,
  package_mode text NOT NULL DEFAULT 'unknown',
  hotel_names_json jsonb NOT NULL DEFAULT '[]',
  airline_names_json jsonb NOT NULL DEFAULT '[]',
  sectors_json jsonb NOT NULL DEFAULT '[]',
  additional_destinations_json jsonb NOT NULL DEFAULT '[]',
  inclusions_text text,
  exclusions_text text,
  missing_fields_json jsonb NOT NULL DEFAULT '[]',
  extraction_warnings_json jsonb NOT NULL DEFAULT '[]',
  conflicting_fields_json jsonb NOT NULL DEFAULT '[]',
  decision_flags_json jsonb NOT NULL DEFAULT '[]',
  traveler_questions_json jsonb NOT NULL DEFAULT '[]',
  seller_questions_json jsonb NOT NULL DEFAULT '[]',
  unlockable_modules_json jsonb NOT NULL DEFAULT '[]',
  traveler_output_json jsonb NOT NULL DEFAULT '{}',
  unified_summary text,
  benchmark_key text,
  benchmark_summary_json jsonb NOT NULL DEFAULT '{}',
  similar_case_summary_json jsonb NOT NULL DEFAULT '{}',
  product_fit_flags_json jsonb NOT NULL DEFAULT '{}',
  intent_signals_json jsonb NOT NULL DEFAULT '{}',
  intent_score integer NOT NULL DEFAULT 0,
  conversion_probability_band text NOT NULL DEFAULT 'low',
  decision_stage text DEFAULT 'early_exploration',
  likely_customer_motive text DEFAULT 'quote_validation',
  recommended_pitch_angle text DEFAULT 'clarify_quote_and_close',
  intent_explanation text,
  intent_confidence text DEFAULT 'low',
  multi_itinerary_type text NOT NULL DEFAULT 'single_itinerary',
  multi_itinerary_summary_json jsonb NOT NULL DEFAULT '{}',
  recommendation_engine_json jsonb NOT NULL DEFAULT '{}',
  top_recommendations_json jsonb NOT NULL DEFAULT '[]',
  suggested_alternative_destinations_json jsonb NOT NULL DEFAULT '[]',
  recommended_products_json jsonb NOT NULL DEFAULT '[]',
  suggested_pitch_sequence_json jsonb NOT NULL DEFAULT '[]',
  benchmark_price_position text NOT NULL DEFAULT 'unknown',
  source_likelihood_json jsonb NOT NULL DEFAULT '{}',
  source_profile_label text,
  source_profile_confidence text,
  latest_conversion_status text,
  outcome_learning_summary_json jsonb NOT NULL DEFAULT '{}',
  outcome_learning_version text,
  traveler_intelligence_version text NOT NULL DEFAULT 'traveler-intelligence-v1',
  ops_copilot_version text NOT NULL DEFAULT 'ops-copilot-v2',
  benchmark_engine_version text NOT NULL DEFAULT 'benchmark-engine-v2',
  intelligence_refreshed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_trip_brains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view trip brains" ON public.lead_trip_brains FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can insert trip brains" ON public.lead_trip_brains FOR INSERT TO authenticated WITH CHECK (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can update trip brains" ON public.lead_trip_brains FOR UPDATE TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access trip brains" ON public.lead_trip_brains FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_trip_brains_benchmark_key ON public.lead_trip_brains (benchmark_key);
CREATE INDEX IF NOT EXISTS idx_lead_trip_brains_classification ON public.lead_trip_brains (lead_classification);

-- ============================================================
-- 2. lead_ops_copilot
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_ops_copilot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  unified_case_id uuid NOT NULL,
  lead_classification text NOT NULL DEFAULT 'research_lead',
  recommendation_summary text,
  ops_summary text,
  what_looks_wrong_json jsonb NOT NULL DEFAULT '[]',
  sankash_opportunity_json jsonb NOT NULL DEFAULT '[]',
  call_talking_points_json jsonb NOT NULL DEFAULT '[]',
  pitch_sequence_json jsonb NOT NULL DEFAULT '[]',
  whatsapp_follow_up text,
  benchmark_summary_json jsonb NOT NULL DEFAULT '{}',
  similar_trip_summary_json jsonb NOT NULL DEFAULT '{}',
  product_fit_flags_json jsonb NOT NULL DEFAULT '{}',
  next_best_action_json jsonb NOT NULL DEFAULT '{}',
  intent_summary_json jsonb NOT NULL DEFAULT '{}',
  multi_itinerary_read_json jsonb NOT NULL DEFAULT '{}',
  top_recommendations_json jsonb NOT NULL DEFAULT '[]',
  suggested_alternative_destinations_json jsonb NOT NULL DEFAULT '[]',
  recommended_products_json jsonb NOT NULL DEFAULT '[]',
  suggested_pitch_sequence_json jsonb NOT NULL DEFAULT '[]',
  benchmark_price_position text NOT NULL DEFAULT 'unknown',
  conversion_probability_band text NOT NULL DEFAULT 'low',
  decision_stage text,
  likely_customer_motive text,
  recommended_pitch_angle text,
  intent_explanation text,
  intent_confidence text,
  source_likelihood_json jsonb NOT NULL DEFAULT '{}',
  outcome_learning_summary_json jsonb NOT NULL DEFAULT '{}',
  best_pitch_angle text,
  urgency_score integer NOT NULL DEFAULT 0,
  intent_score integer NOT NULL DEFAULT 0,
  lead_quality_score integer NOT NULL DEFAULT 0,
  traveler_trust_score integer NOT NULL DEFAULT 0,
  ops_copilot_version text NOT NULL DEFAULT 'ops-copilot-v2',
  outcome_learning_version text,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_ops_copilot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view ops copilot" ON public.lead_ops_copilot FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can insert ops copilot" ON public.lead_ops_copilot FOR INSERT TO authenticated WITH CHECK (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can update ops copilot" ON public.lead_ops_copilot FOR UPDATE TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access ops copilot" ON public.lead_ops_copilot FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 3. trip_market_memory
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_market_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_case_id uuid NOT NULL UNIQUE,
  lead_id uuid NOT NULL,
  source_page text,
  audience_type text,
  lead_classification text NOT NULL DEFAULT 'research_lead',
  contact_present boolean NOT NULL DEFAULT false,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  duration_days integer,
  duration_nights integer,
  travel_start_date text,
  travel_end_date text,
  traveller_count_total integer,
  adults_count integer,
  children_count integer,
  infants_count integer,
  hotel_names_json jsonb NOT NULL DEFAULT '[]',
  airline_names_json jsonb NOT NULL DEFAULT '[]',
  sectors_json jsonb NOT NULL DEFAULT '[]',
  package_mode text NOT NULL DEFAULT 'unknown',
  itinerary_archetype text,
  benchmark_key text,
  total_price numeric,
  price_per_person numeric,
  currency text DEFAULT 'INR',
  traveler_count_total integer,
  inclusions_tags_json jsonb NOT NULL DEFAULT '[]',
  exclusions_tags_json jsonb NOT NULL DEFAULT '[]',
  missing_fields_json jsonb NOT NULL DEFAULT '[]',
  parsing_confidence text DEFAULT 'low',
  extracted_completeness_score integer DEFAULT 0,
  product_fit_flags_json jsonb NOT NULL DEFAULT '{}',
  recommendation_summary text,
  recommendation_engine_json jsonb NOT NULL DEFAULT '{}',
  outcome text NOT NULL DEFAULT 'open',
  active_for_benchmark boolean NOT NULL DEFAULT true,
  benchmark_engine_version text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  learning_signal_class text,
  learning_weight numeric NOT NULL DEFAULT 1,
  benchmark_signal_weight numeric NOT NULL DEFAULT 1,
  benchmark_price_position text NOT NULL DEFAULT 'unknown',
  conversion_probability_band text NOT NULL DEFAULT 'low',
  decision_stage text,
  likely_customer_motive text,
  recommended_pitch_angle text,
  multi_itinerary_type text NOT NULL DEFAULT 'single_itinerary',
  source_likelihood_json jsonb NOT NULL DEFAULT '{}',
  source_profile_label text,
  source_profile_confidence text,
  latest_conversion_status text,
  outcome_feedback_json jsonb NOT NULL DEFAULT '{}',
  outcome_learning_version text
);

ALTER TABLE public.trip_market_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view market memory" ON public.trip_market_memory FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can insert market memory" ON public.trip_market_memory FOR INSERT TO authenticated WITH CHECK (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can update market memory" ON public.trip_market_memory FOR UPDATE TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access market memory" ON public.trip_market_memory FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_trip_market_memory_lead_id ON public.trip_market_memory (lead_id);
CREATE INDEX IF NOT EXISTS idx_trip_market_memory_benchmark_key ON public.trip_market_memory (benchmark_key);
CREATE INDEX IF NOT EXISTS idx_trip_market_memory_active ON public.trip_market_memory (active_for_benchmark) WHERE active_for_benchmark = true;

-- ============================================================
-- 4. lead_trip_intent_signals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_trip_intent_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  unified_case_id uuid,
  source_page text,
  audience_type text,
  contact_present boolean NOT NULL DEFAULT false,
  first_upload_at timestamptz,
  latest_upload_at timestamptz,
  contact_captured_at timestamptz,
  session_count integer NOT NULL DEFAULT 1,
  return_visit_count integer NOT NULL DEFAULT 0,
  total_public_page_views integer NOT NULL DEFAULT 0,
  pages_visited_json jsonb NOT NULL DEFAULT '[]',
  page_types_json jsonb NOT NULL DEFAULT '[]',
  time_spent_before_upload_seconds numeric,
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
  quote_size_band text NOT NULL DEFAULT 'unknown',
  trip_size_band text NOT NULL DEFAULT 'unknown',
  raw_signal_snapshot_json jsonb NOT NULL DEFAULT '{}',
  intent_score integer NOT NULL DEFAULT 0,
  conversion_probability_band text NOT NULL DEFAULT 'low',
  decision_stage text,
  likely_customer_motive text,
  recommended_pitch_angle text,
  intent_explanation text,
  intent_confidence text,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_trip_intent_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view intent signals" ON public.lead_trip_intent_signals FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can insert intent signals" ON public.lead_trip_intent_signals FOR INSERT TO authenticated WITH CHECK (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can update intent signals" ON public.lead_trip_intent_signals FOR UPDATE TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access intent signals" ON public.lead_trip_intent_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 5. lead_trip_outcomes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_trip_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  unified_case_id uuid,
  conversion_status text NOT NULL DEFAULT 'pending',
  conversion_date timestamptz,
  product_converted_json jsonb NOT NULL DEFAULT '[]',
  loan_amount numeric,
  booked_amount numeric,
  quote_amount_at_outcome numeric,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  traveler_profile_json jsonb NOT NULL DEFAULT '{}',
  source_page text,
  source_type text,
  owner_user_id uuid,
  pitch_angle_that_worked text,
  originally_anonymous boolean NOT NULL DEFAULT false,
  upload_count integer NOT NULL DEFAULT 0,
  itinerary_count integer NOT NULL DEFAULT 0,
  lead_classification_at_outcome text,
  intent_score_at_outcome integer NOT NULL DEFAULT 0,
  conversion_probability_band_at_outcome text,
  recommendation_outputs_json jsonb NOT NULL DEFAULT '{}',
  product_fit_snapshot_json jsonb NOT NULL DEFAULT '{}',
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
  outcome_learning_version text,
  last_synced_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_trip_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view trip outcomes" ON public.lead_trip_outcomes FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can insert trip outcomes" ON public.lead_trip_outcomes FOR INSERT TO authenticated WITH CHECK (is_ops_member(auth.uid()));
CREATE POLICY "Ops members can update trip outcomes" ON public.lead_trip_outcomes FOR UPDATE TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access trip outcomes" ON public.lead_trip_outcomes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_trip_outcomes_conversion ON public.lead_trip_outcomes (conversion_status);

-- ============================================================
-- 6. trip_destination_benchmarks (materialized by RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_destination_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_key text NOT NULL UNIQUE,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  duration_bucket text,
  traveler_bucket text,
  package_mode text,
  sample_count integer NOT NULL DEFAULT 0,
  weighted_sample_score numeric,
  min_total_price numeric,
  max_total_price numeric,
  avg_total_price numeric,
  median_total_price numeric,
  common_hotels_json jsonb NOT NULL DEFAULT '[]',
  common_inclusions_json jsonb NOT NULL DEFAULT '[]',
  common_exclusions_json jsonb NOT NULL DEFAULT '[]',
  product_fit_summary_json jsonb NOT NULL DEFAULT '{}',
  rebuilt_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_destination_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view benchmarks" ON public.trip_destination_benchmarks FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access benchmarks" ON public.trip_destination_benchmarks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 7. trip_hotel_frequency (materialized by RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_hotel_frequency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name text NOT NULL,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  frequency_count integer NOT NULL DEFAULT 0,
  avg_total_price numeric,
  rebuilt_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hotel_name, destination_city, domestic_or_international)
);

ALTER TABLE public.trip_hotel_frequency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view hotel frequency" ON public.trip_hotel_frequency FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access hotel frequency" ON public.trip_hotel_frequency FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 8. trip_similar_cases (materialized by RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_similar_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_case_id uuid NOT NULL,
  similar_case_id uuid NOT NULL,
  similarity_score numeric NOT NULL DEFAULT 0,
  similarity_reasons_json jsonb NOT NULL DEFAULT '[]',
  rebuilt_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unified_case_id, similar_case_id)
);

ALTER TABLE public.trip_similar_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view similar cases" ON public.trip_similar_cases FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));
CREATE POLICY "Service role full access similar cases" ON public.trip_similar_cases FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_trip_similar_cases_unified ON public.trip_similar_cases (unified_case_id);

-- ============================================================
-- 9. trip_outcome_learning_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_outcome_learning_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  unified_case_id uuid,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  payload_json jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE public.trip_outcome_learning_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access outcome queue" ON public.trip_outcome_learning_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Ops members can view outcome queue" ON public.trip_outcome_learning_queue FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));

-- ============================================================
-- 10. trip_destination_outcome_benchmarks (materialized by RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_destination_outcome_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_key text NOT NULL UNIQUE,
  sample_count integer NOT NULL DEFAULT 0,
  won_case_count integer NOT NULL DEFAULT 0,
  lost_case_count integer NOT NULL DEFAULT 0,
  partial_case_count integer NOT NULL DEFAULT 0,
  pending_case_count integer NOT NULL DEFAULT 0,
  conversion_rate_weighted numeric,
  anonymous_origin_win_rate numeric,
  benchmark_confidence_score numeric,
  common_winning_pitch_angles_json jsonb NOT NULL DEFAULT '[]',
  common_converted_products_json jsonb NOT NULL DEFAULT '[]',
  guidance_summary text,
  rebuilt_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_destination_outcome_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access outcome benchmarks" ON public.trip_destination_outcome_benchmarks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Ops members can view outcome benchmarks" ON public.trip_destination_outcome_benchmarks FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));

-- ============================================================
-- 11. trip_pitch_outcome_memory (materialized by RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_pitch_outcome_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_angle text NOT NULL,
  domestic_or_international text NOT NULL DEFAULT 'unknown',
  multi_itinerary_type text NOT NULL DEFAULT 'single_itinerary',
  sample_count integer NOT NULL DEFAULT 0,
  won_count integer NOT NULL DEFAULT 0,
  lost_count integer NOT NULL DEFAULT 0,
  partial_case_count integer NOT NULL DEFAULT 0,
  win_rate numeric,
  anonymous_origin_win_rate numeric,
  common_products_json jsonb NOT NULL DEFAULT '[]',
  rebuilt_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pitch_angle, domestic_or_international, multi_itinerary_type)
);

ALTER TABLE public.trip_pitch_outcome_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access pitch memory" ON public.trip_pitch_outcome_memory FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Ops members can view pitch memory" ON public.trip_pitch_outcome_memory FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));

-- ============================================================
-- 12. trip_product_outcome_memory (materialized by RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_product_outcome_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text NOT NULL,
  domestic_or_international text NOT NULL DEFAULT 'unknown',
  package_mode text NOT NULL DEFAULT 'unknown',
  sample_count integer NOT NULL DEFAULT 0,
  won_count integer NOT NULL DEFAULT 0,
  lost_count integer NOT NULL DEFAULT 0,
  partial_case_count integer NOT NULL DEFAULT 0,
  win_rate numeric,
  avg_loan_amount numeric,
  avg_booked_amount numeric,
  common_pitch_angles_json jsonb NOT NULL DEFAULT '[]',
  rebuilt_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_code, domestic_or_international, package_mode)
);

ALTER TABLE public.trip_product_outcome_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access product memory" ON public.trip_product_outcome_memory FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Ops members can view product memory" ON public.trip_product_outcome_memory FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));

-- ============================================================
-- 13. trip_intelligence_refresh_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_intelligence_refresh_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text
);

ALTER TABLE public.trip_intelligence_refresh_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access refresh queue" ON public.trip_intelligence_refresh_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Ops members can view refresh queue" ON public.trip_intelligence_refresh_queue FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));

-- ============================================================
-- 14. trip_post_analysis_enrichment_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_post_analysis_enrichment_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  unified_case_id uuid,
  enrichment_type text,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  payload_json jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE public.trip_post_analysis_enrichment_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access enrichment queue" ON public.trip_post_analysis_enrichment_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Ops members can view enrichment queue" ON public.trip_post_analysis_enrichment_queue FOR SELECT TO authenticated USING (is_ops_member(auth.uid()));

-- ============================================================
-- RPC: rebuild_trip_destination_benchmarks
-- ============================================================
CREATE OR REPLACE FUNCTION public.rebuild_trip_destination_benchmarks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trip_destination_benchmarks;

  INSERT INTO public.trip_destination_benchmarks (
    benchmark_key, destination_city, destination_country,
    domestic_or_international, duration_bucket, traveler_bucket, package_mode,
    sample_count, weighted_sample_score,
    min_total_price, max_total_price, avg_total_price, median_total_price,
    common_hotels_json, common_inclusions_json, common_exclusions_json,
    product_fit_summary_json, rebuilt_at
  )
  SELECT
    m.benchmark_key,
    mode() WITHIN GROUP (ORDER BY m.destination_city) AS destination_city,
    mode() WITHIN GROUP (ORDER BY m.destination_country) AS destination_country,
    mode() WITHIN GROUP (ORDER BY m.domestic_or_international) AS domestic_or_international,
    CASE
      WHEN avg(m.duration_days) IS NULL THEN 'unknown'
      WHEN avg(m.duration_days) <= 3 THEN 'short'
      WHEN avg(m.duration_days) <= 6 THEN 'medium'
      WHEN avg(m.duration_days) <= 10 THEN 'long'
      ELSE 'extended'
    END AS duration_bucket,
    CASE
      WHEN avg(m.traveller_count_total) IS NULL THEN 'unknown'
      WHEN avg(m.traveller_count_total) <= 1 THEN 'solo'
      WHEN avg(m.traveller_count_total) <= 2 THEN 'pair'
      WHEN avg(m.traveller_count_total) <= 4 THEN 'small_group'
      ELSE 'group'
    END AS traveler_bucket,
    mode() WITHIN GROUP (ORDER BY m.package_mode) AS package_mode,
    count(*)::integer AS sample_count,
    sum(m.benchmark_signal_weight) AS weighted_sample_score,
    min(m.total_price) AS min_total_price,
    max(m.total_price) AS max_total_price,
    avg(m.total_price) AS avg_total_price,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY m.total_price) AS median_total_price,
    '[]'::jsonb AS common_hotels_json,
    '[]'::jsonb AS common_inclusions_json,
    '[]'::jsonb AS common_exclusions_json,
    '{}'::jsonb AS product_fit_summary_json,
    now() AS rebuilt_at
  FROM public.trip_market_memory m
  WHERE m.active_for_benchmark = true
    AND m.benchmark_key IS NOT NULL
  GROUP BY m.benchmark_key;
END;
$$;

-- ============================================================
-- RPC: rebuild_trip_hotel_frequency
-- ============================================================
CREATE OR REPLACE FUNCTION public.rebuild_trip_hotel_frequency()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trip_hotel_frequency;

  INSERT INTO public.trip_hotel_frequency (
    hotel_name, destination_city, destination_country,
    domestic_or_international, frequency_count, avg_total_price, rebuilt_at
  )
  SELECT
    hotel_elem::text AS hotel_name,
    mode() WITHIN GROUP (ORDER BY m.destination_city) AS destination_city,
    mode() WITHIN GROUP (ORDER BY m.destination_country) AS destination_country,
    mode() WITHIN GROUP (ORDER BY m.domestic_or_international) AS domestic_or_international,
    count(*)::integer AS frequency_count,
    avg(m.total_price) AS avg_total_price,
    now() AS rebuilt_at
  FROM public.trip_market_memory m,
       jsonb_array_elements_text(m.hotel_names_json) AS hotel_elem
  WHERE m.active_for_benchmark = true
  GROUP BY hotel_elem;
END;
$$;

-- ============================================================
-- RPC: rebuild_trip_similar_cases
-- ============================================================
CREATE OR REPLACE FUNCTION public.rebuild_trip_similar_cases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trip_similar_cases;

  INSERT INTO public.trip_similar_cases (
    unified_case_id, similar_case_id, similarity_score, similarity_reasons_json, rebuilt_at
  )
  SELECT
    a.unified_case_id,
    b.unified_case_id AS similar_case_id,
    (
      CASE WHEN a.benchmark_key = b.benchmark_key AND a.benchmark_key IS NOT NULL THEN 40 ELSE 0 END
      + CASE WHEN a.destination_city = b.destination_city AND a.destination_city IS NOT NULL THEN 20 ELSE 0 END
      + CASE WHEN a.domestic_or_international = b.domestic_or_international THEN 10 ELSE 0 END
      + CASE WHEN a.package_mode = b.package_mode THEN 10 ELSE 0 END
      + CASE WHEN abs(coalesce(a.total_price, 0) - coalesce(b.total_price, 0)) < greatest(coalesce(a.total_price, 1) * 0.3, 10000) THEN 15 ELSE 0 END
      + CASE WHEN abs(coalesce(a.duration_days, 0) - coalesce(b.duration_days, 0)) <= 2 THEN 5 ELSE 0 END
    )::numeric AS similarity_score,
    '[]'::jsonb AS similarity_reasons_json,
    now() AS rebuilt_at
  FROM public.trip_market_memory a
  JOIN public.trip_market_memory b ON a.unified_case_id < b.unified_case_id
  WHERE a.active_for_benchmark = true AND b.active_for_benchmark = true
    AND (
      (a.benchmark_key = b.benchmark_key AND a.benchmark_key IS NOT NULL)
      OR (a.destination_city = b.destination_city AND a.destination_city IS NOT NULL)
      OR (a.domestic_or_international = b.domestic_or_international AND a.package_mode = b.package_mode)
    )
  ORDER BY similarity_score DESC
  LIMIT 5000;
END;
$$;

-- ============================================================
-- RPC: rebuild_trip_destination_outcome_benchmarks
-- ============================================================
CREATE OR REPLACE FUNCTION public.rebuild_trip_destination_outcome_benchmarks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trip_destination_outcome_benchmarks;

  INSERT INTO public.trip_destination_outcome_benchmarks (
    benchmark_key, sample_count,
    won_case_count, lost_case_count, partial_case_count, pending_case_count,
    conversion_rate_weighted, anonymous_origin_win_rate,
    benchmark_confidence_score,
    common_winning_pitch_angles_json, common_converted_products_json,
    guidance_summary, rebuilt_at
  )
  SELECT
    o.destination_city || '|' || coalesce(o.domestic_or_international, 'unknown') AS benchmark_key,
    count(*)::integer AS sample_count,
    count(*) FILTER (WHERE o.conversion_status = 'won')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'lost')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'partially_converted')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'pending')::integer,
    CASE WHEN count(*) > 0 THEN
      (sum(CASE WHEN o.conversion_status = 'won' THEN o.learning_weight ELSE 0 END) / nullif(sum(o.learning_weight), 0))
    ELSE NULL END AS conversion_rate_weighted,
    CASE WHEN count(*) FILTER (WHERE o.originally_anonymous = true) > 0 THEN
      count(*) FILTER (WHERE o.originally_anonymous = true AND o.conversion_status = 'won')::numeric /
      nullif(count(*) FILTER (WHERE o.originally_anonymous = true), 0)
    ELSE NULL END AS anonymous_origin_win_rate,
    least(100, count(*) * 15 + sum(o.benchmark_confidence_weight))::numeric AS benchmark_confidence_score,
    '[]'::jsonb AS common_winning_pitch_angles_json,
    '[]'::jsonb AS common_converted_products_json,
    NULL AS guidance_summary,
    now() AS rebuilt_at
  FROM public.lead_trip_outcomes o
  WHERE o.active_for_learning = true
    AND o.destination_city IS NOT NULL
  GROUP BY o.destination_city, o.domestic_or_international;
END;
$$;

-- ============================================================
-- RPC: rebuild_trip_pitch_outcome_memory
-- ============================================================
CREATE OR REPLACE FUNCTION public.rebuild_trip_pitch_outcome_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trip_pitch_outcome_memory;

  INSERT INTO public.trip_pitch_outcome_memory (
    pitch_angle, domestic_or_international, multi_itinerary_type,
    sample_count, won_count, lost_count, partial_case_count,
    win_rate, anonymous_origin_win_rate, common_products_json, rebuilt_at
  )
  SELECT
    coalesce(o.pitch_angle_that_worked, 'unknown') AS pitch_angle,
    coalesce(o.domestic_or_international, 'unknown') AS domestic_or_international,
    coalesce(o.multi_itinerary_type, 'single_itinerary') AS multi_itinerary_type,
    count(*)::integer AS sample_count,
    count(*) FILTER (WHERE o.conversion_status = 'won')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'lost')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'partially_converted')::integer,
    CASE WHEN count(*) > 0 THEN
      count(*) FILTER (WHERE o.conversion_status = 'won')::numeric / count(*)
    ELSE NULL END AS win_rate,
    CASE WHEN count(*) FILTER (WHERE o.originally_anonymous = true) > 0 THEN
      count(*) FILTER (WHERE o.originally_anonymous = true AND o.conversion_status = 'won')::numeric /
      nullif(count(*) FILTER (WHERE o.originally_anonymous = true), 0)
    ELSE NULL END AS anonymous_origin_win_rate,
    '[]'::jsonb AS common_products_json,
    now() AS rebuilt_at
  FROM public.lead_trip_outcomes o
  WHERE o.active_for_learning = true
  GROUP BY
    coalesce(o.pitch_angle_that_worked, 'unknown'),
    coalesce(o.domestic_or_international, 'unknown'),
    coalesce(o.multi_itinerary_type, 'single_itinerary');
END;
$$;

-- ============================================================
-- RPC: rebuild_trip_product_outcome_memory
-- ============================================================
CREATE OR REPLACE FUNCTION public.rebuild_trip_product_outcome_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.trip_product_outcome_memory;

  INSERT INTO public.trip_product_outcome_memory (
    product_code, domestic_or_international, package_mode,
    sample_count, won_count, lost_count, partial_case_count,
    win_rate, avg_loan_amount, avg_booked_amount,
    common_pitch_angles_json, rebuilt_at
  )
  SELECT
    product_elem::text AS product_code,
    coalesce(o.domestic_or_international, 'unknown') AS domestic_or_international,
    coalesce((o.traveler_profile_json ->> 'package_mode'), 'unknown') AS package_mode,
    count(*)::integer AS sample_count,
    count(*) FILTER (WHERE o.conversion_status = 'won')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'lost')::integer,
    count(*) FILTER (WHERE o.conversion_status = 'partially_converted')::integer,
    CASE WHEN count(*) > 0 THEN
      count(*) FILTER (WHERE o.conversion_status = 'won')::numeric / count(*)
    ELSE NULL END AS win_rate,
    avg(o.loan_amount) FILTER (WHERE o.loan_amount IS NOT NULL) AS avg_loan_amount,
    avg(o.booked_amount) FILTER (WHERE o.booked_amount IS NOT NULL) AS avg_booked_amount,
    '[]'::jsonb AS common_pitch_angles_json,
    now() AS rebuilt_at
  FROM public.lead_trip_outcomes o,
       jsonb_array_elements_text(o.product_converted_json) AS product_elem
  WHERE o.active_for_learning = true
  GROUP BY
    product_elem::text,
    coalesce(o.domestic_or_international, 'unknown'),
    coalesce((o.traveler_profile_json ->> 'package_mode'), 'unknown');
END;
$$;
