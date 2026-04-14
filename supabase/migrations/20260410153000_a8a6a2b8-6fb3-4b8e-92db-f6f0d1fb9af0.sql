DO $$
BEGIN
  CREATE TYPE public.trip_lead_classification AS ENUM ('sales_lead', 'research_lead', 'noise');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE public.itinerary_analysis
  ADD COLUMN IF NOT EXISTS package_mode text,
  ADD COLUMN IF NOT EXISTS advisory_summary text,
  ADD COLUMN IF NOT EXISTS advisory_insights_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS traveler_questions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seller_questions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_inputs_needed_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unlockable_modules_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extracted_completeness_score integer,
  ADD COLUMN IF NOT EXISTS decision_flags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enrichment_status_json jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.lead_trip_brains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  latest_analysis_id uuid REFERENCES public.itinerary_analysis(id) ON DELETE SET NULL,
  source_page text,
  audience_type public.audience_type,
  lead_classification public.trip_lead_classification NOT NULL DEFAULT 'research_lead',
  contact_present boolean NOT NULL DEFAULT false,
  analysis_count integer NOT NULL DEFAULT 0 CHECK (analysis_count >= 0),
  attachment_count integer NOT NULL DEFAULT 0 CHECK (attachment_count >= 0),
  parsing_confidence text,
  extracted_completeness_score integer,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  travel_start_date date,
  travel_end_date date,
  duration_days integer,
  duration_nights integer,
  total_price numeric,
  price_per_person numeric,
  currency text,
  traveller_count_total integer,
  adults_count integer,
  children_count integer,
  infants_count integer,
  travel_agent_name text,
  customer_name text,
  package_mode text NOT NULL DEFAULT 'unknown',
  hotel_names_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  airline_names_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  sectors_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_destinations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  inclusions_text text,
  exclusions_text text,
  missing_fields_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  extraction_warnings_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicting_fields_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  decision_flags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  traveler_questions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  seller_questions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  unlockable_modules_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  traveler_output_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  unified_summary text,
  benchmark_key text,
  benchmark_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  similar_case_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  product_fit_flags_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  traveler_intelligence_version text NOT NULL DEFAULT 'traveler-intelligence-v1',
  ops_copilot_version text NOT NULL DEFAULT 'ops-copilot-v1',
  benchmark_engine_version text NOT NULL DEFAULT 'benchmark-engine-v1',
  intelligence_refreshed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lead_ops_copilot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  unified_case_id uuid NOT NULL REFERENCES public.lead_trip_brains(id) ON DELETE CASCADE,
  lead_classification public.trip_lead_classification NOT NULL DEFAULT 'research_lead',
  recommendation_summary text,
  ops_summary text,
  what_looks_wrong_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  sankash_opportunity_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  call_talking_points_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  pitch_sequence_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_follow_up text,
  benchmark_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  similar_trip_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  product_fit_flags_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  next_best_action_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  urgency_score integer NOT NULL DEFAULT 0 CHECK (urgency_score BETWEEN 0 AND 100),
  intent_score integer NOT NULL DEFAULT 0 CHECK (intent_score BETWEEN 0 AND 100),
  lead_quality_score integer NOT NULL DEFAULT 0 CHECK (lead_quality_score BETWEEN 0 AND 100),
  traveler_trust_score integer NOT NULL DEFAULT 0 CHECK (traveler_trust_score BETWEEN 0 AND 100),
  ops_copilot_version text NOT NULL DEFAULT 'ops-copilot-v1',
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_market_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_case_id uuid NOT NULL UNIQUE REFERENCES public.lead_trip_brains(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  source_page text,
  audience_type public.audience_type,
  lead_classification public.trip_lead_classification NOT NULL DEFAULT 'research_lead',
  contact_present boolean NOT NULL DEFAULT false,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  duration_days integer,
  duration_nights integer,
  travel_start_date date,
  travel_end_date date,
  traveller_count_total integer,
  adults_count integer,
  children_count integer,
  infants_count integer,
  hotel_names_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  airline_names_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  sectors_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  package_mode text NOT NULL DEFAULT 'unknown',
  itinerary_archetype text,
  benchmark_key text,
  total_price numeric,
  price_per_person numeric,
  currency text,
  inclusions_tags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  exclusions_tags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_fields_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  parsing_confidence text,
  extracted_completeness_score integer,
  product_fit_flags_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendation_summary text,
  outcome public.lead_outcome,
  active_for_benchmark boolean NOT NULL DEFAULT true,
  benchmark_engine_version text NOT NULL DEFAULT 'benchmark-engine-v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_destination_benchmarks (
  benchmark_key text PRIMARY KEY,
  destination_city text,
  destination_country text,
  domestic_or_international text,
  duration_bucket text,
  traveler_bucket text,
  package_mode text,
  sample_count integer NOT NULL DEFAULT 0,
  min_total_price numeric,
  max_total_price numeric,
  avg_total_price numeric,
  median_total_price numeric,
  common_hotels_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  common_inclusions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  common_exclusions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  product_fit_summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_hotel_frequency (
  destination_key text NOT NULL,
  hotel_name text NOT NULL,
  case_count integer NOT NULL DEFAULT 0,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (destination_key, hotel_name)
);

CREATE TABLE IF NOT EXISTS public.trip_similar_cases (
  unified_case_id uuid NOT NULL REFERENCES public.lead_trip_brains(id) ON DELETE CASCADE,
  similar_case_id uuid NOT NULL REFERENCES public.lead_trip_brains(id) ON DELETE CASCADE,
  similarity_score numeric NOT NULL DEFAULT 0,
  similarity_reasons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (unified_case_id, similar_case_id),
  CONSTRAINT trip_similar_cases_not_self CHECK (unified_case_id <> similar_case_id)
);

CREATE TABLE IF NOT EXISTS public.trip_intelligence_refresh_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
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
  CONSTRAINT trip_intelligence_refresh_queue_status_check CHECK (status IN ('pending', 'processing', 'done', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_lead_trip_brains_lead_classification ON public.lead_trip_brains(lead_classification);
CREATE INDEX IF NOT EXISTS idx_trip_market_memory_benchmark_key ON public.trip_market_memory(benchmark_key);
CREATE INDEX IF NOT EXISTS idx_trip_market_memory_destination ON public.trip_market_memory(destination_city, destination_country);
CREATE INDEX IF NOT EXISTS idx_trip_similar_cases_case_id ON public.trip_similar_cases(unified_case_id);
CREATE INDEX IF NOT EXISTS idx_trip_refresh_queue_status_due_at ON public.trip_intelligence_refresh_queue(status, due_at);

ALTER TABLE public.lead_trip_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_ops_copilot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_market_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_destination_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_hotel_frequency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_similar_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_intelligence_refresh_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Role-scoped trip brain visibility" ON public.lead_trip_brains;
CREATE POLICY "Role-scoped trip brain visibility"
ON public.lead_trip_brains
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

DROP POLICY IF EXISTS "Role-scoped ops copilot visibility" ON public.lead_ops_copilot;
CREATE POLICY "Role-scoped ops copilot visibility"
ON public.lead_ops_copilot
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

DROP POLICY IF EXISTS "Role-scoped market memory visibility" ON public.trip_market_memory;
CREATE POLICY "Role-scoped market memory visibility"
ON public.trip_market_memory
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

DROP POLICY IF EXISTS "Ops can view destination benchmarks" ON public.trip_destination_benchmarks;
CREATE POLICY "Ops can view destination benchmarks"
ON public.trip_destination_benchmarks
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP POLICY IF EXISTS "Ops can view hotel frequency" ON public.trip_hotel_frequency;
CREATE POLICY "Ops can view hotel frequency"
ON public.trip_hotel_frequency
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP POLICY IF EXISTS "Role-scoped similar cases visibility" ON public.trip_similar_cases;
CREATE POLICY "Role-scoped similar cases visibility"
ON public.trip_similar_cases
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lead_trip_brains b
    JOIN public.leads l ON l.id = b.lead_id
    WHERE b.id = unified_case_id
      AND public.can_view_lead(auth.uid(), l.assigned_to)
  )
);

DROP POLICY IF EXISTS "Ops can view trip refresh queue" ON public.trip_intelligence_refresh_queue;
CREATE POLICY "Ops can view trip refresh queue"
ON public.trip_intelligence_refresh_queue
FOR SELECT
TO authenticated
USING (public.is_ops_member(auth.uid()));

DROP TRIGGER IF EXISTS update_lead_trip_brains_updated_at ON public.lead_trip_brains;
CREATE TRIGGER update_lead_trip_brains_updated_at
BEFORE UPDATE ON public.lead_trip_brains
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_ops_copilot_updated_at ON public.lead_ops_copilot;
CREATE TRIGGER update_lead_ops_copilot_updated_at
BEFORE UPDATE ON public.lead_ops_copilot
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_market_memory_updated_at ON public.trip_market_memory;
CREATE TRIGGER update_trip_market_memory_updated_at
BEFORE UPDATE ON public.trip_market_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_similar_cases_updated_at ON public.trip_similar_cases;
CREATE TRIGGER update_trip_similar_cases_updated_at
BEFORE UPDATE ON public.trip_similar_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_refresh_queue_updated_at ON public.trip_intelligence_refresh_queue;
CREATE TRIGGER update_trip_refresh_queue_updated_at
BEFORE UPDATE ON public.trip_intelligence_refresh_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.trip_duration_bucket(_days integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _days IS NULL OR _days <= 0 THEN 'unknown'
    WHEN _days <= 3 THEN 'short'
    WHEN _days <= 6 THEN 'medium'
    WHEN _days <= 10 THEN 'long'
    ELSE 'extended'
  END
$$;

CREATE OR REPLACE FUNCTION public.trip_traveler_bucket(_count integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _count IS NULL OR _count <= 0 THEN 'unknown'
    WHEN _count = 1 THEN 'solo'
    WHEN _count = 2 THEN 'pair'
    WHEN _count <= 4 THEN 'small_group'
    ELSE 'group'
  END
$$;

CREATE OR REPLACE FUNCTION public.trip_destination_key(_city text, _country text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(trim(coalesce(nullif(_city, ''), nullif(_country, ''), 'unknown')))
$$;

CREATE OR REPLACE FUNCTION public.queue_trip_intelligence_refresh(
  _lead_id uuid,
  _reason text,
  _payload jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_intelligence_refresh_queue (lead_id, reason, payload_json, status, requested_at, due_at, processed_at, last_error)
  VALUES (_lead_id, _reason, coalesce(_payload, '{}'::jsonb), 'pending', now(), now(), NULL, NULL)
  ON CONFLICT (lead_id)
  DO UPDATE
    SET reason = EXCLUDED.reason,
        payload_json = public.trip_intelligence_refresh_queue.payload_json || EXCLUDED.payload_json,
        status = 'pending',
        requested_at = now(),
        due_at = now(),
        processed_at = NULL,
        last_error = NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_trip_refresh_from_lead_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.queue_trip_intelligence_refresh(
      NEW.id,
      'lead_inserted',
      jsonb_build_object('source', 'leads', 'event', TG_OP)
    );
    RETURN NEW;
  END IF;

  IF
    NEW.mobile_number IS DISTINCT FROM OLD.mobile_number OR
    NEW.email IS DISTINCT FROM OLD.email OR
    NEW.full_name IS DISTINCT FROM OLD.full_name OR
    NEW.status IS DISTINCT FROM OLD.status OR
    NEW.outcome IS DISTINCT FROM OLD.outcome OR
    NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR
    NEW.next_follow_up_at IS DISTINCT FROM OLD.next_follow_up_at OR
    NEW.quote_amount IS DISTINCT FROM OLD.quote_amount OR
    NEW.metadata_json IS DISTINCT FROM OLD.metadata_json
  THEN
    PERFORM public.queue_trip_intelligence_refresh(
      NEW.id,
      'lead_updated',
      jsonb_build_object('source', 'leads', 'event', TG_OP)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_trip_refresh_from_lead_change ON public.leads;
CREATE TRIGGER trigger_trip_refresh_from_lead_change
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_trip_refresh_from_lead_change();

CREATE OR REPLACE FUNCTION public.handle_trip_refresh_from_attachment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.queue_trip_intelligence_refresh(
    NEW.lead_id,
    'attachment_uploaded',
    jsonb_build_object('source', 'lead_attachments', 'attachment_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_trip_refresh_from_attachment ON public.lead_attachments;
CREATE TRIGGER trigger_trip_refresh_from_attachment
AFTER INSERT ON public.lead_attachments
FOR EACH ROW EXECUTE FUNCTION public.handle_trip_refresh_from_attachment();

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
      min(total_price) AS min_total_price,
      max(total_price) AS max_total_price,
      avg(total_price) AS avg_total_price,
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
      count(*) AS use_count,
      row_number() OVER (PARTITION BY tmm.benchmark_key ORDER BY count(*) DESC, hotel_name) AS rn
    FROM eligible tmm
    CROSS JOIN LATERAL jsonb_array_elements_text(tmm.hotel_names_json) hotel_name
    WHERE tmm.benchmark_key IS NOT NULL
    GROUP BY tmm.benchmark_key, hotel_name
  ),
  inclusion_counts AS (
    SELECT
      tmm.benchmark_key,
      tag,
      count(*) AS use_count,
      row_number() OVER (PARTITION BY tmm.benchmark_key ORDER BY count(*) DESC, tag) AS rn
    FROM eligible tmm
    CROSS JOIN LATERAL jsonb_array_elements_text(tmm.inclusions_tags_json) tag
    WHERE tmm.benchmark_key IS NOT NULL
    GROUP BY tmm.benchmark_key, tag
  ),
  exclusion_counts AS (
    SELECT
      tmm.benchmark_key,
      tag,
      count(*) AS use_count,
      row_number() OVER (PARTITION BY tmm.benchmark_key ORDER BY count(*) DESC, tag) AS rn
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
        'rebuild_candidate_cases', count(*) FILTER (WHERE coalesce((product_fit_flags_json ->> 'rebuild_candidate')::boolean, false))
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
    bench.min_total_price,
    bench.max_total_price,
    bench.avg_total_price,
    bench.median_total_price,
    coalesce((
      SELECT jsonb_agg(hotel_name ORDER BY use_count DESC, hotel_name)
      FROM hotel_counts
      WHERE benchmark_key = bench.benchmark_key AND rn <= 5
    ), '[]'::jsonb) AS common_hotels_json,
    coalesce((
      SELECT jsonb_agg(tag ORDER BY use_count DESC, tag)
      FROM inclusion_counts
      WHERE benchmark_key = bench.benchmark_key AND rn <= 6
    ), '[]'::jsonb) AS common_inclusions_json,
    coalesce((
      SELECT jsonb_agg(tag ORDER BY use_count DESC, tag)
      FROM exclusion_counts
      WHERE benchmark_key = bench.benchmark_key AND rn <= 6
    ), '[]'::jsonb) AS common_exclusions_json,
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

  INSERT INTO public.trip_hotel_frequency (destination_key, hotel_name, case_count, last_seen_at)
  SELECT
    public.trip_destination_key(destination_city, destination_country) AS destination_key,
    hotel_name,
    count(*) AS case_count,
    max(last_seen_at) AS last_seen_at
  FROM public.trip_market_memory
  CROSS JOIN LATERAL jsonb_array_elements_text(hotel_names_json) hotel_name
  WHERE active_for_benchmark = true
    AND coalesce(lead_classification::text, '') <> 'noise'
  GROUP BY public.trip_destination_key(destination_city, destination_country), hotel_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.rebuild_trip_similar_cases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE TABLE public.trip_similar_cases;

  WITH eligible AS (
    SELECT *
    FROM public.trip_market_memory
    WHERE active_for_benchmark = true
      AND coalesce(lead_classification::text, '') <> 'noise'
  ),
  pairs AS (
    SELECT
      a.unified_case_id,
      b.unified_case_id AS similar_case_id,
      (
        CASE
          WHEN a.destination_city IS NOT NULL AND b.destination_city IS NOT NULL
            AND lower(a.destination_city) = lower(b.destination_city) THEN 35
          WHEN a.destination_country IS NOT NULL AND b.destination_country IS NOT NULL
            AND lower(a.destination_country) = lower(b.destination_country) THEN 20
          ELSE 0
        END
        + CASE WHEN coalesce(a.package_mode, 'unknown') = coalesce(b.package_mode, 'unknown') THEN 15 ELSE 0 END
        + CASE WHEN public.trip_duration_bucket(a.duration_days) = public.trip_duration_bucket(b.duration_days) THEN 10 ELSE 0 END
        + CASE WHEN public.trip_traveler_bucket(a.traveller_count_total) = public.trip_traveler_bucket(b.traveller_count_total) THEN 10 ELSE 0 END
        + CASE WHEN coalesce(a.domestic_or_international, 'unknown') = coalesce(b.domestic_or_international, 'unknown') THEN 10 ELSE 0 END
        + CASE
            WHEN a.total_price IS NOT NULL AND b.total_price IS NOT NULL
              THEN greatest(
                0,
                20 - least(
                  20,
                  abs(a.total_price - b.total_price) / greatest(a.total_price, b.total_price, 1) * 20
                )
              )
            ELSE 0
          END
      )::numeric AS similarity_score,
      jsonb_strip_nulls(
        jsonb_build_array(
          CASE WHEN a.destination_city IS NOT NULL AND b.destination_city IS NOT NULL AND lower(a.destination_city) = lower(b.destination_city)
            THEN jsonb_build_object('reason', 'same_destination_city', 'value', a.destination_city) END,
          CASE WHEN a.destination_country IS NOT NULL AND b.destination_country IS NOT NULL AND lower(a.destination_country) = lower(b.destination_country)
            THEN jsonb_build_object('reason', 'same_destination_country', 'value', a.destination_country) END,
          CASE WHEN coalesce(a.package_mode, 'unknown') = coalesce(b.package_mode, 'unknown')
            THEN jsonb_build_object('reason', 'same_package_mode', 'value', a.package_mode) END,
          CASE WHEN public.trip_duration_bucket(a.duration_days) = public.trip_duration_bucket(b.duration_days)
            THEN jsonb_build_object('reason', 'same_duration_bucket', 'value', public.trip_duration_bucket(a.duration_days)) END,
          CASE WHEN public.trip_traveler_bucket(a.traveller_count_total) = public.trip_traveler_bucket(b.traveller_count_total)
            THEN jsonb_build_object('reason', 'same_traveler_bucket', 'value', public.trip_traveler_bucket(a.traveller_count_total)) END
        )
      ) AS similarity_reasons_json
    FROM eligible a
    JOIN eligible b ON a.unified_case_id <> b.unified_case_id
    WHERE
      (
        (a.destination_city IS NOT NULL AND b.destination_city IS NOT NULL AND lower(a.destination_city) = lower(b.destination_city))
        OR (a.destination_country IS NOT NULL AND b.destination_country IS NOT NULL AND lower(a.destination_country) = lower(b.destination_country))
        OR (a.benchmark_key IS NOT NULL AND a.benchmark_key = b.benchmark_key)
      )
  ),
  ranked AS (
    SELECT
      *,
      row_number() OVER (PARTITION BY unified_case_id ORDER BY similarity_score DESC, similar_case_id) AS rn
    FROM pairs
    WHERE similarity_score >= 40
  )
  INSERT INTO public.trip_similar_cases (unified_case_id, similar_case_id, similarity_score, similarity_reasons_json, created_at, updated_at)
  SELECT unified_case_id, similar_case_id, similarity_score, similarity_reasons_json, now(), now()
  FROM ranked
  WHERE rn <= 5;
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
    OR ops_copilot_version <> 'ops-copilot-v1'
    OR benchmark_engine_version <> 'benchmark-engine-v1'
  ON CONFLICT (lead_id)
  DO UPDATE
    SET reason = EXCLUDED.reason,
        payload_json = public.trip_intelligence_refresh_queue.payload_json || EXCLUDED.payload_json,
        status = 'pending',
        requested_at = now(),
        due_at = now(),
        processed_at = NULL;

  PERFORM public.rebuild_trip_destination_benchmarks();
  PERFORM public.rebuild_trip_hotel_frequency();
  PERFORM public.rebuild_trip_similar_cases();
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $outer$
DECLARE
  existing_job_id bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    SELECT jobid INTO existing_job_id
    FROM cron.job
    WHERE jobname = 'daily_trip_intelligence_refresh'
    LIMIT 1;

    IF existing_job_id IS NOT NULL THEN
      PERFORM cron.unschedule(existing_job_id);
    END IF;

    PERFORM cron.schedule(
      'daily_trip_intelligence_refresh',
      '30 2 * * *',
      $job$SELECT public.run_daily_trip_intelligence_refresh();$job$
    );
  END IF;
END;
$outer$;
