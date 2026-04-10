import { supabase } from "@/integrations/supabase/client";

export type LeadClassification = "sales_lead" | "research_lead" | "noise";

export interface LeadTripBrain {
  id: string;
  lead_id: string;
  latest_analysis_id: string | null;
  source_page: string | null;
  audience_type: string | null;
  lead_classification: LeadClassification;
  contact_present: boolean;
  analysis_count: number;
  attachment_count: number;
  parsing_confidence: string | null;
  extracted_completeness_score: number | null;
  destination_city: string | null;
  destination_country: string | null;
  domestic_or_international: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  total_price: number | null;
  price_per_person: number | null;
  currency: string | null;
  traveller_count_total: number | null;
  adults_count: number | null;
  children_count: number | null;
  infants_count: number | null;
  travel_agent_name: string | null;
  customer_name: string | null;
  package_mode: string;
  hotel_names_json: string[];
  airline_names_json: string[];
  sectors_json: string[];
  additional_destinations_json: string[];
  inclusions_text: string | null;
  exclusions_text: string | null;
  missing_fields_json: string[];
  extraction_warnings_json: string[];
  conflicting_fields_json: Array<{ field: string; chosen: string; alternatives: string[] }>;
  decision_flags_json: Array<{ code: string; title: string; detail: string; severity: string; active: boolean }>;
  traveler_questions_json: Array<{ code: string; question: string; why: string; priority: string }>;
  seller_questions_json: Array<{ code: string; question: string; why: string; priority: string }>;
  unlockable_modules_json: Array<{ code: string; label: string; status: string; reason: string }>;
  traveler_output_json: Record<string, unknown>;
  unified_summary: string | null;
  benchmark_key: string | null;
  benchmark_summary_json: Record<string, unknown>;
  similar_case_summary_json: Record<string, unknown>;
  product_fit_flags_json: Record<string, unknown>;
  intent_signals_json: Record<string, unknown>;
  intent_score: number;
  conversion_probability_band: string;
  decision_stage: string | null;
  likely_customer_motive: string | null;
  recommended_pitch_angle: string | null;
  intent_explanation: string | null;
  intent_confidence: string | null;
  multi_itinerary_type: string;
  multi_itinerary_summary_json: Record<string, unknown>;
  recommendation_engine_json: Record<string, unknown>;
  top_recommendations_json: Array<{ code: string; title: string; reasoning: string; confidence: string; category: string }>;
  suggested_alternative_destinations_json: Array<{ destination: string; avg_total_price: number | null; sample_count: number; reason: string; confidence: string }>;
  recommended_products_json: Array<{ code: string; label: string; reasoning: string; confidence: string }>;
  suggested_pitch_sequence_json: Array<{ code: string; title: string; why_now: string }>;
  benchmark_price_position: string;
  source_likelihood_json: Record<string, unknown>;
  source_profile_label: string | null;
  source_profile_confidence: string | null;
  latest_conversion_status: string | null;
  outcome_learning_summary_json: Record<string, unknown>;
  outcome_learning_version: string | null;
  traveler_intelligence_version: string;
  ops_copilot_version: string;
  benchmark_engine_version: string;
  intelligence_refreshed_at: string;
}

export interface LeadOpsCopilot {
  id: string;
  lead_id: string;
  unified_case_id: string;
  lead_classification: LeadClassification;
  recommendation_summary: string | null;
  ops_summary: string | null;
  what_looks_wrong_json: Array<{ code: string; title: string; detail: string; severity: string }>;
  sankash_opportunity_json: Array<{ code: string; title: string; priority: string; reason: string }>;
  call_talking_points_json: Array<{ title: string; body: string }>;
  pitch_sequence_json: Array<{ code: string; title: string; why_now: string }>;
  whatsapp_follow_up: string | null;
  benchmark_summary_json: Record<string, unknown>;
  similar_trip_summary_json: Record<string, unknown>;
  product_fit_flags_json: Record<string, unknown>;
  next_best_action_json: Record<string, unknown>;
  intent_summary_json: Record<string, unknown>;
  multi_itinerary_read_json: Record<string, unknown>;
  top_recommendations_json: Array<{ code: string; title: string; reasoning: string; confidence: string; category: string }>;
  suggested_alternative_destinations_json: Array<{ destination: string; avg_total_price: number | null; sample_count: number; reason: string; confidence: string }>;
  recommended_products_json: Array<{ code: string; label: string; reasoning: string; confidence: string }>;
  suggested_pitch_sequence_json: Array<{ code: string; title: string; why_now: string }>;
  benchmark_price_position: string;
  conversion_probability_band: string;
  decision_stage: string | null;
  likely_customer_motive: string | null;
  recommended_pitch_angle: string | null;
  intent_explanation: string | null;
  intent_confidence: string | null;
  source_likelihood_json: Record<string, unknown>;
  outcome_learning_summary_json: Record<string, unknown>;
  best_pitch_angle: string | null;
  urgency_score: number;
  intent_score: number;
  lead_quality_score: number;
  traveler_trust_score: number;
  outcome_learning_version: string | null;
  refreshed_at: string;
}

function castArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function castObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeBrain(row: any): LeadTripBrain {
  return {
    ...row,
    hotel_names_json: castArray<string>(row.hotel_names_json),
    airline_names_json: castArray<string>(row.airline_names_json),
    sectors_json: castArray<string>(row.sectors_json),
    additional_destinations_json: castArray<string>(row.additional_destinations_json),
    missing_fields_json: castArray<string>(row.missing_fields_json),
    extraction_warnings_json: castArray<string>(row.extraction_warnings_json),
    conflicting_fields_json: castArray(row.conflicting_fields_json),
    decision_flags_json: castArray(row.decision_flags_json),
    traveler_questions_json: castArray(row.traveler_questions_json),
    seller_questions_json: castArray(row.seller_questions_json),
    unlockable_modules_json: castArray(row.unlockable_modules_json),
    traveler_output_json: castObject(row.traveler_output_json),
    benchmark_summary_json: castObject(row.benchmark_summary_json),
    similar_case_summary_json: castObject(row.similar_case_summary_json),
    product_fit_flags_json: castObject(row.product_fit_flags_json),
    intent_signals_json: castObject(row.intent_signals_json),
    multi_itinerary_summary_json: castObject(row.multi_itinerary_summary_json),
    recommendation_engine_json: castObject(row.recommendation_engine_json),
    top_recommendations_json: castArray(row.top_recommendations_json),
    suggested_alternative_destinations_json: castArray(row.suggested_alternative_destinations_json),
    recommended_products_json: castArray(row.recommended_products_json),
    suggested_pitch_sequence_json: castArray(row.suggested_pitch_sequence_json),
    source_likelihood_json: castObject(row.source_likelihood_json),
    outcome_learning_summary_json: castObject(row.outcome_learning_summary_json),
  };
}

function normalizeCopilot(row: any): LeadOpsCopilot {
  return {
    ...row,
    what_looks_wrong_json: castArray(row.what_looks_wrong_json),
    sankash_opportunity_json: castArray(row.sankash_opportunity_json),
    call_talking_points_json: castArray(row.call_talking_points_json),
    pitch_sequence_json: castArray(row.pitch_sequence_json),
    benchmark_summary_json: castObject(row.benchmark_summary_json),
    similar_trip_summary_json: castObject(row.similar_trip_summary_json),
    product_fit_flags_json: castObject(row.product_fit_flags_json),
    next_best_action_json: castObject(row.next_best_action_json),
    intent_summary_json: castObject(row.intent_summary_json),
    multi_itinerary_read_json: castObject(row.multi_itinerary_read_json),
    top_recommendations_json: castArray(row.top_recommendations_json),
    suggested_alternative_destinations_json: castArray(row.suggested_alternative_destinations_json),
    recommended_products_json: castArray(row.recommended_products_json),
    suggested_pitch_sequence_json: castArray(row.suggested_pitch_sequence_json),
    source_likelihood_json: castObject(row.source_likelihood_json),
    outcome_learning_summary_json: castObject(row.outcome_learning_summary_json),
  };
}

export async function fetchLeadTripIntelligence(leadId: string): Promise<{
  brain: LeadTripBrain | null;
  ops: LeadOpsCopilot | null;
}> {
  const [brainRes, opsRes] = await Promise.all([
    supabase
      .from("lead_trip_brains" as any)
      .select("*")
      .eq("lead_id", leadId)
      .maybeSingle(),
    supabase
      .from("lead_ops_copilot" as any)
      .select("*")
      .eq("lead_id", leadId)
      .maybeSingle(),
  ]);

  if (brainRes.error) throw brainRes.error;
  if (opsRes.error) throw opsRes.error;

  return {
    brain: brainRes.data ? normalizeBrain(brainRes.data) : null,
    ops: opsRes.data ? normalizeCopilot(opsRes.data) : null,
  };
}

export async function refreshLeadTripIntelligence(leadId: string, reason = "manual_refresh") {
  const { data, error } = await supabase.functions.invoke("refresh-trip-intelligence", {
    body: { lead_id: leadId, reason },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
