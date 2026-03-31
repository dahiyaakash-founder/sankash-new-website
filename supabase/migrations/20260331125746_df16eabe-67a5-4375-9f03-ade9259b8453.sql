-- Create itinerary_analysis table for parsed itinerary/quote data
CREATE TABLE public.itinerary_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  attachment_id uuid REFERENCES public.lead_attachments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_audience text,
  raw_text text,
  parsing_confidence text DEFAULT 'low',
  domestic_or_international text,
  destination_country text,
  destination_city text,
  travel_start_date text,
  travel_end_date text,
  duration_nights integer,
  duration_days integer,
  total_price numeric,
  price_per_person numeric,
  currency text DEFAULT 'INR',
  traveller_count_total integer,
  adults_count integer,
  children_count integer,
  travel_agent_name text,
  customer_name text,
  emi_candidate boolean DEFAULT false,
  insurance_candidate boolean DEFAULT false,
  pg_candidate boolean DEFAULT false,
  hotel_names_json jsonb DEFAULT '[]'::jsonb,
  airline_names_json jsonb DEFAULT '[]'::jsonb,
  sectors_json jsonb DEFAULT '[]'::jsonb,
  additional_destinations_json jsonb DEFAULT '[]'::jsonb,
  inclusions_text text,
  exclusions_text text,
  visa_mentioned boolean,
  insurance_mentioned boolean,
  infants_count integer,
  missing_fields_json jsonb DEFAULT '[]'::jsonb,
  extracted_snippets_json jsonb DEFAULT '[]'::jsonb,
  extracted_fields_json jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.itinerary_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view analyses"
  ON public.itinerary_analysis FOR SELECT TO authenticated
  USING (public.is_ops_member(auth.uid()));

CREATE POLICY "Ops members can insert analyses"
  ON public.itinerary_analysis FOR INSERT TO authenticated
  WITH CHECK (public.is_ops_member(auth.uid()));

CREATE POLICY "Ops members can update analyses"
  ON public.itinerary_analysis FOR UPDATE TO authenticated
  USING (public.is_ops_member(auth.uid()));

CREATE POLICY "Anon can insert analyses"
  ON public.itinerary_analysis FOR INSERT TO anon
  WITH CHECK (true);

CREATE TRIGGER update_itinerary_analysis_updated_at
  BEFORE UPDATE ON public.itinerary_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_itinerary_analysis_lead_id ON public.itinerary_analysis(lead_id);
CREATE INDEX idx_itinerary_analysis_attachment_id ON public.itinerary_analysis(attachment_id);