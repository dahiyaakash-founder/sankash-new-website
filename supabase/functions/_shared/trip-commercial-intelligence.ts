import type { DerivedItineraryIntelligence } from "./itinerary-intelligence.ts";

export type LeadClassification = "sales_lead" | "research_lead" | "noise";
export type ConversionProbabilityBand = "high" | "medium" | "low";
export type IntentConfidenceBand = "high" | "medium" | "low";
export type LearningSignalClass =
  | "sales_signal"
  | "research_signal"
  | "low_trust_signal"
  | "possible_benchmark_only_signal";
export type MultiItineraryType =
  | "single_itinerary"
  | "same_trip_multi_document"
  | "same_trip_multi_seller"
  | "same_destination_price_comparison"
  | "same_destination_date_comparison"
  | "multi_destination_indecision"
  | "travel_window_exploration"
  | "likely_agent_negotiation"
  | "likely_window_shopping"
  | "unclear_mixed_case";
export type DecisionStage =
  | "early_exploration"
  | "option_comparison"
  | "financing_evaluation"
  | "negotiation_ready"
  | "booking_ready"
  | "rebuild_consideration";

export interface LeadRecordLike {
  id: string;
  full_name?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  lead_source_page?: string | null;
  audience_type?: string | null;
  status?: string | null;
  outcome?: string | null;
  metadata_json?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AttachmentRecordLike {
  id: string;
  file_name?: string | null;
  category?: string | null;
  mime_type?: string | null;
  uploaded_at?: string | null;
}

export interface AnalysisRecordLike {
  id: string;
  created_at?: string | null;
  parsing_confidence?: string | null;
  extracted_completeness_score?: number | null;
  destination_city?: string | null;
  destination_country?: string | null;
  domestic_or_international?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  duration_days?: number | null;
  duration_nights?: number | null;
  total_price?: number | null;
  price_per_person?: number | null;
  traveller_count_total?: number | null;
  adults_count?: number | null;
  children_count?: number | null;
  infants_count?: number | null;
  travel_agent_name?: string | null;
  hotel_names_json?: unknown;
  airline_names_json?: unknown;
  sectors_json?: unknown;
  inclusions_text?: string | null;
  exclusions_text?: string | null;
  file_count?: number | null;
  file_names_json?: unknown;
}

export interface MergedTripBrainLike {
  source_page?: string | null;
  audience_type?: string | null;
  contact_present: boolean;
  analysis_count: number;
  attachment_count: number;
  parsing_confidence: string | null;
  destination_city?: string | null;
  destination_country?: string | null;
  domestic_or_international?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  duration_days?: number | null;
  duration_nights?: number | null;
  total_price?: number | null;
  price_per_person?: number | null;
  currency?: string | null;
  traveller_count_total?: number | null;
  adults_count?: number | null;
  children_count?: number | null;
  infants_count?: number | null;
  travel_agent_name?: string | null;
  customer_name?: string | null;
  hotel_names_json: string[];
  airline_names_json: string[];
  sectors_json: string[];
  additional_destinations_json: string[];
  inclusions_text?: string | null;
  exclusions_text?: string | null;
  missing_fields_json: string[];
  extraction_warnings_json: string[];
  conflicting_fields_json: Array<{ field: string; chosen: string; alternatives: string[] }>;
  package_mode: string;
}

export interface BenchmarkRowLike {
  benchmark_key?: string | null;
  sample_count?: number | null;
  weighted_sample_score?: number | null;
  min_total_price?: number | null;
  max_total_price?: number | null;
  avg_total_price?: number | null;
  median_total_price?: number | null;
  common_hotels?: string[];
  common_inclusions?: string[];
  common_exclusions?: string[];
  price_position?: string | null;
  note?: string | null;
  destination_city?: string | null;
  destination_country?: string | null;
  domestic_or_international?: string | null;
  duration_bucket?: string | null;
  traveler_bucket?: string | null;
  package_mode?: string | null;
}

export interface SimilarSummaryLike {
  match_count?: number | null;
  top_matches?: Array<Record<string, unknown>>;
}

export interface ProductFitFlagsLike {
  emi_eligible: boolean;
  no_cost_emi_candidate: boolean;
  travel_insurance_candidate: boolean;
  visa_protection_candidate: boolean;
  rebuild_candidate: boolean;
  better_value_candidate: boolean;
  pg_candidate: boolean;
  urgency_score: number;
  intent_score: number;
  lead_quality_score: number;
}

export interface LeadActivityRecordLike {
  activity_type?: string | null;
  created_at?: string | null;
}

export interface IntentSignals {
  upload_timestamp: string | null;
  first_upload_at: string | null;
  latest_upload_at: string | null;
  contact_captured_at: string | null;
  pages_visited_before_upload: string[];
  page_types_before_upload: string[];
  time_spent_before_upload_seconds: number | null;
  viewed_traveler_page: boolean;
  viewed_emi_page: boolean;
  viewed_emi_section: boolean;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  returned_multiple_times: boolean;
  session_count: number;
  return_visit_count: number;
  uploaded_multiple_itineraries: boolean;
  distinct_destination_count: number;
  same_destination_repeat: boolean;
  device_type: string | null;
  os_name: string | null;
  browser_name: string | null;
  days_to_trip_start: number | null;
  quote_size_band: string;
  trip_size_band: string;
  raw_signal_snapshot_json: Record<string, unknown>;
}

export interface IntentAssessment {
  intent_score: number;
  conversion_probability_band: ConversionProbabilityBand;
  decision_stage: DecisionStage;
  likely_customer_motive: string;
  recommended_pitch_angle: string;
  intent_explanation: string;
  intent_confidence: IntentConfidenceBand;
}

export interface MultiItineraryInsight {
  multi_itinerary_type: MultiItineraryType;
  multi_itinerary_summary: string;
  file_relationship_explanation: string;
  buying_state_inference: string;
  talk_tracks_for_multi_case: Array<{ title: string; body: string }>;
  common_patterns: string[];
  ops_conversion_use: string;
}

export interface RecommendationItem {
  code: string;
  title: string;
  reasoning: string;
  confidence: IntentConfidenceBand;
  category: "pitch" | "product" | "benchmark" | "trip_shape" | "close";
}

export interface ProductRecommendation {
  code: string;
  label: string;
  reasoning: string;
  confidence: IntentConfidenceBand;
}

export interface AlternativeDestinationRecommendation {
  destination: string;
  avg_total_price: number | null;
  sample_count: number;
  reason: string;
  confidence: IntentConfidenceBand;
}

export interface RecommendationEngineOutput {
  top_recommendations: RecommendationItem[];
  suggested_alternative_destinations: AlternativeDestinationRecommendation[];
  recommended_products: ProductRecommendation[];
  suggested_pitch_sequence: Array<{ code: string; title: string; why_now: string }>;
  benchmark_price_position: string;
}

export interface LearningSignals {
  learning_signal_class: LearningSignalClass;
  learning_weight: number;
  benchmark_signal_weight: number;
  explanation: string;
}

export interface SourceLikelihoodAssessment {
  likely_source_profile: "public_brochure_or_ota" | "personalized_seller_quote" | "comparison_shopping_upload" | "benchmark_or_test_upload" | "genuine_custom_planning_upload" | "unclear";
  confidence: IntentConfidenceBand;
  probabilities: Record<string, number>;
  explanation: string;
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

function dateDiffFromToday(dateString: string | null | undefined) {
  if (!dateString) return null;
  const timestamp = new Date(`${dateString}T00:00:00Z`).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
}

function destinationKey(city?: string | null, country?: string | null) {
  return (city ?? country ?? "unknown").toLowerCase().trim();
}

function durationBucket(days: number | null | undefined) {
  if (days == null || days <= 0) return "unknown";
  if (days <= 3) return "short";
  if (days <= 6) return "medium";
  if (days <= 10) return "long";
  return "extended";
}

function travelerBucket(count: number | null | undefined) {
  if (count == null || count <= 0) return "unknown";
  if (count === 1) return "solo";
  if (count === 2) return "pair";
  if (count <= 4) return "small_group";
  return "group";
}

function confidenceFromSignalCount(count: number): IntentConfidenceBand {
  if (count >= 6) return "high";
  if (count >= 3) return "medium";
  return "low";
}

function normalizePublicSessionSnapshot(metadata: unknown) {
  const meta = asObject(metadata);
  const snapshot = asObject(meta.traveler_intent_session ?? meta.intent_snapshot);
  const pageSequence = Array.isArray(snapshot.page_sequence) ? snapshot.page_sequence as Array<Record<string, unknown>> : [];
  const pagesFromSequence = pageSequence
    .map((entry) => asText(entry.path))
    .filter((value): value is string => Boolean(value));
  const pageTypesFromSequence = pageSequence
    .map((entry) => asText(entry.page_type))
    .filter((value): value is string => Boolean(value));
  return {
    snapshot,
    pages_visited_before_upload: asStringArray(snapshot.pages_visited_before_upload).length > 0
      ? asStringArray(snapshot.pages_visited_before_upload)
      : pagesFromSequence,
    page_types_before_upload: asStringArray(snapshot.page_types_before_upload).length > 0
      ? asStringArray(snapshot.page_types_before_upload)
      : pageTypesFromSequence,
    time_spent_before_upload_seconds: asNumber(snapshot.time_spent_before_upload_seconds),
    viewed_traveler_page: Boolean(snapshot.viewed_traveler_page),
    viewed_emi_page: Boolean(snapshot.viewed_emi_page),
    viewed_emi_section: Boolean(snapshot.viewed_emi_section),
    referrer: asText(snapshot.referrer),
    utm_source: asText(snapshot.utm_source),
    utm_medium: asText(snapshot.utm_medium),
    utm_campaign: asText(snapshot.utm_campaign),
    session_count: asNumber(snapshot.session_count) ?? 1,
    return_visit_count: asNumber(snapshot.return_visit_count) ?? 0,
    returned_multiple_times: Boolean(snapshot.returned_multiple_times) || (asNumber(snapshot.return_visit_count) ?? 0) > 0 || (asNumber(snapshot.session_count) ?? 1) > 1,
    device_type: asText(snapshot.device_type),
    os_name: asText(snapshot.os_name),
    browser_name: asText(snapshot.browser_name),
    upload_started_at: asText(snapshot.upload_started_at ?? snapshot.latest_upload_started_at),
    latest_contact_submitted_at: asText(snapshot.latest_contact_submitted_at),
  };
}

export function buildIntentSignals(params: {
  lead: LeadRecordLike;
  merged: MergedTripBrainLike;
  analyses: AnalysisRecordLike[];
  attachments: AttachmentRecordLike[];
  activity: LeadActivityRecordLike[];
}): IntentSignals {
  const { lead, merged, analyses, attachments, activity } = params;
  const session = normalizePublicSessionSnapshot(lead.metadata_json);
  const uploadTimes = [
    ...analyses.map((row) => asText(row.created_at)).filter(Boolean),
    ...attachments.map((row) => asText(row.uploaded_at)).filter(Boolean),
    session.upload_started_at,
  ].filter(Boolean) as string[];
  uploadTimes.sort();

  const activityLookup = new Map<string, string>();
  for (const row of activity) {
    const type = asText(row.activity_type);
    const createdAt = asText(row.created_at);
    if (!type || !createdAt || activityLookup.has(type)) continue;
    activityLookup.set(type, createdAt);
  }

  const distinctDestinations = new Set(
    analyses
      .map((row) => destinationKey(row.destination_city, row.destination_country))
      .filter((value) => value !== "unknown"),
  );

  const priceAmount = merged.total_price ?? (
    merged.price_per_person != null && merged.traveller_count_total != null
      ? merged.price_per_person * merged.traveller_count_total
      : merged.price_per_person
  );

  const quoteSizeBand = priceAmount == null
    ? "unknown"
    : priceAmount < 40000
      ? "small"
      : priceAmount < 150000
        ? "mid"
        : "large";

  const tripSizeBand = merged.traveller_count_total == null
    ? "unknown"
    : merged.traveller_count_total <= 2
      ? "small_party"
      : merged.traveller_count_total <= 5
        ? "family_or_group"
        : "large_group";

  return {
    upload_timestamp: uploadTimes[0] ?? null,
    first_upload_at: uploadTimes[0] ?? null,
    latest_upload_at: uploadTimes[uploadTimes.length - 1] ?? null,
    contact_captured_at: session.latest_contact_submitted_at ?? activityLookup.get("traveler_contact_captured") ?? null,
    pages_visited_before_upload: session.pages_visited_before_upload,
    page_types_before_upload: session.page_types_before_upload,
    time_spent_before_upload_seconds: session.time_spent_before_upload_seconds,
    viewed_traveler_page: session.viewed_traveler_page || (lead.lead_source_page ?? "").includes("for-travelers"),
    viewed_emi_page: session.viewed_emi_page || session.page_types_before_upload.includes("emi_calculator"),
    viewed_emi_section: session.viewed_emi_section,
    referrer: session.referrer,
    utm_source: session.utm_source,
    utm_medium: session.utm_medium,
    utm_campaign: session.utm_campaign,
    returned_multiple_times: session.returned_multiple_times,
    session_count: session.session_count,
    return_visit_count: session.return_visit_count,
    uploaded_multiple_itineraries: analyses.length > 1 || merged.analysis_count > 1,
    distinct_destination_count: distinctDestinations.size,
    same_destination_repeat: distinctDestinations.size === 1 && analyses.length > 1,
    device_type: session.device_type,
    os_name: session.os_name,
    browser_name: session.browser_name,
    days_to_trip_start: dateDiffFromToday(merged.travel_start_date),
    quote_size_band: quoteSizeBand,
    trip_size_band: tripSizeBand,
    raw_signal_snapshot_json: session.snapshot,
  };
}

function analysisDestinationSignature(row: AnalysisRecordLike) {
  return destinationKey(row.destination_city, row.destination_country);
}

export function deriveMultiItineraryInsight(params: {
  lead: LeadRecordLike;
  analyses: AnalysisRecordLike[];
  merged: MergedTripBrainLike;
  intelligence: DerivedItineraryIntelligence;
}): MultiItineraryInsight {
  const { lead, analyses, merged } = params;
  const rows = [...analyses].sort((left, right) => new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime());
  const destinationSignatures = Array.from(new Set(rows.map(analysisDestinationSignature).filter((value) => value !== "unknown")));
  const dateWindows = Array.from(new Set(rows.map((row) => `${row.travel_start_date ?? "?"}|${row.travel_end_date ?? "?"}`).filter((value) => value !== "?|?")));
  const sellers = Array.from(new Set(rows.map((row) => asText(row.travel_agent_name)).filter(Boolean) as string[]));
  const prices = rows.map((row) => row.total_price ?? row.price_per_person).filter((value): value is number => typeof value === "number");
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const priceSpread = minPrice != null && maxPrice != null && minPrice > 0 ? (maxPrice - minPrice) / minPrice : 0;
  const firstRow = rows[0];
  const hasMultiDocEvidence = rows.length === 1 && ((firstRow?.file_count ?? 0) > 1 || merged.attachment_count > 1);

  let type: MultiItineraryType = rows.length <= 1 ? "single_itinerary" : "unclear_mixed_case";
  let buyingState = "single_quote_review";
  const patterns: string[] = [];
  const talkTracks: Array<{ title: string; body: string }> = [];

  if (hasMultiDocEvidence) {
    type = "same_trip_multi_document";
    buyingState = "assembling_one_trip";
    patterns.push("Multiple files appear to describe one trip");
    talkTracks.push({
      title: "Treat it as one booking",
      body: "Do not ask the customer to explain each file. Lead with one merged summary and confirm only the gaps.",
    });
  } else if (destinationSignatures.length > 1) {
    type = "multi_destination_indecision";
    buyingState = "destination_comparison";
    patterns.push("Different destinations are being compared");
    talkTracks.push({
      title: "Guide the decision",
      body: "Lead with budget-to-destination fit, best-value destination, and the EMI impact of each option.",
    });
  } else if (destinationSignatures.length === 1 && dateWindows.length > 1) {
    type = priceSpread >= 0.12 ? "same_destination_date_comparison" : "travel_window_exploration";
    buyingState = "date_comparison";
    patterns.push("Same destination across different travel windows");
    talkTracks.push({
      title: "Use date flexibility",
      body: "Position SanKash as the team that can spot the better-value dates and structure the easier monthly cost.",
    });
  } else if (destinationSignatures.length === 1 && sellers.length > 1) {
    type = priceSpread >= 0.1 ? "same_trip_multi_seller" : "likely_agent_negotiation";
    buyingState = "quote_comparison";
    patterns.push("Same trip appears to be compared across multiple sellers");
    talkTracks.push({
      title: "Compare sellers for the customer",
      body: "Explain why one quote may be higher or lower and offer to rebuild through SanKash with cleaner inclusions.",
    });
  } else if (destinationSignatures.length === 1 && rows.length > 1 && priceSpread >= 0.1) {
    type = "same_destination_price_comparison";
    buyingState = "price_comparison";
    patterns.push("Same destination with a visible price spread across uploads");
    talkTracks.push({
      title: "Anchor on fair value",
      body: "Tell the customer you can show which quote is expensive, which one is missing items, and what SanKash can improve.",
    });
  } else if (rows.length > 1 && destinationSignatures.length === 1) {
    type = "likely_window_shopping";
    buyingState = "shopping_the_market";
    patterns.push("The customer seems to be shopping around for the same trip");
    talkTracks.push({
      title: "Close with clarity",
      body: "Use the comparison to position SanKash as the cleanest way to compare, finance, and protect the final booking.",
    });
  }

  if (minPrice != null && maxPrice != null && maxPrice > minPrice) {
    patterns.push(`Visible quote spread from ${minPrice.toLocaleString("en-IN")} to ${maxPrice.toLocaleString("en-IN")}`);
  }
  if (sellers.length > 1) patterns.push(`${sellers.length} seller names visible`);
  if (destinationSignatures.length === 1 && merged.destination_city) patterns.push(`Destination focus stays on ${merged.destination_city}`);

  const explanation = type === "single_itinerary"
    ? "Uploads behave like a single trip review rather than a comparison case."
    : type === "same_trip_multi_document"
      ? "The files look complementary rather than competing; they fill in the same trip."
      : type === "multi_destination_indecision"
        ? "The customer is likely deciding where to go rather than choosing one final quote."
        : type === "same_trip_multi_seller"
          ? "This looks like the same trip being compared across sellers."
          : type === "same_destination_date_comparison"
            ? "The customer seems to be comparing dates for the same destination."
            : type === "same_destination_price_comparison"
              ? "The customer seems to be comparing prices for the same destination."
              : type === "likely_agent_negotiation"
                ? "The uploads look like revised versions of the same trip, likely during quote negotiation."
                : type === "travel_window_exploration"
                  ? "The customer appears flexible on travel window and is exploring timing."
                  : type === "likely_window_shopping"
                    ? "The customer appears to be shopping the market for one trip shape."
                    : "The relationship between uploads is mixed and needs light human confirmation.";

  const opsUse = type === "multi_destination_indecision"
    ? "Pitch best-fit destination plus EMI comfort, not just price."
    : type === "same_trip_multi_seller" || type === "same_destination_price_comparison"
      ? "Pitch quote comparison, rebuild, and No-Cost EMI if we book it."
      : type === "same_destination_date_comparison" || type === "travel_window_exploration"
        ? "Pitch better dates, better value, and affordability clarity."
        : "Use the merged summary, fill missing gaps fast, then pitch the cleanest next step.";

  return {
    multi_itinerary_type: type,
    multi_itinerary_summary: explanation,
    file_relationship_explanation: explanation,
    buying_state_inference: buyingState,
    talk_tracks_for_multi_case: talkTracks,
    common_patterns: patterns.slice(0, 5),
    ops_conversion_use: opsUse,
  };
}

export function deriveIntentAssessment(params: {
  lead: LeadRecordLike;
  merged: MergedTripBrainLike;
  intelligence: DerivedItineraryIntelligence;
  classification: LeadClassification;
  signals: IntentSignals;
  multi: MultiItineraryInsight;
}): IntentAssessment {
  const { lead, merged, intelligence, classification, signals, multi } = params;
  let score = classification === "sales_lead" ? 50 : classification === "research_lead" ? 28 : 10;

  if (merged.contact_present) score += 18;
  if (signals.returned_multiple_times) score += 8;
  if (signals.viewed_emi_page || signals.viewed_emi_section) score += 8;
  if ((signals.time_spent_before_upload_seconds ?? 0) >= 90) score += 8;
  if (merged.total_price != null || merged.price_per_person != null) score += 8;
  if (merged.travel_start_date) score += 8;
  if (merged.traveller_count_total != null) score += 6;
  if ((signals.days_to_trip_start ?? 999) <= 30) score += 12;
  if (multi.multi_itinerary_type === "same_trip_multi_seller" || multi.multi_itinerary_type === "same_destination_price_comparison") score += 8;
  if (multi.multi_itinerary_type === "multi_destination_indecision") score -= 6;
  if (classification === "noise") score -= 10;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const strongSignalCount = [
    merged.contact_present,
    signals.returned_multiple_times,
    signals.viewed_emi_page || signals.viewed_emi_section,
    merged.travel_start_date != null,
    merged.traveller_count_total != null,
    merged.total_price != null || merged.price_per_person != null,
    multi.multi_itinerary_type !== "single_itinerary",
  ].filter(Boolean).length;

  const conversionBand: ConversionProbabilityBand = score >= 72 ? "high" : score >= 42 ? "medium" : "low";

  let decisionStage: DecisionStage = "early_exploration";
  if (multi.multi_itinerary_type === "same_trip_multi_seller" || multi.multi_itinerary_type === "same_destination_price_comparison") {
    decisionStage = merged.contact_present ? "negotiation_ready" : "option_comparison";
  } else if (signals.viewed_emi_page || signals.viewed_emi_section) {
    decisionStage = "financing_evaluation";
  } else if (merged.contact_present && merged.travel_start_date && merged.traveller_count_total != null && (merged.total_price != null || merged.price_per_person != null)) {
    decisionStage = "booking_ready";
  } else if (multi.multi_itinerary_type === "multi_destination_indecision" || multi.multi_itinerary_type === "travel_window_exploration") {
    decisionStage = "option_comparison";
  } else if (intelligence.decision_flags_json.some((flag) => flag.code === "price_missing_or_partial" || flag.code === "transport_missing_from_total")) {
    decisionStage = "rebuild_consideration";
  }

  let motive = "quote_validation";
  if (signals.viewed_emi_page || signals.viewed_emi_section) motive = "affordability_check";
  if (multi.multi_itinerary_type === "multi_destination_indecision") motive = "destination_decision";
  if (multi.multi_itinerary_type === "same_trip_multi_seller" || multi.multi_itinerary_type === "same_destination_price_comparison") motive = "get_best_quote";
  if (decisionStage === "booking_ready") motive = "finalize_booking";

  let pitchAngle = "clarify_quote_and_close";
  if (motive === "affordability_check") pitchAngle = merged.package_mode !== "unknown" ? "lead_with_emi_and_no_cost_emi" : "lead_with_monthly_affordability";
  else if (multi.multi_itinerary_type === "multi_destination_indecision") pitchAngle = "guide_to_best_fit_destination";
  else if (multi.multi_itinerary_type === "same_trip_multi_seller" || multi.multi_itinerary_type === "same_destination_price_comparison") pitchAngle = "compare_and_rebuild_through_sankash";
  else if (decisionStage === "booking_ready" && merged.contact_present) pitchAngle = "close_with_no_cost_emi_and_protection";
  else if (intelligence.decision_flags_json.some((flag) => flag.code === "transport_missing_from_total")) pitchAngle = "rebuild_for_total_trip_clarity";

  const explanation = [
    merged.contact_present ? "Contact details are present" : "No direct contact captured yet",
    signals.returned_multiple_times ? "the user has returned more than once" : null,
    signals.viewed_emi_page || signals.viewed_emi_section ? "they showed financing interest" : null,
    merged.travel_start_date ? "travel dates are visible" : "dates are still unclear",
    multi.multi_itinerary_type !== "single_itinerary" ? `uploads suggest ${multi.buying_state_inference.replace(/_/g, " ")}` : null,
  ].filter(Boolean).join(", ");

  return {
    intent_score: score,
    conversion_probability_band: conversionBand,
    decision_stage: decisionStage,
    likely_customer_motive: motive,
    recommended_pitch_angle: pitchAngle,
    intent_explanation: explanation,
    intent_confidence: confidenceFromSignalCount(strongSignalCount),
  };
}

export function buildRecommendationEngine(params: {
  merged: MergedTripBrainLike;
  intelligence: DerivedItineraryIntelligence;
  benchmarkSummary: BenchmarkRowLike;
  similarSummary: SimilarSummaryLike;
  productFit: ProductFitFlagsLike;
  intent: IntentAssessment;
  multi: MultiItineraryInsight;
  alternativeBenchmarks: BenchmarkRowLike[];
}): RecommendationEngineOutput {
  const { merged, intelligence, benchmarkSummary, similarSummary, productFit, intent, multi, alternativeBenchmarks } = params;
  const recommendations: RecommendationItem[] = [];
  const products: ProductRecommendation[] = [];

  const pushRecommendation = (item: RecommendationItem) => {
    if (!recommendations.some((existing) => existing.code === item.code)) recommendations.push(item);
  };
  const pushProduct = (item: ProductRecommendation) => {
    if (!products.some((existing) => existing.code === item.code)) products.push(item);
  };

  if ((benchmarkSummary.price_position ?? "unknown") === "high") {
    pushRecommendation({
      code: "benchmark_high_rebuild",
      title: "Offer a cleaner rebuild through SanKash",
      reasoning: "This quote sits above the visible market band for similar trips.",
      confidence: "high",
      category: "benchmark",
    });
  }

  if (productFit.no_cost_emi_candidate) {
    pushProduct({
      code: "no_cost_emi",
      label: "No-Cost EMI",
      reasoning: "Trip value and clarity are good enough to pitch SanKash-booked No-Cost EMI.",
      confidence: intent.conversion_probability_band === "high" ? "high" : "medium",
    });
  } else if (productFit.emi_eligible) {
    pushProduct({
      code: "emi",
      label: "Standard EMI",
      reasoning: "Visible trip value supports an EMI-first affordability conversation.",
      confidence: "high",
    });
  }

  if (productFit.travel_insurance_candidate) {
    pushProduct({
      code: "travel_insurance",
      label: "Travel Insurance",
      reasoning: "Protection is weak, excluded, or high-value enough to justify insurance.",
      confidence: merged.domestic_or_international === "international" ? "high" : "medium",
    });
  }

  if (productFit.visa_protection_candidate) {
    pushProduct({
      code: "visa_protection",
      label: "Visa / documentation support",
      reasoning: "International travel here has documentation risk that can support an added service pitch.",
      confidence: "medium",
    });
  }

  if (productFit.rebuild_candidate) {
    pushProduct({
      code: "rebuild",
      label: "Rebuild through SanKash",
      reasoning: "The visible quote still leaves room for a cleaner or better-value option.",
      confidence: "high",
    });
  }

  if (multi.multi_itinerary_type === "multi_destination_indecision") {
    pushRecommendation({
      code: "destination_shortlist",
      title: "Shortlist the best-fit destination before pitching price",
      reasoning: "The uploads show indecision across destinations, so the close should start with fit, not just discounting.",
      confidence: "high",
      category: "trip_shape",
    });
  }

  if (multi.multi_itinerary_type === "same_trip_multi_seller" || multi.multi_itinerary_type === "same_destination_price_comparison") {
    pushRecommendation({
      code: "comparison_close",
      title: "Explain what drives the price difference",
      reasoning: "The customer is already comparing options, so the winning move is clarity on inclusions, hotels, and total landed cost.",
      confidence: "high",
      category: "pitch",
    });
  }

  if (intelligence.next_inputs_needed_json.length > 0) {
    pushRecommendation({
      code: "collect_missing_context",
      title: "Collect one missing input before hard-selling",
      reasoning: `The case still needs ${intelligence.next_inputs_needed_json[0].label.toLowerCase()} for a stronger close.`,
      confidence: "medium",
      category: "close",
    });
  }

  const alternatives = alternativeBenchmarks
    .filter((row) => row.benchmark_key !== benchmarkSummary.benchmark_key)
    .filter((row) => (row.sample_count ?? 0) >= 2)
    .filter((row) => row.avg_total_price != null)
    .sort((left, right) => (left.avg_total_price ?? Infinity) - (right.avg_total_price ?? Infinity))
    .slice(0, 3)
    .map((row) => ({
      destination: [row.destination_city, row.destination_country].filter(Boolean).join(", "),
      avg_total_price: row.avg_total_price ?? null,
      sample_count: row.sample_count ?? 0,
      reason: "Comparable trip shapes in market memory look cheaper here.",
      confidence: (row.weighted_sample_score ?? 0) >= 3 ? "medium" as IntentConfidenceBand : "low" as IntentConfidenceBand,
    }));

  if (alternatives.length > 0 && ((benchmarkSummary.price_position ?? "unknown") === "high" || multi.multi_itinerary_type === "multi_destination_indecision")) {
    pushRecommendation({
      code: "alternative_destination_check",
      title: "Offer one or two better-value destination alternatives",
      reasoning: "Market memory shows cheaper comparable options that may fit this traveler's budget or indecision state.",
      confidence: "medium",
      category: "benchmark",
    });
  }

  const pitchSequence = [
    intent.recommended_pitch_angle === "guide_to_best_fit_destination"
      ? { code: "fit_first", title: "Start with best-fit destination", why_now: "The customer is still choosing the trip itself." }
      : null,
    products.find((item) => item.code === "rebuild")
      ? { code: "rebuild", title: "Rebuild through SanKash", why_now: "The current quote leaves room for a cleaner offer." }
      : null,
    products.find((item) => item.code === "no_cost_emi")
      ? { code: "no_cost_emi", title: "Pitch No-Cost EMI", why_now: "If the trip is booked through SanKash, charges can come back as cashback." }
      : null,
    products.find((item) => item.code === "emi")
      ? { code: "emi", title: "Pitch standard EMI", why_now: "Monthly affordability can unlock the booking even if the customer stays with the current seller." }
      : null,
    products.find((item) => item.code === "travel_insurance")
      ? { code: "travel_insurance", title: "Pitch Travel Insurance", why_now: "Protection is not strong enough yet." }
      : null,
  ].filter(Boolean) as Array<{ code: string; title: string; why_now: string }>;

  return {
    top_recommendations: recommendations.slice(0, 5),
    suggested_alternative_destinations: alternatives,
    recommended_products: products,
    suggested_pitch_sequence: pitchSequence,
    benchmark_price_position: benchmarkSummary.price_position ?? "unknown",
  };
}

export function buildLearningSignals(params: {
  classification: LeadClassification;
  lead: LeadRecordLike;
  merged: MergedTripBrainLike;
  intent: IntentAssessment;
  sourceLikelihood?: SourceLikelihoodAssessment | null;
}): LearningSignals {
  const { classification, lead, merged, intent, sourceLikelihood } = params;
  const hasContact = Boolean(asText(lead.mobile_number) || asText(lead.email));
  const highTrustSource = sourceLikelihood?.likely_source_profile === "personalized_seller_quote" || sourceLikelihood?.likely_source_profile === "genuine_custom_planning_upload";
  const brochureLike = sourceLikelihood?.likely_source_profile === "public_brochure_or_ota" || sourceLikelihood?.likely_source_profile === "benchmark_or_test_upload";

  let signalClass: LearningSignalClass = "research_signal";
  let weight = 1;

  if (classification === "sales_lead" && hasContact) {
    signalClass = "sales_signal";
    weight = 1.35;
  } else if (classification === "noise") {
    signalClass = "low_trust_signal";
    weight = 0.35;
  } else if (brochureLike && !hasContact) {
    signalClass = "possible_benchmark_only_signal";
    weight = 0.65;
  } else {
    signalClass = "research_signal";
    weight = 0.9;
  }

  if (intent.conversion_probability_band === "high" && hasContact) weight += 0.2;
  if (merged.parsing_confidence === "low") weight -= 0.15;
  if (highTrustSource) weight += 0.1;

  weight = Math.max(0.2, Math.min(1.75, Number(weight.toFixed(2))));

  return {
    learning_signal_class: signalClass,
    learning_weight: weight,
    benchmark_signal_weight: signalClass === "low_trust_signal" ? 0.25 : signalClass === "possible_benchmark_only_signal" ? 0.7 : weight,
    explanation: hasContact
      ? "This trip carries stronger learning weight because the lead has contact context."
      : brochureLike
        ? "This looks useful for benchmark memory, but weaker for conversion learning."
        : "This anonymous upload still teaches the system, but with lighter sales-weighting.",
  };
}

export function deriveSourceLikelihoodAssessment(params: {
  lead: LeadRecordLike;
  analyses: AnalysisRecordLike[];
  merged: MergedTripBrainLike;
  similarSummary: SimilarSummaryLike;
}): SourceLikelihoodAssessment {
  const { lead, analyses, merged, similarSummary } = params;
  const combinedText = [
    merged.inclusions_text,
    merged.exclusions_text,
    ...analyses.map((row) => row.inclusions_text),
    ...analyses.map((row) => row.exclusions_text),
  ].filter(Boolean).join(" ").toLowerCase();

  const normalizedCustomerName = asText(merged.customer_name)?.toLowerCase();
  const hasPersonalization = Boolean(
    asText(lead.mobile_number) ||
    asText(lead.email) ||
    (normalizedCustomerName && normalizedCustomerName !== "traveler (anonymous)")
  );
  const brochureSignals = [
    /\bday 0?\d\b/.test(combinedText),
    /\binclusions\b/.test(combinedText) && /\bexclusions\b/.test(combinedText),
    /\bor similar\b/.test(combinedText),
    /\bstarting from\b|\bper person\b/.test(combinedText),
  ].filter(Boolean).length;
  const customSignals = [
    hasPersonalization,
    merged.conflicting_fields_json.length > 0,
    analyses.length > 1,
    /\bfinal quote\b|\brevised quote\b|\bpassenger\b/.test(combinedText),
  ].filter(Boolean).length;
  const comparisonSignals = [
    analyses.length > 1,
    similarSummary.match_count != null && similarSummary.match_count > 0 && analyses.length > 1,
    merged.conflicting_fields_json.length > 0,
  ].filter(Boolean).length;

  const probabilities = {
    public_brochure_or_ota: brochureSignals >= 3 ? 0.7 : brochureSignals === 2 ? 0.45 : brochureSignals === 1 ? 0.28 : 0.18,
    personalized_seller_quote: hasPersonalization ? 0.7 : customSignals >= 2 ? 0.5 : customSignals === 1 ? 0.28 : 0.12,
    comparison_shopping_upload: comparisonSignals >= 2 ? 0.65 : comparisonSignals === 1 ? 0.3 : 0.12,
    benchmark_or_test_upload: !hasPersonalization && analyses.length === 1 && merged.analysis_count === 1 && brochureSignals >= 3 ? 0.35 : !hasPersonalization && brochureSignals >= 1 ? 0.16 : 0.08,
    genuine_custom_planning_upload: customSignals >= 3 ? 0.6 : customSignals === 2 ? 0.34 : 0.12,
  };

  let bestProfile: SourceLikelihoodAssessment["likely_source_profile"] = "unclear";
  let bestScore = 0;
  for (const [key, value] of Object.entries(probabilities)) {
    if (value > bestScore) {
      bestScore = value;
      bestProfile = key as SourceLikelihoodAssessment["likely_source_profile"];
    }
  }

  const explanation = bestProfile === "public_brochure_or_ota"
    ? "The upload reads like a brochure-style package with template structure and low personalization."
    : bestProfile === "personalized_seller_quote"
      ? "The upload carries signs of a real seller quote with customer-specific context."
      : bestProfile === "comparison_shopping_upload"
        ? "The uploads look like comparison shopping rather than one clean itinerary document."
        : bestProfile === "benchmark_or_test_upload"
          ? "This looks closer to a generic benchmark/test upload than a live booking conversation."
          : bestProfile === "genuine_custom_planning_upload"
            ? "The case looks like custom trip planning with evolving or negotiated details."
            : "The source profile is mixed, so the ops team should treat it cautiously.";

  return {
    likely_source_profile: bestProfile,
    confidence: bestScore >= 0.7 ? "high" : bestScore >= 0.45 ? "medium" : "low",
    probabilities,
    explanation,
  };
}
