-- Add multi-file and enhanced extraction columns to itinerary_analysis
ALTER TABLE public.itinerary_analysis
  ADD COLUMN IF NOT EXISTS file_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS file_names_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extraction_warnings_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS flight_departure_time text,
  ADD COLUMN IF NOT EXISTS flight_arrival_time text,
  ADD COLUMN IF NOT EXISTS hotel_check_in text,
  ADD COLUMN IF NOT EXISTS hotel_check_out text,
  ADD COLUMN IF NOT EXISTS confidence_notes text;