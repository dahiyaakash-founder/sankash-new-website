import {
  deriveItineraryIntelligence,
  type DerivedItineraryIntelligence,
} from "./itinerary-intelligence.ts";
import {
  buildIntentSignals,
  buildLearningSignals,
  buildRecommendationEngine,
  deriveIntentAssessment,
  deriveMultiItineraryInsight,
  deriveSourceLikelihoodAssessment,
  type IntentAssessment,
  type LearningSignals,
  type MultiItineraryInsight,
  type RecommendationEngineOutput,
} from "./trip-commercial-intelligence.ts";
import {
  buildLeadOutcomeSnapshot,
  buildOutcomeLearningSummary,
  type DestinationOutcomeBenchmarkLike,
  type LeadIntentSignalLike,
  type LeadOutcomeSnapshot,
  type PitchOutcomeMemoryLike,
  type ProductOutcomeMemoryLike,
} from "./trip-outcome-learning.ts";

export const TRAVELER_INTELLIGENCE_VERSION = "traveler-intelligence-v1";
export const OPS_COPILOT_VERSION = "ops-copilot-v2";
export const BENCHMARK_ENGINE_VERSION = "benchmark-engine-v2";
export const SOURCE_ENRICHMENT_VERSION = "source-likelihood-v1";
export const OUTCOME_LEARNING_VERSION = "outcome-learning-v1";

type LeadClassification = "sales_lead" | "research_lead" | "noise";
type ConfidenceBand = "high" | "medium" | "low";

interface LeadRecord {
  id: string;
  full_name?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  lead_source_page?: string | null;
  audience_type?: string | null;
  status?: string | null;
  outcome?: string | null;
  assigned_to?: string | null;
  lead_source_type?: string | null;
  quote_amount?: number | null;
  next_follow_up_at?: string | null;
  metadata_json?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
  closed_at?: string | null;
  customer_name?: string | null;
}

interface AttachmentRecord {
  id: string;
  file_name?: string | null;
  category?: string | null;
  mime_type?: string | null;
  uploaded_at?: string | null;
}

interface AnalysisRecord {
  id: string;
  created_at?: string | null;
  parsing_confidence?: string | null;
  extracted_completeness_score?: number | null;
  uploaded_by_audience?: string | null;
  domestic_or_international?: string | null;
  destination_country?: string | null;
  destination_city?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  duration_nights?: number | null;
  duration_days?: number | null;
  total_price?: number | null;
  price_per_person?: number | null;
  currency?: string | null;
  traveller_count_total?: number | null;
  adults_count?: number | null;
  children_count?: number | null;
  infants_count?: number | null;
  travel_agent_name?: string | null;
  customer_name?: string | null;
  hotel_names_json?: unknown;
  airline_names_json?: unknown;
  sectors_json?: unknown;
  additional_destinations_json?: unknown;
  inclusions_text?: string | null;
  exclusions_text?: string | null;
  visa_mentioned?: boolean | null;
  insurance_mentioned?: boolean | null;
  missing_fields_json?: unknown;
  extraction_warnings_json?: unknown;
  flight_departure_time?: string | null;
  flight_arrival_time?: string | null;
  hotel_check_in?: string | null;
  hotel_check_out?: string | null;
  file_count?: number | null;
  file_names_json?: unknown;
  package_mode?: string | null;
  advisory_summary?: string | null;
}

interface BenchmarkRow {
  benchmark_key: string;
  sample_count: number;
  weighted_sample_score?: number | null;
  min_total_price: number | null;
  max_total_price: number | null;
  avg_total_price: number | null;
  median_total_price: number | null;
  common_hotels_json: unknown;
  common_inclusions_json: unknown;
  common_exclusions_json: unknown;
  product_fit_summary_json: unknown;
}

interface SimilarCaseRow {
  unified_case_id: string;
  similar_case_id: string;
  similarity_score: number;
  similarity_reasons_json: unknown;
}

interface MarketMemoryPeer {
  unified_case_id: string;
  destination_city?: string | null;
  destination_country?: string | null;
  total_price?: number | null;
  package_mode?: string | null;
  traveler_count_total?: number | null;
  hotel_names_json?: unknown;
  product_fit_flags_json?: unknown;
}

interface LeadActivityRecord {
  activity_type?: string | null;
  created_at?: string | null;
}

interface OutcomeBenchmarkRow extends DestinationOutcomeBenchmarkLike {
  benchmark_key?: string | null;
}

interface FieldConflict {
  field: string;
  chosen: string;
  alternatives: string[];
}

interface ProductFitFlags {
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

interface MergedTripBrain {
  latest_analysis_id: string | null;
  source_page: string | null;
  audience_type: string | null;
  contact_present: boolean;
  analysis_count: number;
  attachment_count: number;
  parsing_confidence: ConfidenceBand;
  destination_city: string | null;
  destination_country: string | null;
  domestic_or_international: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  duration_days: number | null;
  duration_nights: number | null;
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
  flight_departure_time: string | null;
  flight_arrival_time: string | null;
  hotel_check_in: string | null;
  hotel_check_out: string | null;
  missing_fields_json: string[];
  extraction_warnings_json: string[];
  conflicting_fields_json: FieldConflict[];
  package_mode: string;
  benchmark_key: string;
  itinerary_archetype: string;
}

interface TravelerOutput {
  summary: string;
  json: Record<string, unknown>;
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const values: string[] = [];
  for (const item of input) {
    const text = asText(item);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    values.push(text);
  }
  return values;
}

function normalizeObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return input as Record<string, unknown>;
}

function hasText(value: unknown) {
  return asText(value) != null;
}

function formatMoney(amount: number | null | undefined, currency = "INR") {
  if (amount == null) return null;
  return `${currency.toUpperCase()} ${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(date: string | null | undefined) {
  if (!date) return null;
  return date;
}

function normalizeKey(value: unknown) {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value.trim().toLowerCase();
  return JSON.stringify(value);
}

function confidenceRank(value: string | null | undefined) {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function rowStrength(row: AnalysisRecord, index: number) {
  return confidenceRank(row.parsing_confidence) * 1000 + (row.extracted_completeness_score ?? 0) * 10 - index;
}

function pickBestScalar<T>(
  rows: AnalysisRecord[],
  field: string,
  getter: (row: AnalysisRecord) => T | null,
): { value: T | null; conflict: FieldConflict | null } {
  const candidates = rows
    .map((row, index) => ({ row, index, value: getter(row), score: rowStrength(row, index) }))
    .filter((entry) => entry.value != null);

  if (candidates.length === 0) return { value: null, conflict: null };

  candidates.sort((left, right) => right.score - left.score);
  const chosen = candidates[0].value as T;
  const distinctValues = Array.from(new Set(candidates.map((entry) => normalizeKey(entry.value))));

  if (distinctValues.length <= 1) {
    return { value: chosen, conflict: null };
  }

  const alternatives = candidates
    .map((entry) => String(entry.value))
    .filter((value) => value !== String(chosen));

  return {
    value: chosen,
    conflict: {
      field,
      chosen: String(chosen),
      alternatives: Array.from(new Set(alternatives)).slice(0, 5),
    },
  };
}

function pickBestText(rows: AnalysisRecord[], field: string, getter: (row: AnalysisRecord) => string | null) {
  return pickBestScalar(rows, field, getter);
}

function pickBestNumber(rows: AnalysisRecord[], field: string, getter: (row: AnalysisRecord) => number | null) {
  return pickBestScalar(rows, field, getter);
}

function pickMergedBoolean(rows: AnalysisRecord[], getter: (row: AnalysisRecord) => boolean | null) {
  const candidates = rows.map(getter).filter((value) => value != null) as boolean[];
  if (candidates.length === 0) return null;
  return candidates.some(Boolean);
}

function mergeArrays(rows: AnalysisRecord[], getter: (row: AnalysisRecord) => string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const row of rows) {
    for (const value of getter(row)) {
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(value);
    }
  }

  return merged;
}

function buildMergedMissingFields(merged: MergedTripBrain) {
  const missing: string[] = [];

  if (!merged.destination_city && !merged.destination_country) {
    missing.push("destination_city", "destination_country");
  }
  if (!merged.travel_start_date) missing.push("travel_start_date");
  if (!merged.travel_end_date) missing.push("travel_end_date");
  if (merged.total_price == null && merged.price_per_person == null) missing.push("total_price");
  if (merged.traveller_count_total == null) missing.push("traveller_count_total");
  if (merged.hotel_names_json.length === 0) missing.push("hotel_names");
  if (merged.airline_names_json.length === 0 && merged.sectors_json.length === 0) missing.push("airline_names");
  if (!merged.flight_arrival_time) missing.push("flight_arrival_time");
  if (!merged.hotel_check_in) missing.push("hotel_check_in");

  return Array.from(new Set(missing));
}

function travelWindow(dateStart: string | null, dateEnd: string | null) {
  if (dateStart && dateEnd) return `${dateStart} to ${dateEnd}`;
  return dateStart ?? dateEnd ?? null;
}

function destinationLabel(city: string | null, country: string | null) {
  if (city && country) return `${city}, ${country}`;
  return city ?? country ?? "this trip";
}

function buildArchetype(merged: MergedTripBrain) {
  const domesticTag = merged.domestic_or_international === "international" ? "international" : "domestic";
  const packageTag = merged.package_mode || "unknown";
  const destinationTag = merged.destination_city
    ? merged.destination_city.toLowerCase().replace(/[^a-z0-9]+/g, "_")
    : merged.destination_country
      ? merged.destination_country.toLowerCase().replace(/[^a-z0-9]+/g, "_")
      : "unknown";

  if (packageTag === "hotels_only") return `${domesticTag}_stay_${destinationTag}`;
  if (packageTag === "land_only") return `${domesticTag}_land_package_${destinationTag}`;
  if (packageTag === "flights_and_hotels") return `${domesticTag}_full_trip_${destinationTag}`;
  if (packageTag === "custom") return `${domesticTag}_custom_trip_${destinationTag}`;
  return `${domesticTag}_unknown_trip_${destinationTag}`;
}

function buildBenchmarkKey(merged: MergedTripBrain) {
  const destinationKey = (merged.destination_city ?? merged.destination_country ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  const durationBucket = merged.duration_days == null
    ? "unknown"
    : merged.duration_days <= 3
      ? "short"
      : merged.duration_days <= 6
        ? "medium"
        : merged.duration_days <= 10
          ? "long"
          : "extended";
  const travelerBucket = merged.traveller_count_total == null
    ? "unknown"
    : merged.traveller_count_total === 1
      ? "solo"
      : merged.traveller_count_total === 2
        ? "pair"
        : merged.traveller_count_total <= 4
          ? "small_group"
          : "group";

  return [
    merged.domestic_or_international ?? "unknown",
    destinationKey,
    merged.package_mode ?? "unknown",
    durationBucket,
    travelerBucket,
  ].join("|");
}

export function mergeLeadAnalysisRows(
  lead: LeadRecord,
  analyses: AnalysisRecord[],
  attachments: AttachmentRecord[],
): MergedTripBrain {
  const rows = [...analyses].sort((left, right) => {
    const leftTime = new Date(left.created_at ?? 0).getTime();
    const rightTime = new Date(right.created_at ?? 0).getTime();
    return rightTime - leftTime;
  });

  const conflicts: FieldConflict[] = [];
  const addConflict = (conflict: FieldConflict | null) => {
    if (!conflict) return;
    if (conflict.alternatives.length === 0) return;
    conflicts.push(conflict);
  };

  const destinationCity = pickBestText(rows, "destination_city", (row) => asText(row.destination_city));
  addConflict(destinationCity.conflict);
  const destinationCountry = pickBestText(rows, "destination_country", (row) => asText(row.destination_country));
  addConflict(destinationCountry.conflict);
  const domesticOrInternational = pickBestText(rows, "domestic_or_international", (row) => asText(row.domestic_or_international));
  addConflict(domesticOrInternational.conflict);
  const travelStart = pickBestText(rows, "travel_start_date", (row) => asText(row.travel_start_date));
  addConflict(travelStart.conflict);
  const travelEnd = pickBestText(rows, "travel_end_date", (row) => asText(row.travel_end_date));
  addConflict(travelEnd.conflict);
  const durationDays = pickBestNumber(rows, "duration_days", (row) => asNumber(row.duration_days));
  addConflict(durationDays.conflict);
  const durationNights = pickBestNumber(rows, "duration_nights", (row) => asNumber(row.duration_nights));
  addConflict(durationNights.conflict);
  const totalPrice = pickBestNumber(rows, "total_price", (row) => asNumber(row.total_price));
  addConflict(totalPrice.conflict);
  const pricePerPerson = pickBestNumber(rows, "price_per_person", (row) => asNumber(row.price_per_person));
  addConflict(pricePerPerson.conflict);
  const travellerCount = pickBestNumber(rows, "traveller_count_total", (row) => asNumber(row.traveller_count_total));
  addConflict(travellerCount.conflict);
  const adultsCount = pickBestNumber(rows, "adults_count", (row) => asNumber(row.adults_count));
  addConflict(adultsCount.conflict);
  const childrenCount = pickBestNumber(rows, "children_count", (row) => asNumber(row.children_count));
  addConflict(childrenCount.conflict);
  const infantsCount = pickBestNumber(rows, "infants_count", (row) => asNumber(row.infants_count));
  addConflict(infantsCount.conflict);
  const agentName = pickBestText(rows, "travel_agent_name", (row) => asText(row.travel_agent_name));
  const customerName = pickBestText(rows, "customer_name", (row) => asText(row.customer_name));
  const inclusions = pickBestText(rows, "inclusions_text", (row) => asText(row.inclusions_text));
  const exclusions = pickBestText(rows, "exclusions_text", (row) => asText(row.exclusions_text));
  const flightDepartureTime = pickBestText(rows, "flight_departure_time", (row) => asText(row.flight_departure_time));
  const flightArrivalTime = pickBestText(rows, "flight_arrival_time", (row) => asText(row.flight_arrival_time));
  const hotelCheckIn = pickBestText(rows, "hotel_check_in", (row) => asText(row.hotel_check_in));
  const hotelCheckOut = pickBestText(rows, "hotel_check_out", (row) => asText(row.hotel_check_out));
  const confidence = pickBestText(rows, "parsing_confidence", (row) => asText(row.parsing_confidence));

  const merged: MergedTripBrain = {
    latest_analysis_id: rows[0]?.id ?? null,
    source_page: asText(lead.lead_source_page),
    audience_type: asText(lead.audience_type),
    contact_present: Boolean(asText(lead.mobile_number) || asText(lead.email)),
    analysis_count: rows.length,
    attachment_count: attachments.length,
    parsing_confidence: ((confidence.value as ConfidenceBand | null) ?? "low") as ConfidenceBand,
    destination_city: destinationCity.value,
    destination_country: destinationCountry.value,
    domestic_or_international: domesticOrInternational.value,
    travel_start_date: travelStart.value,
    travel_end_date: travelEnd.value,
    duration_days: durationDays.value,
    duration_nights: durationNights.value,
    total_price: totalPrice.value,
    price_per_person: pricePerPerson.value,
    currency: asText(rows.find((row) => hasText(row.currency))?.currency) ?? "INR",
    traveller_count_total: travellerCount.value,
    adults_count: adultsCount.value,
    children_count: childrenCount.value,
    infants_count: infantsCount.value,
    travel_agent_name: agentName.value,
    customer_name: customerName.value,
    hotel_names_json: mergeArrays(rows, (row) => normalizeList(row.hotel_names_json)),
    airline_names_json: mergeArrays(rows, (row) => normalizeList(row.airline_names_json)),
    sectors_json: mergeArrays(rows, (row) => normalizeList(row.sectors_json)),
    additional_destinations_json: mergeArrays(rows, (row) => normalizeList(row.additional_destinations_json)),
    inclusions_text: inclusions.value,
    exclusions_text: exclusions.value,
    visa_mentioned: pickMergedBoolean(rows, (row) => asBoolean(row.visa_mentioned)),
    insurance_mentioned: pickMergedBoolean(rows, (row) => asBoolean(row.insurance_mentioned)),
    flight_departure_time: flightDepartureTime.value,
    flight_arrival_time: flightArrivalTime.value,
    hotel_check_in: hotelCheckIn.value,
    hotel_check_out: hotelCheckOut.value,
    missing_fields_json: [],
    extraction_warnings_json: mergeArrays(rows, (row) => normalizeList(row.extraction_warnings_json)),
    conflicting_fields_json: conflicts,
    package_mode: "unknown",
    benchmark_key: "",
    itinerary_archetype: "",
  };

  const conflictWarnings = conflicts.map((conflict) => {
    const alternatives = conflict.alternatives.join(", ");
    return `Conflicting ${conflict.field.replace(/_/g, " ")} values were found across files. Using "${conflict.chosen}" over ${alternatives}.`;
  });
  merged.extraction_warnings_json = Array.from(new Set([...merged.extraction_warnings_json, ...conflictWarnings]));
  merged.missing_fields_json = buildMergedMissingFields(merged);

  const mergedIntelligence = deriveItineraryIntelligence({
    domestic_or_international: merged.domestic_or_international,
    destination_country: merged.destination_country,
    destination_city: merged.destination_city,
    additional_destinations_json: merged.additional_destinations_json,
    travel_start_date: merged.travel_start_date,
    travel_end_date: merged.travel_end_date,
    duration_nights: merged.duration_nights,
    duration_days: merged.duration_days,
    total_price: merged.total_price,
    price_per_person: merged.price_per_person,
    currency: merged.currency,
    traveller_count_total: merged.traveller_count_total,
    adults_count: merged.adults_count,
    children_count: merged.children_count,
    infants_count: merged.infants_count,
    hotel_names_json: merged.hotel_names_json,
    airline_names_json: merged.airline_names_json,
    sectors_json: merged.sectors_json,
    inclusions_text: merged.inclusions_text,
    exclusions_text: merged.exclusions_text,
    visa_mentioned: merged.visa_mentioned,
    insurance_mentioned: merged.insurance_mentioned,
    flight_departure_time: merged.flight_departure_time,
    flight_arrival_time: merged.flight_arrival_time,
    hotel_check_in: merged.hotel_check_in,
    hotel_check_out: merged.hotel_check_out,
    parsing_confidence: merged.parsing_confidence,
    missing_fields_json: merged.missing_fields_json,
    extraction_warnings_json: merged.extraction_warnings_json,
  });

  merged.package_mode = mergedIntelligence.package_mode;
  merged.benchmark_key = buildBenchmarkKey(merged);
  merged.itinerary_archetype = buildArchetype(merged);

  return merged;
}

export function deriveLeadClassification(lead: LeadRecord, merged: MergedTripBrain, intelligence: DerivedItineraryIntelligence): LeadClassification {
  const contactPresent = merged.contact_present;
  const usableSignals = [
    merged.destination_city || merged.destination_country,
    merged.travel_start_date || merged.travel_end_date,
    merged.total_price != null || merged.price_per_person != null,
    merged.traveller_count_total != null,
    merged.hotel_names_json.length > 0,
    merged.airline_names_json.length > 0 || merged.sectors_json.length > 0,
    merged.package_mode !== "unknown",
  ].filter(Boolean).length;

  const anonymousName = (lead.full_name ?? "").trim().toLowerCase() === "traveler (anonymous)";
  const lowSignal = intelligence.extracted_completeness_score < 20 && usableSignals <= 1;

  if (!contactPresent && anonymousName && lowSignal) return "noise";
  if (contactPresent && usableSignals >= 1) return "sales_lead";
  if (usableSignals >= 2) return "research_lead";
  return "noise";
}

function deriveTags(text: string | null | undefined, type: "inclusion" | "exclusion") {
  const normalized = (text ?? "").toLowerCase();
  const tags: string[] = [];
  const patterns: Array<[string, RegExp]> = [
    ["flights", /\bflights?\b|\bairfare\b|\bair ticket\b/],
    ["hotel", /\bhotel\b|\baccommodation\b|\bstay\b/],
    ["breakfast", /\bbreakfast\b/],
    ["lunch", /\blunch\b/],
    ["dinner", /\bdinner\b/],
    ["transfers", /\btransfers?\b|\bpickup\b|\bdrop\b/],
    ["sightseeing", /\bsightseeing\b|\btour\b|\bactivity\b/],
    ["visa", /\bvisa\b/],
    ["insurance", /\binsurance\b/],
    ["taxes", /\bgst\b|\btcs\b|\btax\b/],
  ];

  for (const [tag, pattern] of patterns) {
    if (pattern.test(normalized)) tags.push(tag);
  }

  if (type === "exclusion" && normalized.includes("not included")) {
    tags.push("not_included");
  }

  return Array.from(new Set(tags));
}

export function buildTravelerOutput(
  lead: LeadRecord,
  merged: MergedTripBrain,
  intelligence: DerivedItineraryIntelligence,
): TravelerOutput {
  const destination = destinationLabel(merged.destination_city, merged.destination_country);
  const found: string[] = [];

  if (merged.total_price != null) found.push(`Trip price visible at ${formatMoney(merged.total_price, merged.currency)}`);
  else if (merged.price_per_person != null) found.push(`Per-traveler quote visible at ${formatMoney(merged.price_per_person, merged.currency)}`);
  if (merged.traveller_count_total != null) found.push(`${merged.traveller_count_total} travelers identified`);
  if (merged.hotel_names_json.length > 0) found.push(`Hotel details found: ${merged.hotel_names_json.slice(0, 2).join(", ")}`);
  if (merged.airline_names_json.length > 0) found.push(`Flight context found: ${merged.airline_names_json.slice(0, 2).join(", ")}`);
  if (merged.inclusions_text) found.push("Package inclusions were detected");

  const missing = intelligence.next_inputs_needed_json.map((item) => item.label);
  const unlock = intelligence.unlockable_modules_json.map((item) => ({
    label: item.label,
    status: item.status,
    reason: item.reason,
  }));

  const travelerName = asText(lead.full_name);
  const summary = [
    travelerName && travelerName.toLowerCase() !== "traveler (anonymous)" ? `${travelerName} appears to be planning` : "This looks like",
    `${destination}`,
    merged.duration_days != null ? `for ${merged.duration_days} days` : null,
    merged.total_price != null ? `with a visible quote of ${formatMoney(merged.total_price, merged.currency)}` : null,
    merged.package_mode !== "unknown" ? `as a ${merged.package_mode.replace(/_/g, " ")}` : null,
  ].filter(Boolean).join(" ");

  return {
    summary,
    json: {
      trip_snapshot: {
        destination,
        domestic_or_international: merged.domestic_or_international,
        dates: travelWindow(merged.travel_start_date, merged.travel_end_date),
        travelers: merged.traveller_count_total,
        total_price: merged.total_price,
        price_per_person: merged.price_per_person,
        currency: merged.currency,
        package_mode: merged.package_mode,
      },
      what_we_found: found,
      what_is_missing: missing,
      what_you_can_unlock_next: unlock,
      trust_summary: intelligence.advisory_insights_json.slice(0, 4),
    },
  };
}

export function buildBenchmarkSummary(merged: MergedTripBrain, row: BenchmarkRow | null) {
  if (!row || row.sample_count <= 0) {
    return {
      benchmark_key: merged.benchmark_key,
      sample_count: 0,
      price_position: "unknown",
      note: "We do not have enough comparable cases yet to benchmark this quote strongly.",
      common_hotels: [],
      common_inclusions: [],
      common_exclusions: [],
    };
  }

  const median = row.median_total_price ?? row.avg_total_price ?? null;
  let pricePosition: "high" | "fair" | "low" | "unknown" = "unknown";
  if (merged.total_price != null && median != null && median > 0) {
    if (merged.total_price > median * 1.15) pricePosition = "high";
    else if (merged.total_price < median * 0.85) pricePosition = "low";
    else pricePosition = "fair";
  }

  const note = pricePosition === "high"
    ? "This quote looks above the usual market band for similar visible trips."
    : pricePosition === "low"
      ? "This quote looks sharper than the usual market band, so verify inclusions before treating it as a bargain."
      : pricePosition === "fair"
        ? "This quote sits inside the usual market band for comparable visible trips."
        : "There is not enough price clarity yet to judge whether the quote is fair.";

  return {
    benchmark_key: merged.benchmark_key,
    sample_count: row.sample_count,
    weighted_sample_score: row.weighted_sample_score ?? row.sample_count,
    min_total_price: row.min_total_price,
    max_total_price: row.max_total_price,
    avg_total_price: row.avg_total_price,
    median_total_price: row.median_total_price,
    price_position: pricePosition,
    note,
    common_hotels: normalizeList(row.common_hotels_json),
    common_inclusions: normalizeList(row.common_inclusions_json),
    common_exclusions: normalizeList(row.common_exclusions_json),
    product_fit_summary: normalizeObject(row.product_fit_summary_json),
  };
}

export function buildSimilarSummary(rows: SimilarCaseRow[], peers: MarketMemoryPeer[]) {
  const peerMap = new Map(peers.map((peer) => [peer.unified_case_id, peer]));
  const topMatches = rows
    .sort((left, right) => right.similarity_score - left.similarity_score)
    .slice(0, 5)
    .map((row) => {
      const peer = peerMap.get(row.similar_case_id);
      return {
        unified_case_id: row.similar_case_id,
        similarity_score: row.similarity_score,
        destination: destinationLabel(peer?.destination_city ?? null, peer?.destination_country ?? null),
        total_price: peer?.total_price ?? null,
        package_mode: peer?.package_mode ?? null,
        hotel_names: normalizeList(peer?.hotel_names_json).slice(0, 2),
        reasons: Array.isArray(row.similarity_reasons_json) ? row.similarity_reasons_json : [],
      };
    });

  return {
    match_count: rows.length,
    top_matches: topMatches,
  };
}

function computeUrgencyScore(lead: LeadRecord, merged: MergedTripBrain) {
  if (!merged.travel_start_date) return lead.status === "qualified" ? 55 : 30;
  const start = new Date(`${merged.travel_start_date}T00:00:00Z`).getTime();
  if (!Number.isFinite(start)) return 35;
  const diffDays = Math.round((start - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 90;
  if (diffDays <= 21) return 75;
  if (diffDays <= 45) return 60;
  return 40;
}

function computeIntentScore(merged: MergedTripBrain) {
  let score = 10;
  if (merged.contact_present) score += 25;
  if (merged.total_price != null || merged.price_per_person != null) score += 15;
  if (merged.travel_start_date) score += 15;
  if (merged.traveller_count_total != null) score += 10;
  if (merged.hotel_names_json.length > 0) score += 10;
  if (merged.airline_names_json.length > 0 || merged.sectors_json.length > 0) score += 10;
  if (merged.package_mode !== "unknown") score += 10;
  return Math.min(100, score);
}

function computeLeadQualityScore(classification: LeadClassification, intelligence: DerivedItineraryIntelligence, merged: MergedTripBrain) {
  let score = classification === "sales_lead" ? 60 : classification === "research_lead" ? 35 : 10;
  score += Math.min(30, intelligence.extracted_completeness_score / 2);
  if (merged.contact_present) score += 10;
  return Math.min(100, Math.round(score));
}

export function buildProductFitFlags(
  lead: LeadRecord,
  merged: MergedTripBrain,
  intelligence: DerivedItineraryIntelligence,
  classification: LeadClassification,
  benchmarkSummary: Record<string, unknown>,
): ProductFitFlags {
  const totalPrice = merged.total_price ?? (merged.price_per_person != null && merged.traveller_count_total != null
    ? merged.price_per_person * merged.traveller_count_total
    : null);
  const pricePosition = benchmarkSummary.price_position as string | undefined;
  const decisionCodes = intelligence.decision_flags_json.map((flag) => flag.code);
  const isInternational = merged.domestic_or_international === "international";

  const emiEligible = totalPrice != null && totalPrice >= 20000 && totalPrice <= 2000000;
  const noCostEmiCandidate = emiEligible && classification !== "noise" && merged.package_mode !== "unknown";
  const travelInsuranceCandidate =
    isInternational ||
    decisionCodes.includes("insurance_not_visible") ||
    (totalPrice != null && totalPrice >= 100000);
  const visaProtectionCandidate = isInternational || merged.visa_mentioned === true;
  const rebuildCandidate =
    merged.package_mode === "unknown" ||
    merged.conflicting_fields_json.length > 0 ||
    decisionCodes.includes("price_missing_or_partial") ||
    decisionCodes.includes("transport_missing_from_total") ||
    pricePosition === "high";
  const betterValueCandidate = pricePosition === "high" || (merged.total_price == null && merged.price_per_person != null);
  const pgCandidate = totalPrice != null && totalPrice > 0;

  return {
    emi_eligible: emiEligible,
    no_cost_emi_candidate: noCostEmiCandidate,
    travel_insurance_candidate: travelInsuranceCandidate,
    visa_protection_candidate: visaProtectionCandidate,
    rebuild_candidate: rebuildCandidate,
    better_value_candidate: betterValueCandidate,
    pg_candidate: pgCandidate,
    urgency_score: computeUrgencyScore(lead, merged),
    intent_score: computeIntentScore(merged),
    lead_quality_score: computeLeadQualityScore(classification, intelligence, merged),
  };
}

export function buildOpsCopilot(
  lead: LeadRecord,
  merged: MergedTripBrain,
  intelligence: DerivedItineraryIntelligence,
  classification: LeadClassification,
  benchmarkSummary: Record<string, unknown>,
  similarSummary: Record<string, unknown>,
  productFit: ProductFitFlags,
  intent?: IntentAssessment,
  multi?: MultiItineraryInsight,
  recommendations?: RecommendationEngineOutput,
  sourceLikelihood?: Record<string, unknown> | null,
  outcomeLearning?: Record<string, unknown> | null,
) {
  const safeIntent = intent ?? {
    intent_score: productFit.intent_score,
    conversion_probability_band: "medium" as const,
    decision_stage: "option_comparison" as const,
    likely_customer_motive: "quote_validation",
    recommended_pitch_angle: "clarify_quote_and_close",
    intent_explanation: "Intent defaults were used because the richer intent engine was not supplied.",
    intent_confidence: "low" as const,
  };
  const safeMulti = multi ?? {
    multi_itinerary_type: "single_itinerary" as const,
    multi_itinerary_summary: "Single itinerary view.",
    file_relationship_explanation: "Single itinerary view.",
    buying_state_inference: "single_quote_review",
    talk_tracks_for_multi_case: [],
    common_patterns: [],
    ops_conversion_use: "Use the merged summary and fill missing gaps.",
  };
  const safeRecommendations = recommendations ?? {
    top_recommendations: [],
    suggested_alternative_destinations: [],
    recommended_products: [],
    suggested_pitch_sequence: [],
    benchmark_price_position: String(benchmarkSummary.price_position ?? "unknown"),
  };
  const safeOutcomeLearning = outcomeLearning ?? {};

  const wrongItems = intelligence.decision_flags_json
    .filter((flag) => flag.active)
    .map((flag) => ({
      code: flag.code,
      title: flag.title,
      detail: flag.detail,
      severity: flag.severity,
    }));

  for (const conflict of merged.conflicting_fields_json) {
    wrongItems.push({
      code: `conflict_${conflict.field}`,
      title: `Conflicting ${conflict.field.replace(/_/g, " ")}`,
      detail: `Different uploads disagree on ${conflict.field.replace(/_/g, " ")}. Chosen value: ${conflict.chosen}.`,
      severity: "medium",
    });
  }

  if ((benchmarkSummary.price_position as string | undefined) === "high") {
    wrongItems.push({
      code: "benchmark_high_quote",
      title: "Quote looks high versus similar visible cases",
      detail: String(benchmarkSummary.note ?? ""),
      severity: "high",
    });
  }

  const opportunities: Array<Record<string, unknown>> = [];
  const addOpportunity = (item: Record<string, unknown>) => opportunities.push(item);

  if (productFit.rebuild_candidate) {
    addOpportunity({
      code: "rebuild",
      title: "Rebuild through SanKash",
      priority: "high",
      reason: "The current quote looks partial, unclear, or leaves room for a cleaner option.",
    });
  }
  if (productFit.emi_eligible) {
    addOpportunity({
      code: "emi",
      title: "Pitch standard EMI",
      priority: "high",
      reason: "Trip value is large enough to finance directly.",
    });
  }
  if (productFit.no_cost_emi_candidate) {
    addOpportunity({
      code: "no_cost_emi",
      title: "Pitch No-Cost EMI",
      priority: "high",
      reason: "If booked through SanKash, we can return interest and charges as cashback.",
    });
  }
  if (productFit.travel_insurance_candidate) {
    addOpportunity({
      code: "travel_insurance",
      title: "Pitch Travel Insurance",
      priority: merged.domestic_or_international === "international" ? "high" : "medium",
      reason: "The visible trip has protection risk or insurance is not clearly included.",
    });
  }
  if (productFit.visa_protection_candidate) {
    addOpportunity({
      code: "visa_protection",
      title: "Pitch visa / protection support",
      priority: "medium",
      reason: "International travel here has visa or documentation risk.",
    });
  }
  if (productFit.better_value_candidate) {
    addOpportunity({
      code: "better_value",
      title: "Pitch a better-value quote check",
      priority: "medium",
      reason: "We may be able to improve value or price clarity versus the visible quote.",
    });
  }
  if (productFit.pg_candidate) {
    addOpportunity({
      code: "pg",
      title: "Pitch PG / payout-led financing",
      priority: "low",
      reason: "Trip amount is large enough to support a payout-led conversation if needed.",
    });
  }

  const pitchSequence = opportunities.map((item) => ({
    code: item.code,
    title: item.title,
    why_now: item.reason,
  }));

  for (const recommendation of safeRecommendations.top_recommendations.slice(0, 3)) {
    if (!wrongItems.some((item) => item.code === recommendation.code)) {
      wrongItems.push({
        code: recommendation.code,
        title: recommendation.title,
        detail: recommendation.reasoning,
        severity: recommendation.confidence === "high" ? "medium" : "low",
      });
    }
  }

  const customerName = asText(lead.full_name) && (lead.full_name ?? "").toLowerCase() !== "traveler (anonymous)"
    ? lead.full_name!.split(" ")[0]
    : "the customer";
  const destination = destinationLabel(merged.destination_city, merged.destination_country);
  const topGap = wrongItems[0]?.detail ?? "the current quote still needs one or two confirmations";

  const talkingPoints = [
    {
      title: "Start with the visible gap",
      body: `Tell ${customerName} that this ${destination} quote still leaves open points around ${topGap.replace(/\.$/, "")}.`,
    },
    {
      title: "Pitch standard EMI the right way",
      body: "Explain that the customer can take a loan on the itinerary and receive the disbursal in their own account, then pay EMI plus interest and charges.",
    },
    {
      title: "Pitch No-Cost EMI only when we book it",
      body: "Explain that No-Cost EMI works when the itinerary is booked through SanKash. The interest amount and other charges are returned as cashback to the customer account.",
    },
  ];

  if (productFit.travel_insurance_candidate) {
    talkingPoints.push({
      title: "Pitch travel protection",
      body: "Point out that protection is weak or unclear here, and position Travel Insurance as a clean close-the-gap add-on.",
    });
  }

  if (productFit.rebuild_candidate) {
    talkingPoints.push({
      title: "Offer a cleaner rebuild",
      body: "Offer to rebuild or rebook the trip through SanKash if the current quote is partial, vague, or benchmark-high.",
    });
  }

  if (safeMulti.multi_itinerary_type !== "single_itinerary") {
    for (const track of safeMulti.talk_tracks_for_multi_case.slice(0, 2)) {
      talkingPoints.push(track);
    }
  }

  const whatsappFollowUp = [
    `Hi ${customerName}, I reviewed your ${destination} trip quote.`,
    wrongItems.length > 0 ? `A couple of important points still look open: ${wrongItems.slice(0, 2).map((item) => item.title.toLowerCase()).join(" and ")}.` : null,
    opportunities.length > 0 ? `We can help you rework the quote through SanKash and also check ${opportunities.slice(0, 3).map((item) => item.title).join(", ")}.` : null,
    "If you share the final quote page or a good time to call, we can take this forward quickly.",
  ].filter(Boolean).join(" ");

  const recommendationSummary = [
    classification === "sales_lead" ? "Sales-ready itinerary lead." : classification === "research_lead" ? "Useful market-learning itinerary." : "Low-signal itinerary submission.",
    benchmarkSummary.note as string | undefined,
    `Best pitch angle: ${safeIntent.recommended_pitch_angle.replace(/_/g, " ")}.`,
    typeof safeOutcomeLearning.summary === "string" ? safeOutcomeLearning.summary : undefined,
    opportunities.length > 0 ? `Best next pitch: ${opportunities[0].title}.` : undefined,
  ].filter(Boolean).join(" ");

  return {
    recommendation_summary: recommendationSummary,
    ops_summary: `${destination} | ${merged.package_mode.replace(/_/g, " ")} | lead quality ${productFit.lead_quality_score}/100`,
    what_looks_wrong_json: wrongItems,
    sankash_opportunity_json: opportunities,
    call_talking_points_json: talkingPoints,
    pitch_sequence_json: pitchSequence,
    whatsapp_follow_up: whatsappFollowUp,
    next_best_action_json: pitchSequence[0] ?? { code: "collect_missing_context", title: "Collect missing trip context", why_now: "The case still needs clearer source material." },
    benchmark_summary_json: benchmarkSummary,
    similar_trip_summary_json: similarSummary,
    product_fit_flags_json: productFit,
    intent_summary_json: safeIntent,
    multi_itinerary_read_json: safeMulti,
    top_recommendations_json: safeRecommendations.top_recommendations,
    suggested_alternative_destinations_json: safeRecommendations.suggested_alternative_destinations,
    recommended_products_json: safeRecommendations.recommended_products,
    suggested_pitch_sequence_json: safeRecommendations.suggested_pitch_sequence,
    benchmark_price_position: safeRecommendations.benchmark_price_position,
    conversion_probability_band: safeIntent.conversion_probability_band,
    decision_stage: safeIntent.decision_stage,
    likely_customer_motive: safeIntent.likely_customer_motive,
    recommended_pitch_angle: safeIntent.recommended_pitch_angle,
    intent_explanation: safeIntent.intent_explanation,
    intent_confidence: safeIntent.intent_confidence,
    source_likelihood_json: sourceLikelihood ?? {},
    outcome_learning_summary_json: safeOutcomeLearning,
    best_pitch_angle: safeIntent.recommended_pitch_angle,
    urgency_score: productFit.urgency_score,
    intent_score: safeIntent.intent_score,
    lead_quality_score: productFit.lead_quality_score,
    traveler_trust_score: Math.max(0, Math.min(100, intelligence.extracted_completeness_score)),
  };
}

async function markQueue(
  supabaseAdmin: any,
  leadId: string,
  status: "processing" | "done" | "error",
  errorMessage?: string,
) {
  const updates: Record<string, unknown> = {
    status,
    processed_at: status === "done" ? new Date().toISOString() : null,
    last_error: errorMessage ?? null,
  };

  if (status === "processing") {
    const { data } = await supabaseAdmin
      .from("trip_intelligence_refresh_queue")
      .select("attempts")
      .eq("lead_id", leadId)
      .maybeSingle();
    updates.attempts = ((data?.attempts as number | undefined) ?? 0) + 1;
  }

  await supabaseAdmin
    .from("trip_intelligence_refresh_queue")
    .update(updates)
    .eq("lead_id", leadId);
}

async function rebuildRollups(supabaseAdmin: any) {
  await supabaseAdmin.rpc("rebuild_trip_destination_benchmarks");
  await supabaseAdmin.rpc("rebuild_trip_hotel_frequency");
  await supabaseAdmin.rpc("rebuild_trip_similar_cases");
}

export async function refreshLeadTripIntelligence(params: {
  supabaseAdmin: any;
  leadId: string;
  reason?: string;
}) {
  const { supabaseAdmin, leadId, reason = "manual" } = params;

  await markQueue(supabaseAdmin, leadId, "processing").catch(() => {});

  try {
    const [
      { data: lead, error: leadError },
      { data: analyses, error: analysesError },
      { data: attachments, error: attachmentsError },
      { data: activity, error: activityError },
    ] = await Promise.all([
      supabaseAdmin.from("leads").select("*").eq("id", leadId).single(),
      supabaseAdmin.from("itinerary_analysis").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabaseAdmin.from("lead_attachments").select("*").eq("lead_id", leadId).order("uploaded_at", { ascending: false }),
      supabaseAdmin.from("lead_activity").select("activity_type, created_at").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(50),
    ]);

    if (leadError) throw leadError;
    if (analysesError) throw analysesError;
    if (attachmentsError) throw attachmentsError;
    if (activityError) throw activityError;

    if (!lead) throw new Error(`Lead not found: ${leadId}`);
    if (!analyses || analyses.length === 0) {
      await markQueue(supabaseAdmin, leadId, "done").catch(() => {});
      return { success: true, skipped: true, reason: "no_analysis" };
    }

    const merged = mergeLeadAnalysisRows(lead as LeadRecord, analyses as AnalysisRecord[], (attachments ?? []) as AttachmentRecord[]);
    const intelligence = deriveItineraryIntelligence({
      domestic_or_international: merged.domestic_or_international,
      destination_country: merged.destination_country,
      destination_city: merged.destination_city,
      additional_destinations_json: merged.additional_destinations_json,
      travel_start_date: merged.travel_start_date,
      travel_end_date: merged.travel_end_date,
      duration_nights: merged.duration_nights,
      duration_days: merged.duration_days,
      total_price: merged.total_price,
      price_per_person: merged.price_per_person,
      currency: merged.currency,
      traveller_count_total: merged.traveller_count_total,
      adults_count: merged.adults_count,
      children_count: merged.children_count,
      infants_count: merged.infants_count,
      hotel_names_json: merged.hotel_names_json,
      airline_names_json: merged.airline_names_json,
      sectors_json: merged.sectors_json,
      inclusions_text: merged.inclusions_text,
      exclusions_text: merged.exclusions_text,
      visa_mentioned: merged.visa_mentioned,
      insurance_mentioned: merged.insurance_mentioned,
      flight_departure_time: merged.flight_departure_time,
      flight_arrival_time: merged.flight_arrival_time,
      hotel_check_in: merged.hotel_check_in,
      hotel_check_out: merged.hotel_check_out,
      parsing_confidence: merged.parsing_confidence,
      missing_fields_json: merged.missing_fields_json,
      extraction_warnings_json: merged.extraction_warnings_json,
    });

    const classification = deriveLeadClassification(lead as LeadRecord, merged, intelligence);
    const travelerOutput = buildTravelerOutput(lead as LeadRecord, merged, intelligence);
    const multiItinerary = deriveMultiItineraryInsight({
      lead: lead as LeadRecord,
      analyses: (analyses ?? []) as AnalysisRecord[],
      merged,
      intelligence,
    });
    const intentSignals = buildIntentSignals({
      lead: lead as LeadRecord,
      merged,
      analyses: (analyses ?? []) as AnalysisRecord[],
      attachments: (attachments ?? []) as AttachmentRecord[],
      activity: (activity ?? []) as LeadActivityRecord[],
    });
    const initialSourceLikelihood = deriveSourceLikelihoodAssessment({
      lead: lead as LeadRecord,
      analyses: (analyses ?? []) as AnalysisRecord[],
      merged,
      similarSummary: { match_count: 0, top_matches: [] },
    });

    const initialProductFit = buildProductFitFlags(
      lead as LeadRecord,
      merged,
      intelligence,
      classification,
      { price_position: "unknown", note: "Benchmark pending" },
    );

    const brainRecord = {
      lead_id: leadId,
      latest_analysis_id: merged.latest_analysis_id,
      source_page: merged.source_page,
      audience_type: merged.audience_type,
      lead_classification: classification,
      contact_present: merged.contact_present,
      analysis_count: merged.analysis_count,
      attachment_count: merged.attachment_count,
      parsing_confidence: merged.parsing_confidence,
      extracted_completeness_score: intelligence.extracted_completeness_score,
      destination_city: merged.destination_city,
      destination_country: merged.destination_country,
      domestic_or_international: merged.domestic_or_international,
      travel_start_date: merged.travel_start_date,
      travel_end_date: merged.travel_end_date,
      duration_days: merged.duration_days,
      duration_nights: merged.duration_nights,
      total_price: merged.total_price,
      price_per_person: merged.price_per_person,
      currency: merged.currency,
      traveller_count_total: merged.traveller_count_total,
      adults_count: merged.adults_count,
      children_count: merged.children_count,
      infants_count: merged.infants_count,
      travel_agent_name: merged.travel_agent_name,
      customer_name: merged.customer_name,
      package_mode: intelligence.package_mode,
      hotel_names_json: merged.hotel_names_json,
      airline_names_json: merged.airline_names_json,
      sectors_json: merged.sectors_json,
      additional_destinations_json: merged.additional_destinations_json,
      inclusions_text: merged.inclusions_text,
      exclusions_text: merged.exclusions_text,
      missing_fields_json: merged.missing_fields_json,
      extraction_warnings_json: merged.extraction_warnings_json,
      conflicting_fields_json: merged.conflicting_fields_json,
      decision_flags_json: intelligence.decision_flags_json,
      traveler_questions_json: intelligence.traveler_questions_json,
      seller_questions_json: intelligence.seller_questions_json,
      unlockable_modules_json: intelligence.unlockable_modules_json,
      traveler_output_json: travelerOutput.json,
      unified_summary: travelerOutput.summary,
      benchmark_key: merged.benchmark_key,
      benchmark_summary_json: {},
      similar_case_summary_json: {},
      product_fit_flags_json: initialProductFit,
      traveler_intelligence_version: TRAVELER_INTELLIGENCE_VERSION,
      ops_copilot_version: OPS_COPILOT_VERSION,
      benchmark_engine_version: BENCHMARK_ENGINE_VERSION,
      intelligence_refreshed_at: new Date().toISOString(),
      intent_signals_json: intentSignals,
      intent_score: 0,
      conversion_probability_band: "low",
      decision_stage: "early_exploration",
      likely_customer_motive: "quote_validation",
      recommended_pitch_angle: "clarify_quote_and_close",
      intent_explanation: "Intent not computed yet.",
      intent_confidence: "low",
      multi_itinerary_type: multiItinerary.multi_itinerary_type,
      multi_itinerary_summary_json: multiItinerary,
      recommendation_engine_json: {},
      top_recommendations_json: [],
      suggested_alternative_destinations_json: [],
      recommended_products_json: [],
      suggested_pitch_sequence_json: [],
      benchmark_price_position: "unknown",
      source_likelihood_json: {
        status: "pending_async_enrichment",
        initial_estimate: initialSourceLikelihood,
      },
      source_profile_label: initialSourceLikelihood.likely_source_profile,
      source_profile_confidence: initialSourceLikelihood.confidence,
      latest_conversion_status: lead.outcome ?? lead.status ?? "pending",
      outcome_learning_summary_json: {},
      outcome_learning_version: OUTCOME_LEARNING_VERSION,
    };

    const { data: brain, error: brainError } = await supabaseAdmin
      .from("lead_trip_brains")
      .upsert(brainRecord, { onConflict: "lead_id" })
      .select()
      .single();
    if (brainError) throw brainError;

    const marketMemoryRecord = {
      unified_case_id: brain.id,
      lead_id: leadId,
      source_page: merged.source_page,
      audience_type: merged.audience_type,
      lead_classification: classification,
      contact_present: merged.contact_present,
      destination_city: merged.destination_city,
      destination_country: merged.destination_country,
      domestic_or_international: merged.domestic_or_international,
      duration_days: merged.duration_days,
      duration_nights: merged.duration_nights,
      travel_start_date: merged.travel_start_date,
      travel_end_date: merged.travel_end_date,
      traveller_count_total: merged.traveller_count_total,
      adults_count: merged.adults_count,
      children_count: merged.children_count,
      infants_count: merged.infants_count,
      hotel_names_json: merged.hotel_names_json,
      airline_names_json: merged.airline_names_json,
      sectors_json: merged.sectors_json,
      package_mode: intelligence.package_mode,
      itinerary_archetype: merged.itinerary_archetype,
      benchmark_key: merged.benchmark_key,
      total_price: merged.total_price,
      price_per_person: merged.price_per_person,
      currency: merged.currency,
      inclusions_tags_json: deriveTags(merged.inclusions_text, "inclusion"),
      exclusions_tags_json: deriveTags(merged.exclusions_text, "exclusion"),
      missing_fields_json: merged.missing_fields_json,
      parsing_confidence: merged.parsing_confidence,
      extracted_completeness_score: intelligence.extracted_completeness_score,
      product_fit_flags_json: initialProductFit,
      recommendation_summary: null,
      outcome: lead.outcome ?? "open",
      active_for_benchmark: classification !== "noise" && intelligence.extracted_completeness_score >= 20,
      benchmark_engine_version: BENCHMARK_ENGINE_VERSION,
      last_seen_at: new Date().toISOString(),
      learning_signal_class: "research_signal",
      learning_weight: 1,
      benchmark_signal_weight: 1,
      benchmark_price_position: "unknown",
      conversion_probability_band: "low",
      decision_stage: "early_exploration",
      likely_customer_motive: "quote_validation",
      recommended_pitch_angle: "clarify_quote_and_close",
      multi_itinerary_type: multiItinerary.multi_itinerary_type,
      recommendation_engine_json: {},
      source_likelihood_json: {
        status: "pending_async_enrichment",
        initial_estimate: initialSourceLikelihood,
      },
      source_profile_label: initialSourceLikelihood.likely_source_profile,
      source_profile_confidence: initialSourceLikelihood.confidence,
      latest_conversion_status: lead.outcome ?? lead.status ?? "pending",
      outcome_feedback_json: {},
      outcome_learning_version: OUTCOME_LEARNING_VERSION,
    };

    const { error: memoryError } = await supabaseAdmin
      .from("trip_market_memory")
      .upsert(marketMemoryRecord, { onConflict: "unified_case_id" });
    if (memoryError) throw memoryError;

    await rebuildRollups(supabaseAdmin);

    const { data: benchmarkRow } = await supabaseAdmin
      .from("trip_destination_benchmarks")
      .select("*")
      .eq("benchmark_key", merged.benchmark_key)
      .maybeSingle();

    const { data: alternativeBenchmarks } = await supabaseAdmin
      .from("trip_destination_benchmarks")
      .select("*")
      .eq("domestic_or_international", merged.domestic_or_international ?? "unknown")
      .eq("duration_bucket", merged.duration_days == null ? "unknown" : merged.duration_days <= 3 ? "short" : merged.duration_days <= 6 ? "medium" : merged.duration_days <= 10 ? "long" : "extended")
      .eq("traveler_bucket", merged.traveller_count_total == null ? "unknown" : merged.traveller_count_total === 1 ? "solo" : merged.traveller_count_total === 2 ? "pair" : merged.traveller_count_total <= 4 ? "small_group" : "group")
      .limit(20);

    const { data: similarRows } = await supabaseAdmin
      .from("trip_similar_cases")
      .select("*")
      .eq("unified_case_id", brain.id)
      .order("similarity_score", { ascending: false })
      .limit(5);

    const [
      { data: outcomeBenchmark },
      { data: pitchOutcomeRows },
      { data: productOutcomeRows },
      { data: intentSignalRow },
    ] = await Promise.all([
      supabaseAdmin
        .from("trip_destination_outcome_benchmarks")
        .select("*")
        .eq("benchmark_key", merged.benchmark_key)
        .maybeSingle(),
      supabaseAdmin
        .from("trip_pitch_outcome_memory")
        .select("*")
        .eq("domestic_or_international", merged.domestic_or_international ?? "unknown")
        .eq("multi_itinerary_type", multiItinerary.multi_itinerary_type)
        .limit(5),
      supabaseAdmin
        .from("trip_product_outcome_memory")
        .select("*")
        .eq("domestic_or_international", merged.domestic_or_international ?? "unknown")
        .eq("package_mode", intelligence.package_mode)
        .limit(6),
      supabaseAdmin
        .from("lead_trip_intent_signals")
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle(),
    ]);

    const similarIds = (similarRows ?? []).map((row: SimilarCaseRow) => row.similar_case_id);
    const { data: peers } = similarIds.length > 0
      ? await supabaseAdmin
          .from("trip_market_memory")
          .select("unified_case_id, destination_city, destination_country, total_price, package_mode, traveler_count_total, hotel_names_json, product_fit_flags_json")
          .in("unified_case_id", similarIds)
      : { data: [] };

    const benchmarkSummary = buildBenchmarkSummary(merged, (benchmarkRow ?? null) as BenchmarkRow | null);
    const similarSummary = buildSimilarSummary((similarRows ?? []) as SimilarCaseRow[], (peers ?? []) as MarketMemoryPeer[]);
    const sourceLikelihood = deriveSourceLikelihoodAssessment({
      lead: lead as LeadRecord,
      analyses: (analyses ?? []) as AnalysisRecord[],
      merged,
      similarSummary,
    });
    const intentAssessment = deriveIntentAssessment({
      lead: lead as LeadRecord,
      merged,
      intelligence,
      classification,
      signals: intentSignals,
      multi: multiItinerary,
      sourceLikelihood,
    });
    const finalProductFit = buildProductFitFlags(
      lead as LeadRecord,
      merged,
      intelligence,
      classification,
      benchmarkSummary,
    );
    const recommendationEngine = buildRecommendationEngine({
      merged,
      intelligence,
      benchmarkSummary,
      similarSummary,
      productFit: finalProductFit,
      intent: intentAssessment,
      multi: multiItinerary,
      alternativeBenchmarks: (alternativeBenchmarks ?? []) as BenchmarkRow[],
    });
    const learningSignals = buildLearningSignals({
      classification,
      lead: lead as LeadRecord,
      merged,
      intent: intentAssessment,
      sourceLikelihood,
    });
    const outcomeSnapshot = buildLeadOutcomeSnapshot({
      lead: lead as LeadRecord,
      brain: {
        ...brain,
        ...brainRecord,
        package_mode: intelligence.package_mode,
        benchmark_price_position: recommendationEngine.benchmark_price_position,
      },
      ops: {
        best_pitch_angle: intentAssessment.recommended_pitch_angle,
        recommended_pitch_angle: intentAssessment.recommended_pitch_angle,
        recommendation_summary: null,
        top_recommendations_json: recommendationEngine.top_recommendations,
        recommended_products_json: recommendationEngine.recommended_products,
        suggested_pitch_sequence_json: recommendationEngine.suggested_pitch_sequence,
      },
      intentSignals: {
        ...(intentSignalRow ?? intentSignals),
      } as LeadIntentSignalLike,
    });
    const outcomeLearningSummary = buildOutcomeLearningSummary({
      benchmark: (outcomeBenchmark ?? null) as OutcomeBenchmarkRow | null,
      pitchRows: ((pitchOutcomeRows ?? []) as PitchOutcomeMemoryLike[]).filter((row) => row.pitch_angle !== "unknown"),
      productRows: ((productOutcomeRows ?? []) as ProductOutcomeMemoryLike[]).filter((row) => row.product_code != null),
    });
    const opsCopilot = buildOpsCopilot(
      lead as LeadRecord,
      merged,
      intelligence,
      classification,
      benchmarkSummary,
      similarSummary,
      finalProductFit,
      intentAssessment,
      multiItinerary,
      recommendationEngine,
      { ...sourceLikelihood } as Record<string, unknown>,
      outcomeLearningSummary,
    );

    const { error: brainUpdateError } = await supabaseAdmin
      .from("lead_trip_brains")
      .update({
        benchmark_summary_json: benchmarkSummary,
        similar_case_summary_json: similarSummary,
        product_fit_flags_json: finalProductFit,
        intent_signals_json: intentSignals,
        intent_score: intentAssessment.intent_score,
        conversion_probability_band: intentAssessment.conversion_probability_band,
        decision_stage: intentAssessment.decision_stage,
        likely_customer_motive: intentAssessment.likely_customer_motive,
        recommended_pitch_angle: intentAssessment.recommended_pitch_angle,
        intent_explanation: intentAssessment.intent_explanation,
        intent_confidence: intentAssessment.intent_confidence,
        multi_itinerary_type: multiItinerary.multi_itinerary_type,
        multi_itinerary_summary_json: multiItinerary,
        recommendation_engine_json: recommendationEngine,
        top_recommendations_json: recommendationEngine.top_recommendations,
        suggested_alternative_destinations_json: recommendationEngine.suggested_alternative_destinations,
        recommended_products_json: recommendationEngine.recommended_products,
        suggested_pitch_sequence_json: recommendationEngine.suggested_pitch_sequence,
        benchmark_price_position: recommendationEngine.benchmark_price_position,
        source_likelihood_json: sourceLikelihood,
        source_profile_label: sourceLikelihood.likely_source_profile,
        source_profile_confidence: sourceLikelihood.confidence,
        latest_conversion_status: outcomeSnapshot.conversion_status,
        outcome_learning_summary_json: outcomeLearningSummary,
        outcome_learning_version: OUTCOME_LEARNING_VERSION,
        intelligence_refreshed_at: new Date().toISOString(),
      })
      .eq("id", brain.id);
    if (brainUpdateError) throw brainUpdateError;

    const { error: memoryUpdateError } = await supabaseAdmin
      .from("trip_market_memory")
      .update({
        product_fit_flags_json: finalProductFit,
        recommendation_summary: opsCopilot.recommendation_summary,
        learning_signal_class: learningSignals.learning_signal_class,
        learning_weight: learningSignals.learning_weight,
        benchmark_signal_weight: learningSignals.benchmark_signal_weight,
        benchmark_price_position: recommendationEngine.benchmark_price_position,
        conversion_probability_band: intentAssessment.conversion_probability_band,
        decision_stage: intentAssessment.decision_stage,
        likely_customer_motive: intentAssessment.likely_customer_motive,
        recommended_pitch_angle: intentAssessment.recommended_pitch_angle,
        multi_itinerary_type: multiItinerary.multi_itinerary_type,
        recommendation_engine_json: recommendationEngine,
        source_likelihood_json: sourceLikelihood,
        source_profile_label: sourceLikelihood.likely_source_profile,
        source_profile_confidence: sourceLikelihood.confidence,
        latest_conversion_status: outcomeSnapshot.conversion_status,
        outcome_feedback_json: outcomeLearningSummary,
        outcome_learning_version: OUTCOME_LEARNING_VERSION,
        last_seen_at: new Date().toISOString(),
      })
      .eq("unified_case_id", brain.id);
    if (memoryUpdateError) throw memoryUpdateError;

    const { error: copilotError } = await supabaseAdmin
      .from("lead_ops_copilot")
      .upsert({
        lead_id: leadId,
        unified_case_id: brain.id,
        lead_classification: classification,
        recommendation_summary: opsCopilot.recommendation_summary,
        ops_summary: opsCopilot.ops_summary,
        what_looks_wrong_json: opsCopilot.what_looks_wrong_json,
        sankash_opportunity_json: opsCopilot.sankash_opportunity_json,
        call_talking_points_json: opsCopilot.call_talking_points_json,
        pitch_sequence_json: opsCopilot.pitch_sequence_json,
        whatsapp_follow_up: opsCopilot.whatsapp_follow_up,
        benchmark_summary_json: opsCopilot.benchmark_summary_json,
        similar_trip_summary_json: opsCopilot.similar_trip_summary_json,
        product_fit_flags_json: opsCopilot.product_fit_flags_json,
        next_best_action_json: opsCopilot.next_best_action_json,
        intent_summary_json: opsCopilot.intent_summary_json,
        multi_itinerary_read_json: opsCopilot.multi_itinerary_read_json,
        top_recommendations_json: opsCopilot.top_recommendations_json,
        suggested_alternative_destinations_json: opsCopilot.suggested_alternative_destinations_json,
        recommended_products_json: opsCopilot.recommended_products_json,
        suggested_pitch_sequence_json: opsCopilot.suggested_pitch_sequence_json,
        benchmark_price_position: opsCopilot.benchmark_price_position,
        conversion_probability_band: opsCopilot.conversion_probability_band,
        decision_stage: opsCopilot.decision_stage,
        likely_customer_motive: opsCopilot.likely_customer_motive,
        recommended_pitch_angle: opsCopilot.recommended_pitch_angle,
        intent_explanation: opsCopilot.intent_explanation,
        intent_confidence: opsCopilot.intent_confidence,
        source_likelihood_json: opsCopilot.source_likelihood_json,
        outcome_learning_summary_json: opsCopilot.outcome_learning_summary_json,
        best_pitch_angle: opsCopilot.best_pitch_angle,
        urgency_score: opsCopilot.urgency_score,
        intent_score: opsCopilot.intent_score,
        lead_quality_score: opsCopilot.lead_quality_score,
        traveler_trust_score: opsCopilot.traveler_trust_score,
        ops_copilot_version: OPS_COPILOT_VERSION,
        outcome_learning_version: OUTCOME_LEARNING_VERSION,
        refreshed_at: new Date().toISOString(),
      }, { onConflict: "lead_id" });
    if (copilotError) throw copilotError;

    await supabaseAdmin
      .from("lead_trip_intent_signals")
      .upsert({
        lead_id: leadId,
        unified_case_id: brain.id,
        source_page: merged.source_page,
        audience_type: merged.audience_type,
        contact_present: merged.contact_present,
        first_upload_at: intentSignals.first_upload_at,
        latest_upload_at: intentSignals.latest_upload_at,
        contact_captured_at: intentSignals.contact_captured_at,
        session_count: intentSignals.session_count,
        return_visit_count: intentSignals.return_visit_count,
        total_public_page_views: intentSignals.pages_visited_before_upload.length,
        pages_visited_json: intentSignals.pages_visited_before_upload,
        page_types_json: intentSignals.page_types_before_upload,
        time_spent_before_upload_seconds: intentSignals.time_spent_before_upload_seconds,
        viewed_traveler_page: intentSignals.viewed_traveler_page,
        viewed_emi_page: intentSignals.viewed_emi_page,
        viewed_emi_section: intentSignals.viewed_emi_section,
        referrer: intentSignals.referrer,
        utm_source: intentSignals.utm_source,
        utm_medium: intentSignals.utm_medium,
        utm_campaign: intentSignals.utm_campaign,
        device_type: intentSignals.device_type,
        os_name: intentSignals.os_name,
        browser_name: intentSignals.browser_name,
        uploaded_multiple_itineraries: intentSignals.uploaded_multiple_itineraries,
        distinct_destination_count: intentSignals.distinct_destination_count,
        same_destination_repeat: intentSignals.same_destination_repeat,
        days_to_trip_start: intentSignals.days_to_trip_start,
        quote_size_band: intentSignals.quote_size_band,
        trip_size_band: intentSignals.trip_size_band,
        raw_signal_snapshot_json: intentSignals.raw_signal_snapshot_json,
        intent_score: intentAssessment.intent_score,
        conversion_probability_band: intentAssessment.conversion_probability_band,
        decision_stage: intentAssessment.decision_stage,
        likely_customer_motive: intentAssessment.likely_customer_motive,
        recommended_pitch_angle: intentAssessment.recommended_pitch_angle,
        intent_explanation: intentAssessment.intent_explanation,
        intent_confidence: intentAssessment.intent_confidence,
        refreshed_at: new Date().toISOString(),
      }, { onConflict: "lead_id" })
      .catch(() => {});

    await supabaseAdmin
      .from("trip_post_analysis_enrichment_queue")
      .upsert({
        lead_id: leadId,
        unified_case_id: brain.id,
        enrichment_type: "source_likelihood",
        reason,
        status: "pending",
        requested_at: new Date().toISOString(),
        due_at: new Date().toISOString(),
        payload_json: {
          source_enrichment_version: SOURCE_ENRICHMENT_VERSION,
        },
      }, { onConflict: "lead_id" })
      .catch(() => {});

    await supabaseAdmin
      .from("trip_outcome_learning_queue")
      .upsert({
        lead_id: leadId,
        unified_case_id: brain.id,
        reason,
        status: "pending",
        requested_at: new Date().toISOString(),
        due_at: new Date().toISOString(),
        payload_json: {
          outcome_learning_version: OUTCOME_LEARNING_VERSION,
          latest_conversion_status: outcomeSnapshot.conversion_status,
        },
      }, { onConflict: "lead_id" })
      .catch(() => {});

    await supabaseAdmin.from("lead_activity").insert({
      lead_id: leadId,
      activity_type: "trip_brain_refreshed",
      description: `Unified trip intelligence refreshed (${reason})`,
    }).catch(() => {});

    await markQueue(supabaseAdmin, leadId, "done").catch(() => {});

    return {
      success: true,
      brain_id: brain.id,
      lead_classification: classification,
      benchmark_key: merged.benchmark_key,
      product_fit_flags: finalProductFit,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await markQueue(supabaseAdmin, leadId, "error", message).catch(() => {});
    throw error;
  }
}
