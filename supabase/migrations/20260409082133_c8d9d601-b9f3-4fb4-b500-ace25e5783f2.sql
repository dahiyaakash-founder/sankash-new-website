
ALTER TABLE public.itinerary_analysis
  ADD COLUMN IF NOT EXISTS package_mode text,
  ADD COLUMN IF NOT EXISTS extracted_completeness_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traveler_questions_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seller_questions_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS advisory_insights_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_inputs_needed_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unlockable_modules_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enrichment_status_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS decision_flags_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS advisory_summary text;
