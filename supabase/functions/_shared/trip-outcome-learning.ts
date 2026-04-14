export type OutcomeConversionStatus = "won" | "lost" | "pending" | "partially_converted";
export type OutcomeConfidenceBand = "high" | "medium" | "low";

export interface LeadOutcomeLeadLike {
  id: string;
  full_name?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  lead_source_page?: string | null;
  lead_source_type?: string | null;
  status?: string | null;
  outcome?: string | null;
  assigned_to?: string | null;
  quote_amount?: number | null;
  metadata_json?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
  closed_at?: string | null;
}

export interface LeadOutcomeBrainLike {
  id: string;
  lead_id: string;
  lead_classification?: string | null;
  source_page?: string | null;
  contact_present?: boolean;
  analysis_count?: number | null;
  attachment_count?: number | null;
  destination_city?: string | null;
  destination_country?: string | null;
  domestic_or_international?: string | null;
  duration_days?: number | null;
  duration_nights?: number | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  traveller_count_total?: number | null;
  adults_count?: number | null;
  children_count?: number | null;
  infants_count?: number | null;
  total_price?: number | null;
  price_per_person?: number | null;
  currency?: string | null;
  package_mode?: string | null;
  benchmark_key?: string | null;
  benchmark_price_position?: string | null;
  intent_score?: number | null;
  conversion_probability_band?: string | null;
  decision_stage?: string | null;
  likely_customer_motive?: string | null;
  recommended_pitch_angle?: string | null;
  multi_itinerary_type?: string | null;
  recommended_products_json?: unknown;
  suggested_pitch_sequence_json?: unknown;
  top_recommendations_json?: unknown;
  source_profile_label?: string | null;
}

export interface LeadOutcomeOpsLike {
  best_pitch_angle?: string | null;
  recommended_pitch_angle?: string | null;
  recommendation_summary?: string | null;
  top_recommendations_json?: unknown;
  recommended_products_json?: unknown;
  suggested_pitch_sequence_json?: unknown;
}

export interface LeadIntentSignalLike {
  first_upload_at?: string | null;
  latest_upload_at?: string | null;
  contact_captured_at?: string | null;
  session_count?: number | null;
  return_visit_count?: number | null;
  viewed_emi_page?: boolean | null;
  viewed_emi_section?: boolean | null;
  uploaded_multiple_itineraries?: boolean | null;
  distinct_destination_count?: number | null;
}

export interface LeadOutcomeSnapshot {
  conversion_status: OutcomeConversionStatus;
  conversion_date: string | null;
  product_converted: string[];
  loan_amount: number | null;
  booked_amount: number | null;
  quote_amount_at_outcome: number | null;
  destination_city: string | null;
  destination_country: string | null;
  domestic_or_international: string | null;
  traveler_profile_json: Record<string, unknown>;
  source_page: string | null;
  source_type: string | null;
  owner_user_id: string | null;
  pitch_angle_that_worked: string | null;
  originally_anonymous: boolean;
  upload_count: number;
  itinerary_count: number;
  lead_classification_at_outcome: string | null;
  intent_score_at_outcome: number;
  conversion_probability_band_at_outcome: string | null;
  recommendation_outputs_json: Record<string, unknown>;
  product_fit_snapshot_json: Record<string, unknown>;
  multi_itinerary_type: string | null;
  source_profile_label: string | null;
  first_upload_at: string | null;
  contact_captured_at: string | null;
  time_from_first_upload_to_conversion_hours: number | null;
  time_from_contact_capture_to_conversion_hours: number | null;
  learning_weight: number;
  benchmark_confidence_weight: number;
  active_for_learning: boolean;
  explanation: string;
}

export interface DestinationOutcomeBenchmarkLike {
  benchmark_key?: string | null;
  sample_count?: number | null;
  won_case_count?: number | null;
  lost_case_count?: number | null;
  partial_case_count?: number | null;
  pending_case_count?: number | null;
  conversion_rate_weighted?: number | null;
  anonymous_origin_win_rate?: number | null;
  benchmark_confidence_score?: number | null;
  common_winning_pitch_angles_json?: unknown;
  common_converted_products_json?: unknown;
  guidance_summary?: string | null;
}

export interface PitchOutcomeMemoryLike {
  pitch_angle: string;
  domestic_or_international?: string | null;
  multi_itinerary_type?: string | null;
  sample_count?: number | null;
  won_count?: number | null;
  lost_count?: number | null;
  partial_case_count?: number | null;
  win_rate?: number | null;
  anonymous_origin_win_rate?: number | null;
  common_products_json?: unknown;
}

export interface ProductOutcomeMemoryLike {
  product_code: string;
  domestic_or_international?: string | null;
  package_mode?: string | null;
  sample_count?: number | null;
  won_count?: number | null;
  lost_count?: number | null;
  partial_case_count?: number | null;
  win_rate?: number | null;
  avg_loan_amount?: number | null;
  avg_booked_amount?: number | null;
  common_pitch_angles_json?: unknown;
}

export interface OutcomeLearningSummary {
  summary: string;
  conversion_rate_band: "high" | "medium" | "low" | "unknown";
  converted_similar_cases: number;
  lost_similar_cases: number;
  best_pitch_angle: string | null;
  top_products: string[];
  anonymous_recovery_signal: string | null;
  benchmark_confidence_adjustment: string;
  guidance_lines: string[];
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of value) {
    const text = asText(item);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function hoursBetween(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return null;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime) return null;
  return Number(((endTime - startTime) / (1000 * 60 * 60)).toFixed(1));
}

function normalizeProducts(input: unknown): string[] {
  const rawArray = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[,\n/|]+/)
      : [];
  const output: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawArray) {
    const text = asText(raw);
    if (!text) continue;
    let code = text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (code === "travel_insurance" || code === "insurance") code = "travel_insurance";
    if (code === "no_cost" || code === "no_cost_emi_" || code === "no_cost_emi_offer" || code === "ncemi") code = "no_cost_emi";
    if (code === "emi_financing" || code === "standard_emi") code = "emi";
    if (code === "rebuild_through_sankash" || code === "rebuild_via_sankash") code = "rebuild";
    if (code === "visa_support" || code === "visa_protection_support") code = "visa_protection";
    if (!code) continue;
    if (seen.has(code)) continue;
    seen.add(code);
    output.push(code);
  }
  return output;
}

function normalizeCommercialOutcomeMetadata(metadata: unknown) {
  const meta = asObject(metadata);
  const commercial = asObject(
    meta.commercial_outcome ??
    meta.trip_outcome ??
    meta.conversion_outcome ??
    meta.conversion_details ??
    meta.outcome_details,
  );
  return {
    raw: commercial,
    conversion_status: asText(commercial.conversion_status ?? commercial.status),
    conversion_date: asText(commercial.conversion_date ?? commercial.won_at ?? commercial.closed_at),
    product_converted: normalizeProducts(
      commercial.product_converted ??
      commercial.products_converted ??
      commercial.converted_products ??
      commercial.products,
    ),
    loan_amount: asNumber(commercial.loan_amount ?? commercial.disbursed_amount),
    booked_amount: asNumber(commercial.booked_amount ?? commercial.booking_amount),
    pitch_angle_that_worked: asText(commercial.pitch_angle_that_worked ?? commercial.pitch_angle ?? commercial.winning_pitch_angle),
    source_type: asText(commercial.source_type),
    owner_user_id: asText(commercial.owner_user_id ?? commercial.owner),
  };
}

function deriveOutcomeStatus(lead: LeadOutcomeLeadLike, products: string[], commercialStatus: string | null): OutcomeConversionStatus {
  const normalized = commercialStatus?.toLowerCase().replace(/[^a-z_]+/g, "_");
  if (normalized === "won" || normalized === "lost" || normalized === "pending" || normalized === "partially_converted") {
    return normalized as OutcomeConversionStatus;
  }
  if (lead.outcome === "won" || lead.status === "converted") return "won";
  if (lead.outcome === "lost" || lead.status === "closed_lost") return "lost";
  if (products.length > 0) return "partially_converted";
  return "pending";
}

export function buildLeadOutcomeSnapshot(params: {
  lead: LeadOutcomeLeadLike;
  brain: LeadOutcomeBrainLike;
  ops?: LeadOutcomeOpsLike | null;
  intentSignals?: LeadIntentSignalLike | null;
}): LeadOutcomeSnapshot {
  const { lead, brain, ops, intentSignals } = params;
  const commercial = normalizeCommercialOutcomeMetadata(lead.metadata_json);
  const conversionStatus = deriveOutcomeStatus(lead, commercial.product_converted, commercial.conversion_status);
  const conversionDate = commercial.conversion_date
    ?? asText(lead.closed_at)
    ?? ((conversionStatus === "won" || conversionStatus === "lost" || conversionStatus === "partially_converted") ? asText(lead.updated_at) : null);

  const hasCurrentContact = Boolean(asText(lead.mobile_number) || asText(lead.email));
  const contactCapturedAt = asText(intentSignals?.contact_captured_at);
  const originallyAnonymous = !hasCurrentContact || Boolean(contactCapturedAt);
  const recommendationProducts = normalizeProducts(
    (ops?.recommended_products_json as Array<Record<string, unknown>> | undefined)?.map((item) => item?.code)
      ?? brain.recommended_products_json,
  );
  const productConverted = commercial.product_converted.length > 0
    ? commercial.product_converted
    : conversionStatus === "won" && recommendationProducts.length > 0
      ? recommendationProducts.slice(0, 2)
      : [];

  const quoteAmountAtOutcome = asNumber(lead.quote_amount)
    ?? asNumber(brain.total_price)
    ?? (asNumber(brain.price_per_person) != null && asNumber(brain.traveller_count_total) != null
      ? Number(brain.price_per_person) * Number(brain.traveller_count_total)
      : asNumber(brain.price_per_person));

  const baseWeight = conversionStatus === "won" ? 1.55 : conversionStatus === "partially_converted" ? 1.25 : conversionStatus === "lost" ? 1 : 0.55;
  const contactWeight = hasCurrentContact ? 0.2 : -0.1;
  const benchmarkWeight = conversionStatus === "pending" ? 0.55 : conversionStatus === "lost" ? 0.9 : 1.25;
  const learningWeight = Math.max(0.3, Math.min(2, Number((baseWeight + contactWeight).toFixed(2))));
  const confidenceWeight = Math.max(0.35, Math.min(1.75, Number((benchmarkWeight + (brain.source_profile_label === "personalized_seller_quote" ? 0.1 : 0)).toFixed(2))));

  return {
    conversion_status: conversionStatus,
    conversion_date: conversionDate,
    product_converted: productConverted,
    loan_amount: commercial.loan_amount,
    booked_amount: commercial.booked_amount,
    quote_amount_at_outcome: quoteAmountAtOutcome,
    destination_city: asText(brain.destination_city),
    destination_country: asText(brain.destination_country),
    domestic_or_international: asText(brain.domestic_or_international),
    traveler_profile_json: {
      travelers: asNumber(brain.traveller_count_total),
      adults: asNumber(brain.adults_count),
      children: asNumber(brain.children_count),
      infants: asNumber(brain.infants_count),
      duration_days: asNumber(brain.duration_days),
      duration_nights: asNumber(brain.duration_nights),
      package_mode: asText(brain.package_mode),
    },
    source_page: asText(lead.lead_source_page) ?? asText(brain.source_page),
    source_type: commercial.source_type ?? asText(lead.lead_source_type),
    owner_user_id: commercial.owner_user_id ?? asText(lead.assigned_to),
    pitch_angle_that_worked: commercial.pitch_angle_that_worked ?? asText(ops?.best_pitch_angle) ?? asText(brain.recommended_pitch_angle),
    originally_anonymous: originallyAnonymous,
    upload_count: Math.max(asNumber(brain.attachment_count) ?? 0, asNumber(brain.analysis_count) ?? 0),
    itinerary_count: asNumber(brain.analysis_count) ?? 0,
    lead_classification_at_outcome: asText(brain.lead_classification),
    intent_score_at_outcome: asNumber(brain.intent_score) ?? 0,
    conversion_probability_band_at_outcome: asText(brain.conversion_probability_band),
    recommendation_outputs_json: {
      recommendation_summary: asText(ops?.recommendation_summary),
      top_recommendations: Array.isArray(ops?.top_recommendations_json) ? ops?.top_recommendations_json : Array.isArray(brain.top_recommendations_json) ? brain.top_recommendations_json : [],
      recommended_products: Array.isArray(ops?.recommended_products_json) ? ops?.recommended_products_json : Array.isArray(brain.recommended_products_json) ? brain.recommended_products_json : [],
      suggested_pitch_sequence: Array.isArray(ops?.suggested_pitch_sequence_json) ? ops?.suggested_pitch_sequence_json : Array.isArray(brain.suggested_pitch_sequence_json) ? brain.suggested_pitch_sequence_json : [],
    },
    product_fit_snapshot_json: {
      recommended_pitch_angle: asText(ops?.recommended_pitch_angle) ?? asText(brain.recommended_pitch_angle),
      benchmark_price_position: asText(brain.benchmark_price_position),
    },
    multi_itinerary_type: asText(brain.multi_itinerary_type),
    source_profile_label: asText(brain.source_profile_label),
    first_upload_at: asText(intentSignals?.first_upload_at),
    contact_captured_at: contactCapturedAt,
    time_from_first_upload_to_conversion_hours: hoursBetween(asText(intentSignals?.first_upload_at), conversionDate),
    time_from_contact_capture_to_conversion_hours: hoursBetween(contactCapturedAt, conversionDate),
    learning_weight: learningWeight,
    benchmark_confidence_weight: confidenceWeight,
    active_for_learning: conversionStatus !== "pending" || hasCurrentContact,
    explanation: conversionStatus === "won"
      ? "Closed-loop learning should weight this case strongly because it produced a real conversion."
      : conversionStatus === "lost"
        ? "This case teaches the engine what did not convert under real sales conditions."
        : conversionStatus === "partially_converted"
          ? "This case captured partial commercial success and should still influence product-fit guidance."
          : "This case is still pending, so it should contribute lightly until an outcome lands.",
  };
}

function conversionRateBand(rate: number | null | undefined): OutcomeLearningSummary["conversion_rate_band"] {
  if (rate == null || !Number.isFinite(rate)) return "unknown";
  if (rate >= 0.45) return "high";
  if (rate >= 0.18) return "medium";
  return "low";
}

export function buildOutcomeLearningSummary(params: {
  benchmark: DestinationOutcomeBenchmarkLike | null;
  pitchRows?: PitchOutcomeMemoryLike[];
  productRows?: ProductOutcomeMemoryLike[];
}): OutcomeLearningSummary {
  const benchmark = params.benchmark;
  const pitchRows = [...(params.pitchRows ?? [])].sort((left, right) => (right.win_rate ?? 0) - (left.win_rate ?? 0));
  const productRows = [...(params.productRows ?? [])].sort((left, right) => (right.win_rate ?? 0) - (left.win_rate ?? 0));

  const topPitch = pitchRows.find((row) => (row.won_count ?? 0) > 0) ?? null;
  const topProducts = productRows
    .filter((row) => (row.won_count ?? 0) > 0 || (row.partial_case_count ?? 0) > 0)
    .slice(0, 3)
    .map((row) => row.product_code.replace(/_/g, " "));

  const guidanceLines: string[] = [];
  if (topPitch && (topPitch.won_count ?? 0) >= 1) {
    guidanceLines.push(`Similar cases converted best when the ${topPitch.pitch_angle.replace(/_/g, " ")} pitch was used.`);
  }
  if (topProducts.length > 0) {
    guidanceLines.push(`Products that keep showing up in wins here: ${topProducts.join(", ")}.`);
  }
  if ((benchmark?.anonymous_origin_win_rate ?? 0) >= 0.08) {
    guidanceLines.push("Anonymous itinerary uploads can still convert after contact capture, so do not down-rank them too early.");
  }
  if ((benchmark?.conversion_rate_weighted ?? 0) > 0 && (benchmark?.sample_count ?? 0) >= 2) {
    guidanceLines.push(`Outcome memory for this trip shape is now strong enough to influence benchmark confidence.`);
  }
  if (guidanceLines.length === 0) {
    guidanceLines.push("Outcome memory is still building, so use this as directional guidance rather than hard truth.");
  }

  const summary = benchmark?.guidance_summary
    ?? (guidanceLines[0] ?? "Outcome feedback is still building for this trip shape.");

  const confidenceAdjustment = (benchmark?.benchmark_confidence_score ?? 0) >= 70
    ? "high"
    : (benchmark?.benchmark_confidence_score ?? 0) >= 35
      ? "medium"
      : "low";

  return {
    summary,
    conversion_rate_band: conversionRateBand(benchmark?.conversion_rate_weighted),
    converted_similar_cases: Number(benchmark?.won_case_count ?? 0),
    lost_similar_cases: Number(benchmark?.lost_case_count ?? 0),
    best_pitch_angle: topPitch?.pitch_angle ?? null,
    top_products: topProducts,
    anonymous_recovery_signal: (benchmark?.anonymous_origin_win_rate ?? 0) >= 0.08
      ? "Anonymous uploads with later contact capture are converting often enough to matter."
      : null,
    benchmark_confidence_adjustment: confidenceAdjustment,
    guidance_lines: guidanceLines,
  };
}
