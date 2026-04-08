/**
 * Itinerary analysis service — triggers AI extraction and fetches results.
 * Supports both single-file (legacy) and multi-file vision pipeline.
 */
import { supabase } from "@/integrations/supabase/client";

export interface ItineraryAnalysis {
  id: string;
  lead_id: string;
  attachment_id: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by_audience: string | null;
  raw_text: string | null;
  parsing_confidence: string;
  domestic_or_international: string | null;
  destination_country: string | null;
  destination_city: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  duration_nights: number | null;
  duration_days: number | null;
  total_price: number | null;
  price_per_person: number | null;
  currency: string;
  traveller_count_total: number | null;
  adults_count: number | null;
  children_count: number | null;
  infants_count: number | null;
  travel_agent_name: string | null;
  customer_name: string | null;
  hotel_names_json: string[];
  airline_names_json: string[];
  sectors_json: string[];
  additional_destinations_json: string[];
  inclusions_text: string | null;
  exclusions_text: string | null;
  visa_mentioned: boolean | null;
  insurance_mentioned: boolean | null;
  emi_candidate: boolean;
  insurance_candidate: boolean;
  pg_candidate: boolean;
  missing_fields_json: string[];
  extracted_snippets_json: string[];
  extracted_fields_json: Record<string, unknown>;
  // New multi-file fields
  file_count: number;
  file_names_json: string[];
  extraction_warnings_json: string[];
  flight_departure_time: string | null;
  flight_arrival_time: string | null;
  hotel_check_in: string | null;
  hotel_check_out: string | null;
  confidence_notes: string | null;
}

/** Fetch existing analysis for a lead */
export async function fetchItineraryAnalysis(leadId: string): Promise<ItineraryAnalysis | null> {
  const { data, error } = await supabase
    .from("itinerary_analysis" as any)
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ItineraryAnalysis | null;
}

export interface FileInput {
  file_url: string;
  file_name: string;
}

/** Trigger analysis via the edge function — supports multi-file */
export async function triggerItineraryAnalysis(params: {
  lead_id: string;
  attachment_id?: string;
  // Legacy single-file (still supported)
  file_url?: string;
  file_name?: string;
  // Multi-file
  files?: FileInput[];
  audience_type?: string;
}): Promise<ItineraryAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-itinerary", {
    body: params,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.analysis as ItineraryAnalysis;
}
