import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// ── Types ────────────────────────────────────────────────────────

interface FileInput {
  file_url: string;
  file_name: string;
}

interface AnalysisRequest {
  lead_id: string;
  attachment_id?: string;
  file_url?: string;
  file_name?: string;
  files?: FileInput[];
  audience_type?: string;
}

// ── Inlined: itinerary-postprocess ──────────────────────────────

interface ParsedItineraryExtraction {
  [key: string]: unknown;
  domestic_or_international?: string | null;
  destination_country?: string | null;
  destination_city?: string | null;
  additional_destinations?: string[] | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  duration_nights?: number | null;
  duration_days?: number | null;
  total_price?: number | null;
  price_per_person?: number | null;
  alternate_prices?: number[] | null;
  price_notes?: string | null;
  currency?: string | null;
  traveller_count_total?: number | null;
  adults_count?: number | null;
  children_count?: number | null;
  infants_count?: number | null;
  travel_agent_name?: string | null;
  customer_name?: string | null;
  hotel_names?: string[] | null;
  airline_names?: string[] | null;
  sectors?: string[] | null;
  flight_departure_time?: string | null;
  flight_arrival_time?: string | null;
  hotel_check_in?: string | null;
  hotel_check_out?: string | null;
  inclusions_text?: string | null;
  exclusions_text?: string | null;
  visa_mentioned?: boolean | null;
  insurance_mentioned?: boolean | null;
  parsing_confidence?: string | null;
  missing_fields?: string[] | null;
  extracted_snippets?: string[] | null;
  confidence_notes?: string | null;
  extraction_warnings?: string[] | null;
}

const HOTEL_BRAND_PREFIXES = [
  "ac hotel","adler","baywatch","carlton","citymax","courtyard","holiday inn","hotel",
  "ibis","lake palace","mercure","novotel","opera","park","radisson","roma","sun park",
  "taj","the park","village hotel",
];
const HOTEL_SUFFIX_PATTERN = /\b(hotel|resort|residency|inn|suite|suites|houseboat|palace|spa|villa|villas|lodge|camp|cruise)\b/i;
const GENERIC_HOTEL_PHRASES = /\b(mentioned hotels|similar hotels|hotel stay|hotel check-?in|hotel check-?out|hotel details|overnight stay|overnight in|star hotel|hotels? included)\b/i;

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = (value ?? "").trim().replace(/\s+/g, " ");
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

function appendWarning(parsed: ParsedItineraryExtraction, warning: string) {
  parsed.extraction_warnings = uniqueStrings([...(parsed.extraction_warnings ?? []), warning]);
}

function markMissing(parsed: ParsedItineraryExtraction, field: string) {
  parsed.missing_fields = uniqueStrings([...(parsed.missing_fields ?? []), field]);
}

function clearMissing(parsed: ParsedItineraryExtraction, field: string) {
  parsed.missing_fields = (parsed.missing_fields ?? []).filter((item) => item !== field);
}

function parseIsoDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffDays(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function sanitizeHotelCandidate(candidate: string) {
  const cleaned = candidate
    .replace(/^[\s\-–—:*•\d.]+/, "")
    .replace(/^(?:day\s*\d+|night\s*\d+|city|stay at|accommodation)\s*[:\-]\s*/i, "")
    .replace(/^[A-Za-z\s]+(?:-\s+|:\s+)(?=(?:the\s+)?[A-Z])/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\b(Breakfast|Lunch|Dinner|Meal Plan|Twin Share|Per Person)\b.*$/i, "")
    .replace(/\b(or similar)\b/i, "or similar")
    .replace(/[|•]+/g, " ")
    .trim();
  if (!cleaned) return null;
  if (cleaned.length < 4 || cleaned.length > 90) return null;
  if (GENERIC_HOTEL_PHRASES.test(cleaned)) return null;
  return cleaned;
}

function extractHotelNamesFromText(rawText: string) {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const candidates: string[] = [];
  for (const line of lines) {
    let candidate: string | null = null;
    const labeledMatch = line.match(/^(?:hotel(?: name)?|accommodation(?: details)?)\s*[:\-]\s*(.+)$/i);
    if (labeledMatch) { candidate = labeledMatch[1]; }
    else {
      const stayMatch = line.match(/\b(?:stay at|accommodation at|hotel)\s*[:\-]?\s*(.+)$/i);
      if (stayMatch) { candidate = stayMatch[1]; }
    }
    const candidatePool = candidate ? [candidate] : [];
    if (!candidate && (HOTEL_SUFFIX_PATTERN.test(line) || HOTEL_BRAND_PREFIXES.some((prefix) => line.toLowerCase().includes(prefix)))) {
      candidatePool.push(line);
    }
    for (const entry of candidatePool) {
      const splitCandidates = entry.split(/\s+\|\s+|\s+\/\s+|;\s*|,(?=\s*[A-Z])/).map((part) => part.trim()).filter(Boolean);
      for (const part of splitCandidates) {
        if (!HOTEL_SUFFIX_PATTERN.test(part) && !HOTEL_BRAND_PREFIXES.some((prefix) => part.toLowerCase().includes(prefix))) continue;
        const sanitized = sanitizeHotelCandidate(part);
        if (sanitized) candidates.push(sanitized);
      }
    }
  }
  return uniqueStrings(candidates);
}

interface TravelerBreakdown { total: number | null; adults: number | null; children: number | null; infants: number | null; conflict: boolean; }

function extractTravelerBreakdown(rawText: string): TravelerBreakdown {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const candidates: TravelerBreakdown[] = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!/(travellers?|travelers?|guests?|adults?|children?|child|infants?)/.test(lower)) continue;
    if (/child with bed|child without bed|single occupancy|infant \(below/i.test(lower)) continue;
    const totalMatch = line.match(/(\d+)\s*(?:travellers?|travelers?|guests?)/i);
    const adultsMatch = line.match(/(\d+)\s*adults?/i);
    const childrenMatch = line.match(/(\d+)\s*(?:children?|child)\b/i);
    const infantsMatch = line.match(/(\d+)\s*infants?/i);
    const adults = adultsMatch ? Number(adultsMatch[1]) : null;
    const children = childrenMatch ? Number(childrenMatch[1]) : null;
    const infants = infantsMatch ? Number(infantsMatch[1]) : null;
    const total = totalMatch ? Number(totalMatch[1]) :
      adults != null || children != null || infants != null
        ? [adults, children, infants].reduce((s: number, value) => s + (value ?? 0), 0)
        : null;
    if (total == null) continue;
    candidates.push({ total, adults, children, infants, conflict: false });
  }
  if (candidates.length === 0) return { total: null, adults: null, children: null, infants: null, conflict: false };
  const last = candidates[candidates.length - 1];
  const distinctTotals = new Set(candidates.map((c) => JSON.stringify(c)));
  return { ...last, conflict: distinctTotals.size > 1 };
}

function normalizeTravelDates(parsed: ParsedItineraryExtraction, rawText: string, now: Date) {
  const start = parseIsoDate(parsed.travel_start_date);
  const end = parseIsoDate(parsed.travel_end_date);
  const expectedTripSpan = parsed.duration_days != null ? Math.max(0, parsed.duration_days - 1) : parsed.duration_nights != null ? Math.max(0, parsed.duration_nights) : null;
  const lowerRawText = rawText.toLowerCase();
  const hasAvailabilityWindowHints = /\btravel periods?\b|\btravel window\b|\bvalid(?:ity| till)\b|\boffer valid\b|\bavailable from\b/.test(lowerRawText);
  if (start && end) {
    const actualSpan = diffDays(start, end);
    const obviouslyWindowBased = actualSpan > 21 && (hasAvailabilityWindowHints || (expectedTripSpan != null && actualSpan > expectedTripSpan + 5));
    if (obviouslyWindowBased) {
      parsed.travel_start_date = null; parsed.travel_end_date = null;
      markMissing(parsed, "travel_start_date"); markMissing(parsed, "travel_end_date");
      appendWarning(parsed, "Detected an availability window instead of exact trip dates. Exact travel dates are still missing.");
      return;
    }
  }
  if ((start || end) && hasAvailabilityWindowHints && expectedTripSpan == null) {
    parsed.travel_start_date = null; parsed.travel_end_date = null;
    markMissing(parsed, "travel_start_date"); markMissing(parsed, "travel_end_date");
    appendWarning(parsed, "Date text looks like an offer or availability window, not a confirmed trip date.");
    return;
  }
  if (start && start < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))) {
    appendWarning(parsed, "Visible departure date is already in the past. Please confirm whether this is an old quote or archived departure.");
  }
}

function normalizeItineraryExtraction(parsedInput: Record<string, unknown>, rawText: string, now: Date = new Date()): ParsedItineraryExtraction {
  const parsed = structuredClone(parsedInput) as ParsedItineraryExtraction;
  parsed.hotel_names = uniqueStrings(parsed.hotel_names ?? []);
  parsed.airline_names = uniqueStrings(parsed.airline_names ?? []);
  parsed.sectors = uniqueStrings(parsed.sectors ?? []);
  parsed.additional_destinations = uniqueStrings(parsed.additional_destinations ?? []);
  parsed.missing_fields = uniqueStrings(parsed.missing_fields ?? []);
  parsed.extraction_warnings = uniqueStrings(parsed.extraction_warnings ?? []);
  if ((parsed.hotel_names ?? []).length === 0) {
    const fallbackHotels = extractHotelNamesFromText(rawText);
    if (fallbackHotels.length > 0) { parsed.hotel_names = fallbackHotels; clearMissing(parsed, "hotel_names"); }
  }
  if (parsed.traveller_count_total == null) {
    const fb = extractTravelerBreakdown(rawText);
    if (fb.total != null) {
      parsed.traveller_count_total = fb.total;
      parsed.adults_count = parsed.adults_count ?? fb.adults;
      parsed.children_count = parsed.children_count ?? fb.children;
      parsed.infants_count = parsed.infants_count ?? fb.infants;
      clearMissing(parsed, "traveller_count_total"); clearMissing(parsed, "adults_count");
      if (parsed.children_count != null) clearMissing(parsed, "children_count");
      if (parsed.infants_count != null) clearMissing(parsed, "infants_count");
      if (fb.conflict) appendWarning(parsed, "Multiple traveler-count values were found. The latest explicit count was used.");
    }
  }
  normalizeTravelDates(parsed, rawText, now);
  return parsed;
}

// ── Inlined: itinerary-intelligence ─────────────────────────────

const ITINERARY_INTELLIGENCE_VERSION = "2026-04-09-v2";

type PackageMode = "land_only" | "flights_and_hotels" | "hotels_only" | "custom" | "unknown";
type AdvisorySeverity = "high" | "medium" | "low";
type AdvisoryPriority = "high" | "medium" | "low";
type UnlockableModuleStatus = "ready" | "needs_more_input" | "planned";

interface ItineraryDecisionFlag { code: string; title: string; detail: string; severity: AdvisorySeverity; active: boolean; }
interface ItineraryAdvisoryInsight { code: string; title: string; detail: string; severity: AdvisorySeverity; category: string; evidence?: string[]; }
interface ItineraryQuestion { code: string; question: string; why: string; priority: AdvisoryPriority; }
interface NextInputNeeded { code: string; label: string; reason: string; priority: AdvisoryPriority; suggested_upload?: string; }
interface UnlockableModule { code: string; label: string; status: UnlockableModuleStatus; reason: string; provider_hint?: string; }

interface EnrichmentStatus {
  advisory_version: string; has_price: boolean; has_traveler_count: boolean; has_flights: boolean; has_hotels: boolean;
  timing_ready: boolean; budgeting_ready: boolean; package_mode: PackageMode; completeness_band: string;
  next_best_action: { code: string; label: string; detail: string; };
  tbo_hooks: { comparable_hotels: boolean; component_compare: boolean; smarter_rebuild: boolean; };
}

interface DerivedItineraryIntelligence {
  package_mode: PackageMode; extracted_completeness_score: number;
  traveler_questions_json: ItineraryQuestion[]; seller_questions_json: ItineraryQuestion[];
  advisory_insights_json: ItineraryAdvisoryInsight[]; next_inputs_needed_json: NextInputNeeded[];
  unlockable_modules_json: UnlockableModule[]; enrichment_status_json: EnrichmentStatus;
  decision_flags_json: ItineraryDecisionFlag[];
}

interface ItineraryIntelligenceInput {
  domestic_or_international?: string | null; destination_country?: string | null; destination_city?: string | null;
  additional_destinations_json?: string[] | null; travel_start_date?: string | null; travel_end_date?: string | null;
  duration_nights?: number | null; duration_days?: number | null; total_price?: number | null; price_per_person?: number | null;
  currency?: string | null; traveller_count_total?: number | null; adults_count?: number | null; children_count?: number | null; infants_count?: number | null;
  hotel_names_json?: string[] | null; airline_names_json?: string[] | null; sectors_json?: string[] | null;
  inclusions_text?: string | null; exclusions_text?: string | null; visa_mentioned?: boolean | null; insurance_mentioned?: boolean | null;
  flight_departure_time?: string | null; flight_arrival_time?: string | null; hotel_check_in?: string | null; hotel_check_out?: string | null;
  parsing_confidence?: string | null; missing_fields_json?: string[] | null; extraction_warnings_json?: string[] | null;
}

const GROUND_DESTINATION_HINTS = new Set(["auli","dalhousie","dharamshala","kasol","kasauli","kullu","manali","mcleodganj","mussoorie","nainital","shimla","spiti","tirthan"]);

function _normalizeText(value: string | null | undefined): string { return (value ?? "").trim().toLowerCase(); }
function _hasText(value: string | null | undefined): boolean { return Boolean(value && value.trim()); }
function _firstNonEmpty(values: Array<string | null | undefined>): string | null { for (const v of values) { if (_hasText(v)) return v!.trim(); } return null; }
function _uniquePush<T extends { code: string }>(list: T[], item: T) { if (!list.some((e) => e.code === item.code)) list.push(item); }
function _priorityRank(p: AdvisoryPriority) { return p === "high" ? 0 : p === "medium" ? 1 : 2; }
function _nextInputRank(code: string) {
  const r = ["traveler_count","travel_dates","hotel_details","origin_transport_plan","flight_details","price_breakup","price_basis","timing_details","meal_plan_detail","full_quote_context"];
  const i = r.indexOf(code); return i === -1 ? r.length : i;
}

function _addMissingFieldDrivenNextInputs(nextInputsNeeded: NextInputNeeded[], missingFields: Set<string>, context: { likelyStayCase: boolean; hasFlights: boolean; timingRelevant: boolean; }) {
  const fieldGroups: Array<{ fields: string[]; input: NextInputNeeded; enabled?: boolean; }> = [
    { fields: ["traveller_count_total","adults_count","children_count","infants_count"], input: { code: "traveler_count", label: "Add traveler count", reason: "We still need the adult and child count to judge affordability properly.", priority: "high", suggested_upload: "Seller quote page or message that shows adult and child count" } },
    { fields: ["travel_start_date","travel_end_date"], input: { code: "travel_dates", label: "Add the page with exact travel dates", reason: "Actual travel dates are still missing or unclear.", priority: "high", suggested_upload: "Departure page, booking confirmation, or itinerary page that shows exact dates" } },
    { fields: ["hotel_names","hotel_check_in","hotel_check_out"], input: { code: "hotel_details", label: "Upload the hotel page or full package PDF", reason: "The hotel names or stay details are still incomplete.", priority: "high", suggested_upload: "Accommodation table, hotel confirmation page, or full quote PDF" }, enabled: context.likelyStayCase },
    { fields: ["total_price","price_per_person"], input: { code: "price_breakup", label: "Upload the final quote page or price breakup", reason: "The current material does not yet show a reliable final price.", priority: "high", suggested_upload: "Final quote PDF, pricing summary, or breakup screenshot" } },
    { fields: ["airline_names","sectors","flight_departure_time","flight_arrival_time"], input: { code: "flight_details", label: "Upload your flight or train details", reason: "Transport details are still missing from this case.", priority: "high", suggested_upload: "Airline itinerary, train booking, or seller message with transport plan" }, enabled: context.likelyStayCase || context.hasFlights },
    { fields: ["flight_arrival_time","hotel_check_in"], input: { code: "timing_details", label: "Upload arrival time and hotel check-in details", reason: "Trip timing checks need both arrival timing and hotel timing.", priority: "medium", suggested_upload: "Flight itinerary screenshot and hotel confirmation page" }, enabled: context.timingRelevant },
  ];
  for (const group of fieldGroups) {
    if (group.enabled === false) continue;
    if (!group.fields.some((f) => missingFields.has(f))) continue;
    _uniquePush(nextInputsNeeded, group.input);
  }
}

function _getMealPlan(inclusionsText: string | null | undefined) {
  const text = _normalizeText(inclusionsText);
  const breakfast = /\bbreakfast\b/.test(text); const lunch = /\blunch\b/.test(text); const dinner = /\bdinner\b/.test(text);
  const allMeals = /\ball meals\b|\bfull board\b|\ball inclusive\b/.test(text);
  if (!text) return "unknown"; if (allMeals) return "full_board"; if (breakfast && lunch && dinner) return "full_board";
  if (breakfast && dinner) return "half_board"; if (breakfast && !lunch && !dinner) return "breakfast_only"; if (lunch || dinner) return "partial"; return "unknown";
}

function _hasFlightSignals(input: ItineraryIntelligenceInput) { return Boolean((input.airline_names_json ?? []).length || (input.sectors_json ?? []).length || _hasText(input.flight_departure_time) || _hasText(input.flight_arrival_time)); }
function _hasHotelSignals(input: ItineraryIntelligenceInput) { return Boolean((input.hotel_names_json ?? []).length || _hasText(input.hotel_check_in) || _hasText(input.hotel_check_out)); }
function _buildContextText(input: ItineraryIntelligenceInput) { return _normalizeText([input.inclusions_text, input.exclusions_text, input.destination_city, input.destination_country, ...(input.additional_destinations_json ?? [])].filter(Boolean).join(" ")); }
function _hasStayLanguage(input: ItineraryIntelligenceInput) { return /\bhotel\b|\baccommodation\b|\bstay\b|\broom\b|\bnight stay\b|\bovernight\b/.test(_buildContextText(input)); }
function _hasCoreGroundSignals(input: ItineraryIntelligenceInput) { return /\bairport transfer\b|\btransfer\b|\bpickup\b|\bdrop\b|\bsightseeing\b|\bexcursion\b|\bactivity\b|\bferry\b|\bcruise\b|\bprivate vehicle\b|\bcoach\b|\bguide(?:d)?\b|\bpermits?\b|\bentry tickets?\b/.test(_buildContextText(input)) || Boolean((input.additional_destinations_json ?? []).length); }
function _hasIndependentStaySignals(input: ItineraryIntelligenceInput) { return /\bindependent\b|\barrive independently\b|\bcity stay\b|\bhotel booking\b|\bstarts and ends in\b/.test(_buildContextText(input)); }
function _isLikelyStayCase(input: ItineraryIntelligenceInput, packageMode: PackageMode) { return _hasHotelSignals(input) || _hasStayLanguage(input) || packageMode === "land_only" || packageMode === "hotels_only"; }
function _hasExplicitInsuranceExclusion(input: ItineraryIntelligenceInput) { return /\btravel insurance\b|\binsurance\b/.test(_normalizeText(input.exclusions_text)); }

function _shouldFlagInsuranceGap(input: ItineraryIntelligenceInput, packageMode: PackageMode, completenessBand: string) {
  if (input.insurance_mentioned === true) return false;
  const explicit = _hasExplicitInsuranceExclusion(input);
  const isInt = input.domestic_or_international === "international";
  const vp = input.total_price ?? input.price_per_person ?? null;
  const hasPrice = vp != null;
  const ptb = (vp ?? 0) >= (isInt ? 50000 : 100000);
  const exHeavy = (input.exclusions_text ?? "").split(",").filter((i) => i.trim()).length >= 3;
  if (explicit) return true; if (isInt) return completenessBand !== "thin" || hasPrice;
  if (input.visa_mentioned === true) return true; if (ptb && exHeavy) return true;
  if (packageMode === "flights_and_hotels" && hasPrice && exHeavy) return true; return false;
}

function _inferPackageMode(input: ItineraryIntelligenceInput): PackageMode {
  const hf = _hasFlightSignals(input); const hh = _hasHotelSignals(input) || _hasStayLanguage(input);
  const hg = _hasCoreGroundSignals(input); const hi = _hasIndependentStaySignals(input);
  if (hf && hh) return "flights_and_hotels"; if (hf && !hh) return hg ? "custom" : "unknown";
  if (hh && hg) return "land_only"; if (hh && hi) return "hotels_only"; if (hh) return "hotels_only"; if (hg) return "land_only"; return "unknown";
}

function _computeCompletenessScore(input: ItineraryIntelligenceInput) {
  let score = 0;
  if (_hasText(input.destination_city) || _hasText(input.destination_country)) score += 12;
  if (_hasText(input.travel_start_date)) score += 8; if (_hasText(input.travel_end_date)) score += 5;
  if (input.duration_nights != null || input.duration_days != null) score += 5;
  if (input.total_price != null) score += 18; if (input.price_per_person != null) score += 6;
  if (input.traveller_count_total != null) score += 15;
  if ((input.hotel_names_json ?? []).length > 0) score += 8;
  if ((input.airline_names_json ?? []).length > 0 || (input.sectors_json ?? []).length > 0) score += 8;
  if (_hasText(input.flight_departure_time) || _hasText(input.flight_arrival_time)) score += 5;
  if (_hasText(input.hotel_check_in) || _hasText(input.hotel_check_out)) score += 4;
  if (_hasText(input.inclusions_text)) score += 4;
  if (input.insurance_mentioned === true) score += 2; if (input.visa_mentioned === true) score += 2;
  if ((input.extraction_warnings_json ?? []).length > 0) score -= Math.min(8, (input.extraction_warnings_json ?? []).length * 2);
  if ((input.parsing_confidence ?? "low") === "low") score -= 10;
  if ((input.parsing_confidence ?? "low") === "medium") score -= 4;
  return Math.max(0, Math.min(100, score));
}

function deriveItineraryIntelligence(input: ItineraryIntelligenceInput): DerivedItineraryIntelligence {
  const travelerQuestions: ItineraryQuestion[] = [];
  const sellerQuestions: ItineraryQuestion[] = [];
  const advisoryInsights: ItineraryAdvisoryInsight[] = [];
  const nextInputsNeeded: NextInputNeeded[] = [];
  const unlockableModules: UnlockableModule[] = [];
  const decisionFlags: ItineraryDecisionFlag[] = [];

  const packageMode = _inferPackageMode(input);
  const completenessScore = _computeCompletenessScore(input);
  const completenessBand = completenessScore >= 70 ? "strong" : completenessScore >= 40 ? "partial" : "thin";
  const missingFields = new Set((input.missing_fields_json ?? []).filter(Boolean));

  const destination = _firstNonEmpty([input.destination_city, input.destination_country]) ?? "this trip";
  const destinationKey = _normalizeText(input.destination_city);
  const hasFlights = _hasFlightSignals(input);
  const hasHotels = _hasHotelSignals(input);
  const likelyStayCase = _isLikelyStayCase(input, packageMode);
  const hasVisiblePrice = input.total_price != null || input.price_per_person != null;
  const hasPrice = input.total_price != null;
  const hasTravelerCount = input.traveller_count_total != null;
  const hasFlightTiming = _hasText(input.flight_arrival_time);
  const hasHotelTiming = _hasText(input.hotel_check_in);
  const timingRelevant = hasFlights && likelyStayCase;
  const timingReady = hasFlights && hasHotels && hasFlightTiming && hasHotelTiming;
  const mealPlan = _getMealPlan(input.inclusions_text);
  const isInternational = input.domestic_or_international === "international";
  const priceLabel = input.total_price != null
    ? `${(input.currency ?? "INR").toUpperCase()} ${Number(input.total_price).toLocaleString("en-IN")}`
    : input.price_per_person != null
      ? `${(input.currency ?? "INR").toUpperCase()} ${Number(input.price_per_person).toLocaleString("en-IN")} per traveler`
      : null;
  const hotelNames = (input.hotel_names_json ?? []).filter(Boolean);
  const localTransferOnly = /\btransfer\b|\bpickup\b|\bdrop\b/.test(_normalizeText(input.inclusions_text));
  const explicitInsuranceExclusion = _hasExplicitInsuranceExclusion(input);
  const transportMissing = packageMode === "land_only" || packageMode === "hotels_only" || (hasHotels && !hasFlights && localTransferOnly);
  const priceBasisUnclear = hasVisiblePrice && (input.price_per_person == null || input.traveller_count_total == null);
  const shouldFlagInsurance = _shouldFlagInsuranceGap(input, packageMode, completenessBand);
  const budgetingGaps: string[] = [];

  // --- Decision flags and advisory insights (same logic as itinerary-intelligence.ts) ---

  if (packageMode === "land_only") {
    _uniquePush(decisionFlags, { code: "land_only_likely", title: "Land-only package likely", detail: `This looks like a stay-and-local-services package for ${destination}, not a full door-to-door trip.`, severity: "high", active: true });
    _uniquePush(advisoryInsights, { code: "land_only_likely", title: "This looks like a land-only package", detail: `The visible package appears to cover the destination stay and local components, but not the full journey from your starting city.`, severity: "high", category: "transport", evidence: [_firstNonEmpty([input.inclusions_text, input.destination_city]) ?? destination] });
    _uniquePush(travelerQuestions, { code: "origin_city_and_mode", question: `Which city are you starting from for ${destination}?`, why: "We need the first leg to estimate your real total trip cost.", priority: "high" });
    _uniquePush(sellerQuestions, { code: "seller_transport_scope", question: "Does this price include travel to the trip start point, or only the land package after arrival?", why: "This clarifies whether the visible quote is full-trip or only destination services.", priority: "high" });
    _uniquePush(nextInputsNeeded, { code: "origin_transport_plan", label: "Upload your train, flight, or road booking plan", reason: "The current package may not include the first leg of your journey.", priority: "high", suggested_upload: "Flight screenshot, train booking, or seller message about pickup/start city" });
    budgetingGaps.push("transport to the trip start point");
  }

  if (packageMode === "hotels_only") {
    _uniquePush(decisionFlags, { code: "hotels_only_likely", title: "This looks closer to a hotel booking", detail: `The visible quote looks like a stay in ${destination}, not a full holiday package with transport and day-wise travel components.`, severity: "medium", active: true });
    _uniquePush(advisoryInsights, { code: "hotels_only_likely", title: "This looks closer to a hotel-only booking", detail: "The visible details focus on the stay itself, so transport, sightseeing, and the rest of the holiday budget may still sit outside this booking.", severity: "medium", category: "transport", evidence: hotelNames.length > 0 ? hotelNames.slice(0, 1) : undefined });
    budgetingGaps.push("travel to and from the hotel");
  }

  if (transportMissing) {
    _uniquePush(decisionFlags, { code: "transport_missing_from_total", title: "Transport may be missing from total trip cost", detail: "The quote does not clearly show how you reach the start point of the trip.", severity: "high", active: true });
    _uniquePush(advisoryInsights, { code: "transport_missing_from_total", title: "Your visible price may not be the full trip price", detail: "Travel to the trip start point may still sit outside this quote, so the final budget could be higher than the shown package value.", severity: "high", category: "budget", evidence: priceLabel ? [priceLabel] : undefined });
  }

  if (!_hasText(input.travel_start_date) || !_hasText(input.travel_end_date)) {
    _uniquePush(decisionFlags, { code: "travel_dates_missing", title: "Exact trip dates are missing", detail: "The current quote does not clearly confirm the actual start and end dates of travel.", severity: "high", active: true });
    _uniquePush(nextInputsNeeded, { code: "travel_dates", label: "Add the page with exact travel dates", reason: "Actual travel dates are still missing or incomplete.", priority: "high", suggested_upload: "Departure page, booking confirmation, or itinerary page that shows exact dates" });
  }

  if (!hasTravelerCount) {
    _uniquePush(decisionFlags, { code: "traveler_count_missing", title: "Traveler count missing", detail: "The quote does not confirm how many adults, children, or infants this price covers.", severity: "high", active: true });
    _uniquePush(advisoryInsights, { code: "traveler_count_missing", title: "Traveler count is missing", detail: "We should confirm the number of travelers before treating this as a strong affordability signal.", severity: "high", category: "traveler" });
    _uniquePush(travelerQuestions, { code: "traveler_count", question: "How many adults, children, and infants are traveling?", why: "Affordability, per-person cost, and hotel suitability depend on the group size.", priority: "high" });
    _uniquePush(sellerQuestions, { code: "seller_price_basis", question: "Can you confirm whether this quote is for the full group or based on a standard occupancy like 2 adults?", why: "We need the price basis before comparing value properly.", priority: "high" });
    _uniquePush(nextInputsNeeded, { code: "traveler_count", label: "Add traveler count", reason: "Without traveler count, per-person affordability stays weak.", priority: "high", suggested_upload: "Seller quote page or message that shows adult/child count" });
    budgetingGaps.push("traveler count");
  }

  if (!hasVisiblePrice || missingFields.has("total_price") || missingFields.has("price_per_person")) {
    _uniquePush(decisionFlags, { code: "price_missing_or_partial", title: "Price details are incomplete", detail: "The visible material does not yet show a strong final trip amount or clear price breakup.", severity: "high", active: true });
    _uniquePush(nextInputsNeeded, { code: "price_breakup", label: "Upload the final quote page or price breakup", reason: "We need the final amount or fare breakup before judging value properly.", priority: "high", suggested_upload: "Final quote PDF, pricing summary, or breakup screenshot" });
  }

  if (likelyStayCase && !hasHotels) {
    _uniquePush(decisionFlags, { code: "hotel_names_missing", title: "Hotel names are still missing", detail: "The package looks stay-based, but the actual hotel names are not visible yet.", severity: "medium", active: true });
    _uniquePush(advisoryInsights, { code: "hotel_names_missing", title: "We still need the hotel names", detail: "Without the exact hotels, we cannot judge location quality, room value, or whether the seller is using a placeholder stay.", severity: "medium", category: "hotel" });
    _uniquePush(nextInputsNeeded, { code: "hotel_details", label: "Upload the hotel page or full package PDF", reason: "The current material does not clearly show the hotel names or room category.", priority: "high", suggested_upload: "Accommodation table, hotel confirmation page, or full quote PDF" });
    _uniquePush(sellerQuestions, { code: "seller_hotel_names", question: "Can you share the exact hotel names and room category that this quote is based on?", why: "Hotel substitutions and vague placeholders make it hard to judge real value.", priority: "high" });
  }

  if (mealPlan === "breakfast_only") {
    _uniquePush(decisionFlags, { code: "meal_plan_breakfast_only", title: "Meal plan looks light", detail: "Only breakfast is visible in the package inclusions.", severity: "medium", active: true });
    _uniquePush(advisoryInsights, { code: "meal_plan_breakfast_only", title: "Only breakfast appears included", detail: "Lunch and dinner may become a separate out-of-pocket cost during the trip.", severity: "medium", category: "meals", evidence: _hasText(input.inclusions_text) ? [input.inclusions_text!.slice(0, 160)] : undefined });
    _uniquePush(sellerQuestions, { code: "seller_meal_plan", question: "Which meals are included each day, and what is definitely extra?", why: "Meal gaps often change the actual day-to-day spend more than travelers expect.", priority: "medium" });
    budgetingGaps.push("lunch and dinner costs");
  } else if (mealPlan === "unknown" && hasHotels) {
    _uniquePush(decisionFlags, { code: "meal_plan_unclear", title: "Meal plan unclear", detail: "The itinerary does not clearly show what meals are included.", severity: "medium", active: true });
    _uniquePush(advisoryInsights, { code: "meal_plan_unclear", title: "Meal plan is still unclear", detail: "We cannot tell yet whether meals are included beyond the room stay, so daily food spend may still be missing from the real budget.", severity: "medium", category: "meals" });
    _uniquePush(nextInputsNeeded, { code: "meal_plan_detail", label: "Add a page with package inclusions", reason: "Meal coverage is still unclear.", priority: "medium", suggested_upload: "Package inclusions screenshot or PDF page" });
  }

  if (shouldFlagInsurance) {
    const insuranceSeverity: AdvisorySeverity = isInternational || explicitInsuranceExclusion ? "high" : "medium";
    _uniquePush(decisionFlags, { code: "insurance_not_visible", title: "Insurance not visible", detail: "Travel insurance is not currently visible in this itinerary.", severity: insuranceSeverity, active: true });
    _uniquePush(advisoryInsights, { code: "insurance_not_visible", title: "Travel insurance is not visible", detail: explicitInsuranceExclusion ? "The quote explicitly leaves travel insurance outside the package, so this protection layer still needs a decision." : isInternational ? "This is an international trip, so insurance is worth checking before payment." : "Insurance is not clearly visible yet, but it only matters if you want that cover added separately.", severity: insuranceSeverity, category: "coverage" });
    _uniquePush(sellerQuestions, { code: "seller_insurance", question: "Is travel insurance included, optional, or completely separate from this quote?", why: "We want to know whether medical or cancellation cover is already part of the package.", priority: "medium" });
    if (explicitInsuranceExclusion) budgetingGaps.push("travel insurance");
  }

  if (isInternational && input.visa_mentioned !== true) {
    _uniquePush(decisionFlags, { code: "visa_not_visible", title: "Visa support not visible", detail: "The quote does not clearly mention visa support or visa fees.", severity: "high", active: true });
    _uniquePush(advisoryInsights, { code: "visa_not_visible", title: "Visa support is not visible", detail: "For this international trip, visa handling and visa cost should be confirmed before payment.", severity: "high", category: "coverage" });
    _uniquePush(sellerQuestions, { code: "seller_visa_scope", question: "Is visa assistance included, and are visa fees already part of this quote?", why: "Visa fees and timelines can materially change the real cost and booking readiness.", priority: "high" });
    budgetingGaps.push("visa costs");
  }

  if (timingRelevant && !timingReady) {
    _uniquePush(decisionFlags, { code: "timing_data_incomplete", title: "Trip timing check is blocked", detail: "Flight arrival and hotel check-in are not both visible yet.", severity: "medium", active: true });
    _uniquePush(advisoryInsights, { code: "timing_data_incomplete", title: "Timing details are incomplete", detail: "We cannot properly check arrival gaps or late check-in risk until both flight and hotel timings are visible.", severity: "medium", category: "timing" });
    _uniquePush(nextInputsNeeded, { code: "timing_details", label: "Upload arrival time and hotel check-in details", reason: "Trip timing checks need both transport and hotel timing.", priority: "medium", suggested_upload: "Flight itinerary screenshot and hotel confirmation page" });
    _uniquePush(sellerQuestions, { code: "seller_timing_details", question: "Can you share the exact arrival timing and hotel check-in timing for this booking?", why: "We want to catch late-arrival and check-in gaps before the trip is paid for.", priority: "medium" });
  }

  if (priceBasisUnclear) {
    _uniquePush(decisionFlags, { code: "price_basis_unclear", title: "Price basis is unclear", detail: "The visible quote shows a total amount, but not enough context to map it cleanly per traveler.", severity: "medium", active: true });
    _uniquePush(advisoryInsights, { code: "price_basis_unclear", title: "Price is visible, but the basis is still unclear", detail: "We should confirm whether the shown amount is for the full group, for a standard room occupancy, or per traveler.", severity: "medium", category: "budget", evidence: priceLabel ? [priceLabel] : undefined });
    _uniquePush(nextInputsNeeded, { code: "price_basis", label: "Upload the occupancy or traveler-based quote page", reason: "We still need to tie the visible price to the traveler count and room basis.", priority: "medium", suggested_upload: "Occupancy pricing table, per-person quote, or seller message with group basis" });
  }

  if (GROUND_DESTINATION_HINTS.has(destinationKey) && !hasFlights) {
    _uniquePush(decisionFlags, { code: "destination_travel_mode_question", title: "Starting-leg travel mode needs confirmation", detail: `Trips to ${destination} often need a clear starting city and first-leg travel plan.`, severity: "medium", active: true });
    _uniquePush(travelerQuestions, { code: "destination_mode_question", question: `Are you planning to reach ${destination} by road, train, or air?`, why: "That first-leg choice often changes the real cost and comfort of the trip.", priority: "medium" });
  }

  if (hotelNames.length > 0) {
    _uniquePush(decisionFlags, { code: "hotel_quality_followup_available", title: "Hotel comparison can be enriched further", detail: "Hotel names are visible, so comparable quality and location checks are possible next.", severity: "low", active: true });
    _uniquePush(advisoryInsights, { code: "hotel_quality_followup_available", title: "Hotel quality check is the next useful enrichment", detail: "We can compare hotel location, room category, and value once partner inventory or hotel metadata is plugged in.", severity: "low", category: "hotel", evidence: hotelNames.length ? hotelNames.slice(0, 2) : undefined });
    _uniquePush(sellerQuestions, { code: "seller_hotel_quality", question: "Can you confirm the exact hotel, room category, cancellation terms, and whether this is the final hotel or a similar-category placeholder?", why: "Hotel substitutions and room-category gaps often change the real value of a package.", priority: "medium" });
  }

  if (likelyStayCase && !hasFlights) {
    _uniquePush(travelerQuestions, { code: "flight_plan_missing", question: "Have you already booked your flights or train, or is that still open?", why: "If the stay is visible but transport is still open, your total budget is not final yet.", priority: "high" });
    _uniquePush(nextInputsNeeded, { code: "flight_details", label: "Upload your flight or train details", reason: "Transport is still missing from this case.", priority: "high", suggested_upload: "Airline itinerary, train booking, or seller message with transport plan" });
  }

  const materialBudgetGap = transportMissing || !hasTravelerCount || priceBasisUnclear || shouldFlagInsurance || (isInternational && input.visa_mentioned !== true) || (mealPlan === "unknown" && likelyStayCase);
  if (hasVisiblePrice && materialBudgetGap) {
    _uniquePush(decisionFlags, { code: "full_trip_budget_incomplete", title: "Full-trip budgeting is incomplete", detail: "The visible quote is useful, but not yet strong enough to stand in as your real trip budget.", severity: "high", active: true });
    _uniquePush(advisoryInsights, { code: "full_trip_budget_incomplete", title: "This quote is still incomplete for full-trip budgeting", detail: budgetingGaps.length > 0 ? `Key budget gaps still look open: ${budgetingGaps.join(", ")}.` : "A few trip-cost layers are still missing, so the current amount may understate the real spend.", severity: "high", category: "budget" });
  }

  _addMissingFieldDrivenNextInputs(nextInputsNeeded, missingFields, { likelyStayCase, hasFlights, timingRelevant });

  const materiallyIncomplete = completenessBand !== "strong" || missingFields.size > 0 || decisionFlags.some((f) => f.severity === "high");
  if (materiallyIncomplete && nextInputsNeeded.length === 0) {
    _uniquePush(nextInputsNeeded, { code: "full_quote_context", label: "Upload the full quote or complete itinerary", reason: "The current material is not complete enough for a strong review yet.", priority: "high", suggested_upload: "Full package PDF, full quote screenshots, or the booking confirmation page" });
  }

  const finalizedNextInputs = [...nextInputsNeeded]
    .sort((a, b) => { const pd = _priorityRank(a.priority) - _priorityRank(b.priority); if (pd !== 0) return pd; const id = _nextInputRank(a.code) - _nextInputRank(b.code); if (id !== 0) return id; return a.label.localeCompare(b.label); })
    .slice(0, 3);

  const emiReady = hasVisiblePrice;
  const timingModuleReady = timingReady;
  const budgetingReady = hasVisiblePrice && hasTravelerCount;

  _uniquePush(unlockableModules, { code: "emi_affordability", label: "EMI & affordability", status: emiReady ? "ready" : "needs_more_input", reason: emiReady ? "Trip price is visible." : "Trip price is still missing.", provider_hint: "internal" });
  _uniquePush(unlockableModules, { code: "trip_timing_check", label: "Trip Timing Check", status: timingRelevant ? (timingModuleReady ? "ready" : "needs_more_input") : "planned", reason: timingRelevant ? (timingModuleReady ? "Flight and hotel timings are available." : "Flight arrival and hotel timing are not both visible yet.") : "Trip timing only becomes relevant when both the stay and the travel leg are visible.", provider_hint: "internal" });
  _uniquePush(unlockableModules, { code: "trip_budgeting", label: "Trip Budgeting", status: budgetingReady ? "ready" : "needs_more_input", reason: budgetingReady ? "Price and traveler count are available." : "Trip budgeting needs both a visible price and traveler count.", provider_hint: "internal" });
  _uniquePush(unlockableModules, { code: "seller_question_checklist", label: "Questions to ask your seller", status: sellerQuestions.length > 0 ? "ready" : "planned", reason: sellerQuestions.length > 0 ? "The engine has a seller checklist ready." : "Seller checklist will grow as more trip details are found.", provider_hint: "internal" });

  if (hotelNames.length > 0) {
    _uniquePush(unlockableModules, { code: "hotel_quality_compare", label: "Hotel quality comparison", status: "planned", reason: "Hotel names are visible and ready for partner-inventory comparison later.", provider_hint: "tbo_future" });
  }
  if (hotelNames.length > 0 || hasFlights) {
    _uniquePush(unlockableModules, { code: "component_compare", label: "Component comparison", status: "planned", reason: "This case has enough structure to support future component-level comparison.", provider_hint: "tbo_future" });
  }
  if (hasVisiblePrice) {
    _uniquePush(unlockableModules, { code: "smarter_rebuild_signal", label: "Smarter rebuild signal", status: "planned", reason: "Visible pricing can later be compared against rebuilt options and partner inventory.", provider_hint: "tbo_future" });
  }

  const nextBestAction =
    finalizedNextInputs.find((i) => i.code === "traveler_count") ||
    finalizedNextInputs.find((i) => i.code === "travel_dates") ||
    finalizedNextInputs.find((i) => i.code === "price_breakup") ||
    finalizedNextInputs.find((i) => i.code === "hotel_details") ||
    finalizedNextInputs.find((i) => i.code === "origin_transport_plan") ||
    finalizedNextInputs.find((i) => i.code === "flight_details") ||
    finalizedNextInputs.find((i) => i.code === "timing_details") ||
    finalizedNextInputs[0] || { code: "review_seller_checklist", label: "Review the seller checklist", reason: "The core extraction is usable, so the next win is clarifying open trip details before paying.", priority: "low" as AdvisoryPriority };

  return {
    package_mode: packageMode,
    extracted_completeness_score: completenessScore,
    traveler_questions_json: travelerQuestions,
    seller_questions_json: sellerQuestions,
    advisory_insights_json: advisoryInsights,
    next_inputs_needed_json: finalizedNextInputs,
    unlockable_modules_json: unlockableModules,
    enrichment_status_json: {
      advisory_version: ITINERARY_INTELLIGENCE_VERSION,
      has_price: hasVisiblePrice, has_traveler_count: hasTravelerCount, has_flights: hasFlights, has_hotels: hasHotels,
      timing_ready: timingReady, budgeting_ready: budgetingReady, package_mode: packageMode, completeness_band: completenessBand,
      next_best_action: { code: nextBestAction.code, label: nextBestAction.label, detail: nextBestAction.reason },
      tbo_hooks: { comparable_hotels: hotelNames.length > 0, component_compare: hotelNames.length > 0 || hasFlights, smarter_rebuild: hasVisiblePrice },
    },
    decision_flags_json: decisionFlags,
  };
}

// ── Unified extraction + advisory prompt (single pass) ───────────

const EXTRACTION_PROMPT = `You are a travel itinerary/quote parser AND travel advisor for SanKash, an Indian travel fintech company. You receive one or more images/documents from a single trip. They may be screenshots from WhatsApp, OTA apps, travel agent PDFs, or mixed formats. Treat ALL inputs together as one itinerary session.

Your job is TWO-FOLD in ONE response:
1. Extract structured trip data from the documents.
2. Generate advisory intelligence that helps the traveler make a smarter booking decision.

Return a SINGLE JSON object with ALL of these fields (use null for genuinely unknown values — never invent data):

{
  "domestic_or_international": "domestic" | "international" | null,
  "destination_country": string | null,
  "destination_city": string | null,
  "additional_destinations": [],
  "travel_start_date": "YYYY-MM-DD" | null,
  "travel_end_date": "YYYY-MM-DD" | null,
  "duration_nights": number | null,
  "duration_days": number | null,
  "total_price": number | null,
  "price_per_person": number | null,
  "alternate_prices": [],
  "price_notes": string | null,
  "currency": "INR" | "USD" | etc,
  "traveller_count_total": number | null,
  "adults_count": number | null,
  "children_count": number | null,
  "infants_count": number | null,
  "travel_agent_name": string | null,
  "customer_name": string | null,
  "hotel_names": [],
  "airline_names": [],
  "sectors": [],
  "flight_departure_time": string | null,
  "flight_arrival_time": string | null,
  "hotel_check_in": "YYYY-MM-DD" | null,
  "hotel_check_out": "YYYY-MM-DD" | null,
  "inclusions_text": string summary | null,
  "exclusions_text": string summary | null,
  "visa_mentioned": boolean,
  "insurance_mentioned": boolean,
  "package_mode": "flights_and_hotels" | "land_only" | "flights_only" | "hotels_only" | "custom" | null,
  "parsing_confidence": "high" | "medium" | "low",
  "missing_fields": [],
  "extracted_snippets": [],
  "confidence_notes": string | null,
  "extraction_warnings": [],

  "advisory_summary": string — A 2-3 sentence plain-English summary of what this package is. Be specific. Example: "This looks like a 5-night land-only Manali package for 2 adults. Your travel to Chandigarh (the likely start point) may not be included in the quoted cost. The price covers hotels and sightseeing but meals appear to be partial.",

  "advisory_insights": [
    {
      "title": string (5-8 words),
      "description": string (1-2 sentences),
      "severity": "info" | "warning" | "critical",
      "category": "pricing" | "logistics" | "coverage" | "inclusions" | "timing" | "quality"
    }
  ] — 2-5 actionable insights about gaps, risks, unclear items. Examples:
    - Transport to start point may not be included
    - Meal plan looks incomplete
    - No travel insurance for international trip
    - Per-person price unclear
    - Airport transfers not mentioned

  "traveler_questions": [] — 3-6 specific questions the traveler should ask the seller before booking. Make them practical. Example:
    - "Does the ₹45,000 include travel from your city to Chandigarh?"
    - "Are all meals included or only breakfast?"
    - "Is travel insurance included? If not, what's the cost?"

  "seller_questions": [] — 2-4 questions that reveal seller quality. Example:
    - "Can you share exact hotel names and star ratings?"
    - "What is the cancellation policy?"

  "next_inputs_needed": [
    { "label": string, "reason": string, "priority": "high" | "medium" | "low" }
  ] — What additional files/info would improve the analysis. Only if genuinely needed.

  "unlockable_modules": [
    { "module_id": string, "label": string, "description": string, "available": boolean }
  ] — Relevant future value modules. module_id must be one of: "emi_estimate", "trip_budgeting", "hotel_quality", "compare_alternatives", "insurance_check", "visa_check". Max 4, only relevant ones.

  "extracted_completeness_score": number 0-100 — 90+ = strong, 60-89 = good but gaps, 30-59 = partial, <30 = very limited,

  "decision_flags": {
    "transport_missing": boolean,
    "meals_incomplete": boolean,
    "insurance_missing": boolean,
    "visa_unclear": boolean,
    "per_person_unclear": boolean,
    "dates_incomplete": boolean,
    "price_unclear": boolean
  }
}

CRITICAL RULES:

Multi-file handling:
- You may receive multiple images/documents. They ALL belong to the same trip.
- Cross-reference information across files. E.g., file 1 may show flights, file 2 may show hotels and price.
- Merge data from all files into ONE unified response. Do not return per-file results.
- If the same field appears in multiple files with different values, pick the most reliable one and note the conflict in extraction_warnings.
- If one file looks like a revised quote, final quote, or booking confirmation, prefer that value over earlier brochure or teaser details.

Domestic vs International:
- ALL destinations within India = "domestic". ANY outside = "international".

Hotels:
- hotel_names should include the exact hotel names whenever they are visible.
- Read accommodation tables, hotel sections, and named stay lines carefully before leaving hotel_names empty.
- If the document says "or similar", keep the named hotel if it is visible and mention the uncertainty in extraction_warnings.

Price extraction:
- total_price = final package/total price as a plain number.
- price_per_person = per-person cost ONLY if explicitly stated.

Date extraction:
- travel_start_date and travel_end_date should only be the actual trip dates or explicit booked departure and return dates.
- Do NOT use offer validity windows, seasonal travel ranges, or "available from / valid till / travel period" text as actual trip dates.
- If the document only shows a broad travel window and not a specific booked date, leave travel_start_date and travel_end_date as null.

People count:
- Only set counts you can actually see.

Confidence:
- "high": 4+ Ring 1 fields (destination, dates, price, traveller count) clearly found.
- "medium": 2-3 Ring 1 fields found.
- "low": fewer than 2 Ring 1 fields.

Advisory tone:
- Be helpful, not alarming. Like a knowledgeable friend.
- If the package looks good and complete, say so. Don't invent problems.
- Keep language simple, no jargon.
- Amounts should use ₹ symbol for INR.

Screenshots are NORMAL input. Extract whatever is visible. NEVER fail because input is a screenshot.

Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.`;

// ── File content extraction ──────────────────────────────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function extractTextFromDocx(bytes: Uint8Array): Promise<string> {
  try {
    const unzipped = unzipSync(bytes);
    const docXml = unzipped["word/document.xml"];
    if (!docXml) return "[DOCX: could not find word/document.xml]";
    const xmlText = new TextDecoder().decode(docXml);
    const paragraphs: string[] = [];
    const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(xmlText)) !== null) {
      const pBlock = pMatch[0];
      const pTexts: string[] = [];
      const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
      let tMatch;
      while ((tMatch = tRegex.exec(pBlock)) !== null) {
        pTexts.push(tMatch[1]);
      }
      if (pTexts.length > 0) paragraphs.push(pTexts.join(""));
    }
    const extracted = paragraphs.join("\n");
    if (!extracted.trim()) return "[DOCX: no readable text found]";
    return extracted.length > 40000 ? extracted.slice(0, 40000) + "\n[...truncated]" : extracted;
  } catch (err) {
    return `[DOCX extraction failed: ${(err as Error).message}]`;
  }
}

interface FileContent {
  rawText: string;
  fileBytes: Uint8Array | null;
  mimeType: string | null;
  fileName: string;
}

function getFileType(fileName: string): "image" | "pdf" | "docx" | "text" {
  const lower = fileName.toLowerCase();
  if (/\.(jpg|jpeg|png|webp)$/.test(lower)) return "image";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  return "text";
}

async function fetchFileContent(fileUrl: string, fileName: string): Promise<FileContent> {
  const fileType = getFileType(fileName);
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const arrayBuf = await resp.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuf);

    if (fileType === "image") {
      return { rawText: `[IMAGE: ${fileName}]`, fileBytes, mimeType: "image", fileName };
    }
    if (fileType === "pdf") {
      return { rawText: `[PDF: ${fileName}, ${fileBytes.length} bytes]`, fileBytes, mimeType: "application/pdf", fileName };
    }
    if (fileType === "docx") {
      const text = await extractTextFromDocx(fileBytes);
      return { rawText: text, fileBytes: null, mimeType: "text", fileName };
    }
    const textContent = new TextDecoder().decode(fileBytes);
    return { rawText: textContent.slice(0, 40000), fileBytes: null, mimeType: "text", fileName };
  } catch (err) {
    return { rawText: `[COULD NOT FETCH: ${fileName}: ${(err as Error).message}]`, fileBytes: null, mimeType: null, fileName };
  }
}

// ── AI analysis (single unified pass: extraction + advisory) ─────

function buildImageUrlContent(fileUrl: string, fileBytes: Uint8Array, mimeType: string): Record<string, unknown> {
  if (mimeType === "image") {
    return { type: "image_url", image_url: { url: fileUrl } };
  }
  const base64 = uint8ToBase64(fileBytes);
  return { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } };
}

async function analyzeWithAI(files: { content: FileContent; fileUrl: string }[]): Promise<Record<string, unknown>> {
  const userContent: Array<Record<string, unknown>> = [];

  for (let i = 0; i < files.length; i++) {
    const { content, fileUrl } = files[i];
    const label = `File ${i + 1}: ${content.fileName}`;

    if (content.mimeType === "image" && content.fileBytes) {
      userContent.push(buildImageUrlContent(fileUrl, content.fileBytes, "image"));
      userContent.push({ type: "text", text: `${label} — screenshot/image of travel document. Extract all visible travel data.` });
    } else if (content.mimeType === "application/pdf" && content.fileBytes) {
      userContent.push(buildImageUrlContent(fileUrl, content.fileBytes, "application/pdf"));
      userContent.push({ type: "text", text: `${label} — PDF travel document. Extract all structured travel data including tables, pricing, and flight details.` });
    } else {
      const preview = content.rawText.length > 30000 ? content.rawText.slice(0, 30000) + "\n[...truncated]" : content.rawText;
      userContent.push({ type: "text", text: `${label}:\n--- CONTENT START ---\n${preview}\n--- CONTENT END ---` });
    }
  }

  userContent.push({
    type: "text",
    text: `You have received ${files.length} file(s) for ONE trip. Extract all data AND generate advisory intelligence in a single JSON response. Return ONLY valid JSON.`,
  });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.15,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return JSON.parse(jsonMatch[0]);
}

// ── Currency conversion ──────────────────────────────────────────

const INR_RATES: Record<string, number> = {
  INR: 1, USD: 83, EUR: 90, GBP: 105, AED: 23, SGD: 62, AUD: 55,
  NZD: 50, THB: 2.4, MYR: 18, LKR: 0.26, JPY: 0.56, CAD: 62, CHF: 93,
};

function convertToINR(amount: number, currency: string): { inrAmount: number; rate: number } | null {
  const rate = INR_RATES[currency.toUpperCase()];
  if (!rate) return null;
  return { inrAmount: Math.round(amount * rate), rate };
}

// ── Commercial flags ─────────────────────────────────────────────

function computeCommercialFlags(parsed: Record<string, unknown>) {
  let totalPrice = typeof parsed.total_price === "number" ? parsed.total_price : null;
  const pricePerPerson = typeof parsed.price_per_person === "number" ? parsed.price_per_person : null;
  const paxCount = typeof parsed.traveller_count_total === "number" ? parsed.traveller_count_total : null;

  if (totalPrice == null && pricePerPerson != null && paxCount != null && paxCount > 0) {
    totalPrice = pricePerPerson * paxCount;
    parsed.total_price = totalPrice;
    parsed.price_notes = ((parsed.price_notes as string) || "") +
      ` [Auto-computed: ${pricePerPerson} × ${paxCount} pax = ${totalPrice}]`;
  }

  const currency = ((parsed.currency as string) || "INR").toUpperCase();
  const isInternational = parsed.domestic_or_international === "international";
  const insuranceMentioned = parsed.insurance_mentioned === true;
  const visaMentioned = parsed.visa_mentioned === true;

  let emiCheckAmount = totalPrice;
  if (totalPrice != null && currency !== "INR") {
    const conversion = convertToINR(totalPrice, currency);
    if (conversion) {
      emiCheckAmount = conversion.inrAmount;
    } else {
      emiCheckAmount = null;
    }
  }

  return {
    emi_candidate: emiCheckAmount != null && emiCheckAmount >= 20000 && emiCheckAmount <= 2000000,
    insurance_candidate: isInternational || insuranceMentioned || (visaMentioned && isInternational),
    pg_candidate: totalPrice != null && totalPrice > 0,
  };
}

// ── Main handler ─────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: AnalysisRequest = await req.json();
    const { lead_id, attachment_id, audience_type } = body;

    let fileInputs: FileInput[] = [];
    if (body.files && body.files.length > 0) {
      fileInputs = body.files.slice(0, 5);
    } else if (body.file_url && body.file_name) {
      fileInputs = [{ file_url: body.file_url, file_name: body.file_name }];
    }

    if (!lead_id || fileInputs.length === 0) {
      return new Response(JSON.stringify({ error: "lead_id and at least one file required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Processing ${fileInputs.length} file(s) for lead: ${lead_id}`);
    const fileContents = await Promise.all(
      fileInputs.map(f => fetchFileContent(f.file_url, f.file_name).then(content => ({ content, fileUrl: f.file_url })))
    );

    const rawParsed = await analyzeWithAI(fileContents);
    console.log(`AI extraction complete. Confidence: ${rawParsed.parsing_confidence}`);

    const combinedRawText = fileContents.map((f, i) =>
      `--- File ${i + 1}: ${f.content.fileName} ---\n${f.content.rawText}`
    ).join("\n\n");

    const parsed = normalizeItineraryExtraction(rawParsed, combinedRawText, new Date());

    const flags = computeCommercialFlags(parsed as Record<string, unknown>);

    const record: Record<string, unknown> = {
      lead_id,
      attachment_id: attachment_id || null,
      uploaded_by_audience: audience_type || null,
      raw_text: combinedRawText.length > 50000 ? combinedRawText.slice(0, 50000) : combinedRawText,
      file_count: fileInputs.length,
      file_names_json: fileInputs.map(f => f.file_name),
      parsing_confidence: (parsed.parsing_confidence as string) || "low",
      domestic_or_international: (parsed.domestic_or_international as string) || null,
      destination_country: (parsed.destination_country as string) || null,
      destination_city: (parsed.destination_city as string) || null,
      travel_start_date: (parsed.travel_start_date as string) || null,
      travel_end_date: (parsed.travel_end_date as string) || null,
      duration_nights: typeof parsed.duration_nights === "number" ? parsed.duration_nights : null,
      duration_days: typeof parsed.duration_days === "number" ? parsed.duration_days : null,
      total_price: typeof parsed.total_price === "number" ? parsed.total_price : null,
      price_per_person: typeof parsed.price_per_person === "number" ? parsed.price_per_person : null,
      currency: (parsed.currency as string) || "INR",
      traveller_count_total: typeof parsed.traveller_count_total === "number" ? parsed.traveller_count_total : null,
      adults_count: typeof parsed.adults_count === "number" ? parsed.adults_count : null,
      children_count: typeof parsed.children_count === "number" ? parsed.children_count : null,
      infants_count: typeof parsed.infants_count === "number" ? parsed.infants_count : null,
      travel_agent_name: (parsed.travel_agent_name as string) || null,
      customer_name: (parsed.customer_name as string) || null,
      hotel_names_json: parsed.hotel_names || [],
      airline_names_json: parsed.airline_names || [],
      sectors_json: parsed.sectors || [],
      additional_destinations_json: parsed.additional_destinations || [],
      inclusions_text: (parsed.inclusions_text as string) || null,
      exclusions_text: (parsed.exclusions_text as string) || null,
      visa_mentioned: parsed.visa_mentioned ?? null,
      insurance_mentioned: parsed.insurance_mentioned ?? null,
      flight_departure_time: (parsed.flight_departure_time as string) || null,
      flight_arrival_time: (parsed.flight_arrival_time as string) || null,
      hotel_check_in: (parsed.hotel_check_in as string) || null,
      hotel_check_out: (parsed.hotel_check_out as string) || null,
      confidence_notes: (parsed.confidence_notes as string) || null,
      package_mode: (parsed.package_mode as string) || null,
      emi_candidate: flags.emi_candidate,
      insurance_candidate: flags.insurance_candidate,
      pg_candidate: flags.pg_candidate,
      missing_fields_json: parsed.missing_fields || [],
      extracted_snippets_json: parsed.extracted_snippets || [],
      extraction_warnings_json: parsed.extraction_warnings || [],
      extracted_fields_json: { ...parsed },
      advisory_summary: (parsed.advisory_summary as string) || null,
      advisory_insights_json: parsed.advisory_insights || [],
      traveler_questions_json: parsed.traveler_questions || [],
      seller_questions_json: parsed.seller_questions || [],
      next_inputs_needed_json: parsed.next_inputs_needed || [],
      unlockable_modules_json: parsed.unlockable_modules || [],
      extracted_completeness_score: typeof parsed.extracted_completeness_score === "number" ? parsed.extracted_completeness_score : 0,
      decision_flags_json: parsed.decision_flags || {},
      enrichment_status_json: { extraction: "complete", advisory: parsed.advisory_summary ? "complete" : "partial" },
    };

    const intelligence = deriveItineraryIntelligence({
      domestic_or_international: record.domestic_or_international as string | null,
      destination_country: record.destination_country as string | null,
      destination_city: record.destination_city as string | null,
      additional_destinations_json: record.additional_destinations_json as string[],
      travel_start_date: record.travel_start_date as string | null,
      travel_end_date: record.travel_end_date as string | null,
      duration_nights: record.duration_nights as number | null,
      duration_days: record.duration_days as number | null,
      total_price: record.total_price as number | null,
      price_per_person: record.price_per_person as number | null,
      currency: record.currency as string | null,
      traveller_count_total: record.traveller_count_total as number | null,
      adults_count: record.adults_count as number | null,
      children_count: record.children_count as number | null,
      infants_count: record.infants_count as number | null,
      hotel_names_json: record.hotel_names_json as string[],
      airline_names_json: record.airline_names_json as string[],
      sectors_json: record.sectors_json as string[],
      inclusions_text: record.inclusions_text as string | null,
      exclusions_text: record.exclusions_text as string | null,
      visa_mentioned: record.visa_mentioned as boolean | null,
      insurance_mentioned: record.insurance_mentioned as boolean | null,
      flight_departure_time: record.flight_departure_time as string | null,
      flight_arrival_time: record.flight_arrival_time as string | null,
      hotel_check_in: record.hotel_check_in as string | null,
      hotel_check_out: record.hotel_check_out as string | null,
      parsing_confidence: record.parsing_confidence as string | null,
      missing_fields_json: record.missing_fields_json as string[],
      extraction_warnings_json: record.extraction_warnings_json as string[],
    });

    Object.assign(record, intelligence);

    const { data: existing } = await supabaseAdmin
      .from("itinerary_analysis")
      .select("id")
      .eq("lead_id", lead_id)
      .limit(1)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("itinerary_analysis")
        .update(record)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("itinerary_analysis")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    const leadUpdate: Record<string, unknown> = {
      emi_flag: flags.emi_candidate,
      insurance_flag: flags.insurance_candidate,
      pg_flag: flags.pg_candidate,
    };
    if (parsed.domestic_or_international) {
      leadUpdate.destination_type = parsed.domestic_or_international;
    }
    if (typeof parsed.total_price === "number" && parsed.total_price > 0) {
      leadUpdate.quote_amount = parsed.total_price;
    }
    await supabaseAdmin.from("leads").update(leadUpdate).eq("id", lead_id);

    const destLabel = parsed.destination_city || parsed.destination_country || "Unknown destination";
    const confLabel = parsed.parsing_confidence || "low";
    const fileCount = fileInputs.length;
    await supabaseAdmin.from("lead_activity").insert({
      lead_id,
      activity_type: "itinerary_analyzed",
      description: `Itinerary analyzed (${fileCount} file${fileCount > 1 ? "s" : ""}): ${destLabel}, confidence: ${confLabel}, completeness: ${record.extracted_completeness_score}%`,
    });

    return new Response(JSON.stringify({ success: true, analysis: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-itinerary error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
