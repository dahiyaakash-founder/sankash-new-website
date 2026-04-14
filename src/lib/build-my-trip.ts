import type {
  TravelerInspirationInput,
  TravelerPreferences,
} from "@/lib/traveler-trip-context";

export type BuildTripStartMode = "known_destination" | "destination_discovery" | "inspiration_dump";
export type BuildTripEntryMode = "yes" | "no" | "shortlisting_a_few_places";
export type BuildTripConfidence = "high" | "medium" | "low";
export type BuildTripInputStrength = "weak" | "medium" | "strong";
export type BuildTripBookableStatus =
  | "no_bookable_attempt"
  | "pricing_pending"
  | "partial_bookable_match"
  | "bookable_option_found"
  | "multiple_bookable_directions"
  | "insufficient_trip_structure"
  | "supplier_unavailable";
export type BuildTripPricingType = "exact" | "estimated" | "range" | "unavailable";

export interface BuildTripBrief {
  start_mode: BuildTripStartMode | "";
  entry_mode: BuildTripEntryMode | "";
  destination_in_mind: string;
  shortlisted_destinations: string[];
  holiday_style: string;
  trip_type: string;
  traveler_mix: string;
  approximate_budget_band: string;
  budget_for_count: string;
  domestic_or_international: string;
  tentative_month_or_dates: string;
  departure_city: string;
  trip_duration: string;
  priorities: string[];
  notes: string;
  inspiration_dump_text: string;
}

export interface BuildTripDestinationSignal {
  destination: string;
  confidence: BuildTripConfidence;
  reason: string;
}

export interface BuildTripSignalExtraction {
  likely_destinations: BuildTripDestinationSignal[];
  likely_trip_type: string | null;
  vibe_signals: string[];
  activity_signals: string[];
  stay_style_signals: string[];
  budget_signal: string | null;
  budget_intent_signal: "value" | "balanced" | "premium" | null;
  duration_signal: string | null;
  travel_month_signal: string | null;
  traveler_mix_signal: string | null;
  departure_city_signal: string | null;
  domestic_or_international_signal: "domestic" | "international" | null;
  hotel_priority_signal: boolean;
  emi_affordability_signal: boolean;
  inferred_hotel_names: string[];
  destination_signal_strength: "none" | "single_soft" | "single_strong" | "multiple_competing";
  aspiration_level: "grounded" | "balanced" | "aspirational" | "premium_aspirational";
  realism_assessment: "aligned" | "slightly_above_budget" | "aspirational_mismatch" | "unknown";
  destination_flexibility: "fixed" | "open_to_similar" | "exploring";
  inspiration_read: string;
  input_strength: BuildTripInputStrength;
  missing_anchors: string[];
}

export interface BuildTripClarifyingQuestion {
  code: string;
  question: string;
  why: string;
  target: "brief" | "preferences";
  field: string;
  options: Array<{ value: string; label: string }>;
}

export interface BuildTripVersionOutput {
  title: string;
  price_summary: string;
  monthly_summary: string | null;
  summary: string;
}

export interface BuildTripBookableRead {
  status: BuildTripBookableStatus;
  summary: string;
  pricing_type: BuildTripPricingType;
  pricing_confidence: BuildTripConfidence;
  price_summary: string;
  confidence_reason: string;
}

export interface BuildTripFinanceRead {
  should_show: boolean;
  headline: string;
  summary: string;
  no_cost_emi_relevant: boolean;
  realistic_monthly: string | null;
  upgraded_monthly: string | null;
  monthly_upgrade_delta: string | null;
}

export interface BuildTripReadBackItem {
  label: string;
  value: string;
  confidence: BuildTripConfidence;
}

export interface BuildTripReadBack {
  headline: string;
  summary: string;
  items: BuildTripReadBackItem[];
  source_traces: string[];
}

export interface BuildTripSynthesisOutput {
  headline: string;
  subtext: string;
  our_read: BuildTripReadBack;
  trip_direction: string;
  destination_shortlist: string[];
  trip_structure: string;
  budget_fit_summary: string;
  aspiration_summary: string;
  next_clarification_prompt: string | null;
  bookable_read: BuildTripBookableRead;
  finance_read: BuildTripFinanceRead;
  realistic_version: BuildTripVersionOutput | null;
  upgraded_version: BuildTripVersionOutput | null;
  rebalance_version: BuildTripVersionOutput | null;
  recommended_path: "review_your_quote" | "check_your_emi" | "build_my_trip";
  next_step_label: string;
}

export type BuildTripRenderState =
  | "guided_question"
  | "trip_direction"
  | "structured_recommendation"
  | "capture_only";

export interface BuildTripRenderContract {
  source_of_truth: "build_trip_engine";
  state: BuildTripRenderState;
  reason: string;
  allow_save: boolean;
  show_our_read: boolean;
  show_next_question: boolean;
  show_trip_direction: boolean;
  show_destination_shortlist: boolean;
  show_bookable_read: boolean;
  show_versions: boolean;
  show_finance_read: boolean;
}

export interface BuildTripEngineOutput {
  start_mode: BuildTripStartMode | "";
  inspiration_inputs: TravelerInspirationInput[];
  signals: BuildTripSignalExtraction;
  clarifying_questions: BuildTripClarifyingQuestion[];
  synthesis: BuildTripSynthesisOutput;
  traveler_context: TravelerPreferences;
  render_contract: BuildTripRenderContract;
}

export interface BuildTripSummary {
  headline: string;
  subtext: string;
  trip_direction: string;
  recommendation_summary: string;
  recommended_path: "review_your_quote" | "check_your_emi" | "build_my_trip";
  next_step_label: string;
  traveler_context: TravelerPreferences;
}

export const BUILD_TRIP_DEFAULTS: BuildTripBrief = {
  start_mode: "",
  entry_mode: "",
  destination_in_mind: "",
  shortlisted_destinations: [],
  holiday_style: "",
  trip_type: "",
  traveler_mix: "",
  approximate_budget_band: "",
  budget_for_count: "",
  domestic_or_international: "",
  tentative_month_or_dates: "",
  departure_city: "",
  trip_duration: "",
  priorities: [],
  notes: "",
  inspiration_dump_text: "",
};

const DESTINATION_KEYWORDS: Array<{ destination: string; patterns: RegExp[]; tags?: string[] }> = [
  { destination: "Bali", patterns: [/\bbali\b/, /\bseminyak\b/, /\bubud\b/, /\bnusa dua\b/], tags: ["beach", "romantic", "villa"] },
  { destination: "Phuket", patterns: [/\bphuket\b/, /\bpatong\b/, /\bkata\b/], tags: ["beach", "resort"] },
  { destination: "Krabi", patterns: [/\bkrabi\b/, /\bao nang\b/, /\brailey\b/], tags: ["beach", "adventure"] },
  { destination: "Turkey", patterns: [/\bturkey\b/, /\bistanbul\b/, /\bcappadocia\b/, /\bantalya\b/, /\bbodrum\b/], tags: ["romantic", "adventure", "premium"] },
  { destination: "Vietnam", patterns: [/\bvietnam\b/, /\bhanoi\b/, /\bda nang\b/, /\bhalong\b/, /\bho chi minh\b/], tags: ["sightseeing", "food", "value"] },
  { destination: "Santorini", patterns: [/\bsantorini\b/, /\boia\b/, /\bfira\b/], tags: ["romantic", "premium", "relaxation"] },
  { destination: "Greece", patterns: [/\bgreece\b/, /\bmykonos\b/, /\bathens\b/], tags: ["romantic", "premium", "beach"] },
  { destination: "Dubai", patterns: [/\bdubai\b/, /\bmarina\b/, /\bpalm\b/], tags: ["luxury", "city_break"] },
  { destination: "Goa", patterns: [/\bgoa\b/], tags: ["beach", "short_escape"] },
  { destination: "Kashmir", patterns: [/\bkashmir\b/, /\bsrinagar\b/, /\bgulmarg\b/, /\bpahalgam\b/], tags: ["mountains", "romantic"] },
  { destination: "Maldives", patterns: [/\bmaldives\b/, /\bwater villa\b/, /\boverwater\b/], tags: ["premium", "romantic", "resort"] },
  { destination: "Sri Lanka", patterns: [/\bsri lanka\b/, /\bcolombo\b/, /\bbentota\b/], tags: ["beach", "family"] },
  { destination: "Thailand", patterns: [/\bthailand\b/, /\bbangkok\b/, /\bphi phi\b/], tags: ["beach", "shopping", "sightseeing"] },
  { destination: "Japan", patterns: [/\bjapan\b/, /\btokyo\b/, /\bosaka\b/, /\bkyoto\b/], tags: ["city_break", "premium", "sightseeing"] },
  { destination: "Europe", patterns: [/\beurope\b/, /\beurope trip\b/, /\beuro trip\b/], tags: ["premium", "sightseeing", "city_break"] },
];

const VIBE_KEYWORDS: Record<string, RegExp[]> = {
  beach: [/\bbeach\b/, /\bisland\b/, /\bsea\b/, /\bocean\b/, /\bcoast\b/],
  romantic: [/\bhoneymoon\b/, /\bromantic\b/, /\bcouple\b/, /\bsunset\b/],
  luxury: [/\bluxury\b/, /\bpremium\b/, /\bfive star\b/, /\b5 star\b/, /\bhigh-end\b/],
  family: [/\bfamily\b/, /\bkids\b/, /\bparents\b/, /\bchild\b/],
  celebration: [/\bcelebration\b/, /\banniversary\b/, /\bbirthday\b/, /\bspecial occasion\b/],
  adventure: [/\badventure\b/, /\btrek\b/, /\bscuba\b/, /\bsnorkel\b/, /\bsafari\b/],
  spiritual: [/\bspiritual\b/, /\btemple\b/, /\bdarshan\b/, /\bpilgrimage\b/],
  sightseeing: [/\bsightseeing\b/, /\bexplore\b/, /\bcity break\b/, /\bmust see\b/],
  relaxation: [/\brelax\b/, /\bslow\b/, /\bpeaceful\b/, /\bspa\b/, /\bunwind\b/],
  shopping: [/\bshopping\b/, /\bmarket\b/, /\bmalls?\b/],
  food: [/\bfood\b/, /\bculinary\b/, /\bcafe\b/, /\brestaurant\b/],
};

const ACTIVITY_KEYWORDS: Record<string, RegExp[]> = {
  island_hopping: [/\bisland hop\b/, /\bphi phi\b/, /\bboat trip\b/],
  nightlife: [/\bnightlife\b/, /\bparty\b/, /\bclub\b/],
  water_activities: [/\bscuba\b/, /\bsnorkel\b/, /\bparasail\b/, /\bwater sport\b/],
  thrill_activities: [/\bbungee\b/, /\bzipline\b/, /\bthrill\b/, /\bparaglid(?:e|ing)?\b/, /\batv\b/],
  sightseeing: [/\bsightseeing\b/, /\btemple\b/, /\bmarket\b/, /\btour\b/],
  relaxation: [/\bspa\b/, /\bpool\b/, /\bbeach day\b/, /\bsunset\b/],
  food: [/\bfood\b/, /\bstreet food\b/, /\brestaurant\b/, /\bcafe\b/],
};

const STAY_STYLE_KEYWORDS: Record<string, RegExp[]> = {
  budget: [/\bbudget\b/, /\bcheap\b/, /\bunder\b/],
  premium: [/\bpremium\b/, /\bluxury\b/, /\bfive star\b/, /\b5 star\b/],
  resort_led: [/\bresort\b/, /\bpool villa\b/, /\bbeach resort\b/],
  city_hotel: [/\bcity hotel\b/, /\bdowntown\b/, /\bcentral hotel\b/],
  villa: [/\bvilla\b/, /\bprivate pool\b/],
  beach_property: [/\bbeachfront\b/, /\bsea view\b/, /\bbeach resort\b/],
  family_hotel: [/\bfamily resort\b/, /\bkids club\b/, /\bfamily room\b/],
};

const STYLE_SHORTLISTS: Record<string, string[]> = {
  beach: ["Phuket", "Krabi", "Bali", "Goa"],
  mountains: ["Kashmir", "Himachal", "Uttarakhand", "Sikkim"],
  spiritual: ["Varanasi", "Rishikesh", "Bali", "Sri Lanka"],
  adventure: ["Krabi", "Bali", "Kashmir", "Vietnam"],
  family_holiday: ["Goa", "Dubai", "Sri Lanka", "Bali"],
  romantic_couple: ["Bali", "Maldives", "Phuket", "Kashmir"],
  celebration: ["Bali", "Dubai", "Maldives", "Phuket"],
  city_break: ["Dubai", "Japan", "Vietnam", "Thailand"],
  international_first_trip: ["Thailand", "Dubai", "Vietnam", "Sri Lanka"],
  short_escape: ["Goa", "Phuket", "Krabi", "Dubai"],
};

const LINK_STOP_WORDS = new Set([
  "https",
  "http",
  "www",
  "instagram",
  "youtube",
  "youtu",
  "facebook",
  "fb",
  "watch",
  "reel",
  "reels",
  "post",
  "travel",
  "trip",
  "video",
  "shorts",
  "stories",
  "story",
  "blog",
  "article",
  "hotel",
  "resort",
  "com",
  "in",
  "the",
  "and",
]);

const BUDGET_BANDS: Record<string, { min: number; max: number; label: string }> = {
  under_50k: { min: 25000, max: 50000, label: "under ₹50k" },
  "50k_1l": { min: 50000, max: 100000, label: "₹50k to ₹1L" },
  "1l_2l": { min: 100000, max: 200000, label: "₹1L to ₹2L" },
  "2l_5l": { min: 200000, max: 500000, label: "₹2L to ₹5L" },
  above_5l: { min: 500000, max: 800000, label: "above ₹5L" },
};

const MONTH_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "January", pattern: /\bjan(?:uary)?\b/ },
  { label: "February", pattern: /\bfeb(?:ruary)?\b/ },
  { label: "March", pattern: /\bmar(?:ch)?\b/ },
  { label: "April", pattern: /\bapr(?:il)?\b/ },
  { label: "May", pattern: /\bmay\b/ },
  { label: "June", pattern: /\bjune?\b/ },
  { label: "July", pattern: /\bjuly?\b/ },
  { label: "August", pattern: /\baug(?:ust)?\b/ },
  { label: "September", pattern: /\bsep(?:t|tember)?\b/ },
  { label: "October", pattern: /\boct(?:ober)?\b/ },
  { label: "November", pattern: /\bnov(?:ember)?\b/ },
  { label: "December", pattern: /\bdec(?:ember)?\b/ },
  { label: "Summer", pattern: /\bsummer\b/ },
  { label: "Festive season", pattern: /\bfestive\b|\bdiwali\b|\bchristmas\b|\bnew year\b/ },
  { label: "Long weekend", pattern: /\blong weekend\b/ },
];

const DEPARTURE_CITY_PATTERNS: Array<{ city: string; pattern: RegExp }> = [
  { city: "Delhi", pattern: /\bdelhi\b|\bnew delhi\b/ },
  { city: "Mumbai", pattern: /\bmumbai\b|\bbombay\b/ },
  { city: "Bengaluru", pattern: /\bbangalore\b|\bbengaluru\b/ },
  { city: "Chennai", pattern: /\bchennai\b/ },
  { city: "Hyderabad", pattern: /\bhyderabad\b/ },
  { city: "Kolkata", pattern: /\bkolkata\b|\bcalcutta\b/ },
  { city: "Pune", pattern: /\bpune\b/ },
  { city: "Ahmedabad", pattern: /\bahmedabad\b/ },
  { city: "Chandigarh", pattern: /\bchandigarh\b/ },
  { city: "Jaipur", pattern: /\bjaipur\b/ },
  { city: "Kochi", pattern: /\bkochi\b|\bcochin\b/ },
];

function uniq(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const normalized = (value ?? "").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part ? `${part[0]!.toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}

function corpusFrom(brief: BuildTripBrief, inspirationInputs: TravelerInspirationInput[]) {
  const extractedLinkText = inspirationInputs.flatMap((item) => {
    if (item.type !== "link") return [];
    try {
      const url = new URL(item.value);
      return `${url.hostname} ${url.pathname}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 3 && !LINK_STOP_WORDS.has(token));
    } catch {
      return [];
    }
  });

  return [
    brief.destination_in_mind,
    brief.shortlisted_destinations.join(" "),
    brief.holiday_style,
    brief.trip_type,
    brief.traveler_mix,
    brief.approximate_budget_band,
    brief.tentative_month_or_dates,
    brief.trip_duration,
    brief.notes,
    brief.inspiration_dump_text,
    ...brief.priorities,
    ...inspirationInputs.map((item) => item.label ?? item.value),
    ...extractedLinkText,
  ].filter(Boolean).join(" ").toLowerCase();
}

function detectBudgetFromText(text: string) {
  const match = text.match(/(?:₹|rs\.?\s*)\s*([\d,.]+)\s*(k|l|lac|lakh)?/i);
  if (!match) return null;
  const raw = Number(match[1]?.replace(/,/g, ""));
  if (!Number.isFinite(raw)) return null;
  const suffix = (match[2] ?? "").toLowerCase();
  const amount = suffix === "k"
    ? raw * 1000
    : suffix === "l" || suffix === "lac" || suffix === "lakh"
      ? raw * 100000
      : raw;
  return amount > 0 ? amount : null;
}

function detectBudgetIntent(text: string) {
  if (/\bmanageable budget\b|\bbudget[-\s]?friendly\b|\bvalue\b|\baffordable\b|\blower price\b/.test(text)) {
    return "value" as const;
  }
  if (/\bpremium\b|\bluxury\b|\bfive star\b|\b5 star\b|\bupgraded\b|\bstronger stay\b/.test(text)) {
    return "premium" as const;
  }
  if (/\bmid-range\b|\bcomfort\b|\bbalanced budget\b|\bmanageable\b/.test(text)) {
    return "balanced" as const;
  }
  return null;
}

function detectTravelMonth(brief: BuildTripBrief, corpus: string) {
  if (brief.tentative_month_or_dates.trim()) return brief.tentative_month_or_dates.trim();
  return MONTH_PATTERNS.find((entry) => entry.pattern.test(corpus))?.label ?? null;
}

function detectDepartureCity(brief: BuildTripBrief, corpus: string) {
  if (brief.departure_city.trim()) return brief.departure_city.trim();
  return DEPARTURE_CITY_PATTERNS.find((entry) => entry.pattern.test(corpus))?.city ?? null;
}

function detectDomesticInternational(brief: BuildTripBrief, destinations: BuildTripDestinationSignal[]) {
  if (brief.domestic_or_international === "domestic" || brief.domestic_or_international === "international") {
    return brief.domestic_or_international;
  }

  const domesticDestinations = new Set(["Goa", "Kashmir"]);
  const internationalDestinations = new Set([
    "Bali",
    "Phuket",
    "Krabi",
    "Turkey",
    "Vietnam",
    "Santorini",
    "Greece",
    "Dubai",
    "Maldives",
    "Sri Lanka",
    "Thailand",
    "Japan",
    "Europe",
  ]);

  const topDestination = destinations[0]?.destination;
  if (!topDestination) return null;
  if (domesticDestinations.has(topDestination)) return "domestic";
  if (internationalDestinations.has(topDestination)) return "international";
  return null;
}

function detectHotelNames(inputs: TravelerInspirationInput[], corpus: string) {
  const inputHotelNames = inputs
    .filter((item) => item.type === "hotel")
    .map((item) => item.value.trim())
    .filter((value) => value.length >= 4);

  const corpusMatches = Array.from(
    corpus.matchAll(/\b([a-z][a-z0-9&.'-]+(?:\s+[a-z][a-z0-9&.'-]+){0,4}\s+(?:resort|hotel|villa|retreat|palace))\b/gi),
  ).map((match) => titleCase(match[1] ?? ""));

  return uniq([...inputHotelNames, ...corpusMatches]).slice(0, 4);
}

function destinationSignalStrength(signals: BuildTripDestinationSignal[]) {
  if (signals.length === 0) return "none" as const;
  if (signals.length === 1) {
    return signals[0].confidence === "high" ? "single_strong" as const : "single_soft" as const;
  }
  const topTwo = signals.slice(0, 2);
  if (topTwo[0]?.confidence === "high" && topTwo[1]?.confidence !== "high") {
    return "single_strong" as const;
  }
  return "multiple_competing" as const;
}

function estimateBudgetBand(brief: BuildTripBrief, inspirationInputs: TravelerInspirationInput[]) {
  if (brief.approximate_budget_band && BUDGET_BANDS[brief.approximate_budget_band]) {
    return {
      ...BUDGET_BANDS[brief.approximate_budget_band],
      key: brief.approximate_budget_band,
    };
  }

  const textAmount = detectBudgetFromText(corpusFrom(brief, inspirationInputs));
  if (textAmount == null) return null;
  if (textAmount < 50000) return { ...BUDGET_BANDS.under_50k, key: "under_50k" };
  if (textAmount < 100000) return { ...BUDGET_BANDS["50k_1l"], key: "50k_1l" };
  if (textAmount < 200000) return { ...BUDGET_BANDS["1l_2l"], key: "1l_2l" };
  if (textAmount < 500000) return { ...BUDGET_BANDS["2l_5l"], key: "2l_5l" };
  return { ...BUDGET_BANDS.above_5l, key: "above_5l" };
}

function monthlyLabel(amount: number | null) {
  if (amount == null || amount <= 0) return null;
  const monthly = Math.round(amount / 6);
  return `roughly ₹${monthly.toLocaleString("en-IN")} per month on a short-tenure EMI`;
}

function classifyInspirationValue(value: string): TravelerInspirationInput {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      type: "link",
      value: trimmed,
      label: /instagram\.com/.test(lower)
        ? "Instagram idea"
        : /youtube\.com|youtu\.be/.test(lower)
          ? "YouTube idea"
          : /facebook\.com|fb\.watch/.test(lower)
            ? "Facebook idea"
            : /klook\.com/.test(lower)
              ? "Klook idea"
              : "Travel link",
    };
  }
  if (/\bfriend\b|\bsuggested\b|\brecommended\b/.test(lower)) {
    return { type: "friend_tip", value: trimmed, label: "Friend recommendation" };
  }
  if (/\bhotel\b|\bresort\b|\bvilla\b|\bproperty\b/.test(lower)) {
    return { type: "hotel", value: trimmed, label: "Stay idea" };
  }
  if (trimmed.split(/\s+/).length <= 4 && /^[a-zA-Z][a-zA-Z\s&-]+$/.test(trimmed)) {
    return { type: "place", value: trimmed, label: "Place idea" };
  }
  return { type: "text", value: trimmed };
}

export function buildInspirationInputsFromText(text: string) {
  return uniq(
    text
      .split(/\n+/)
      .flatMap((line) => {
        const trimmed = line.trim();
        if (!trimmed) return [];
        if (/^https?:\/\//i.test(trimmed)) return [trimmed];
        return trimmed.split(",").map((part) => part.trim());
      }),
  ).map((entry) => classifyInspirationValue(entry));
}

function normalizeInspirationInputs(inputs: TravelerInspirationInput[]) {
  const map = new Map<string, TravelerInspirationInput>();
  for (const item of inputs) {
    const value = item.value.trim();
    if (!value) continue;
    const key = `${item.type}:${value.toLowerCase()}`;
    map.set(key, {
      ...item,
      value,
      label: item.label?.trim() || undefined,
    });
  }
  return Array.from(map.values()).slice(0, 12);
}

function sourceTraceLabel(item: TravelerInspirationInput) {
  if (item.type === "link") return item.label ?? "Travel link";
  if (item.type === "friend_tip") return "Friend recommendation";
  if (item.type === "hotel") return "Stay idea";
  if (item.type === "place") return "Place idea";
  if (item.type === "screenshot") return "Screenshot";
  return item.label ?? "Travel note";
}

function describeTravelerMix(travelerMix: string | null) {
  if (travelerMix === "couple") return "Couple or honeymoon-style trip";
  if (travelerMix === "family") return "Family-friendly holiday";
  if (travelerMix === "friends") return "Friends or group trip";
  if (travelerMix === "solo") return "Solo trip";
  return null;
}

function describeVibe(vibes: string[]) {
  if (vibes.length === 0) return null;
  return vibes.slice(0, 3).map((value) => humanize(value)).join(" + ");
}

function describeFocus(signals: BuildTripSignalExtraction) {
  if (
    signals.stay_style_signals.includes("resort_led")
    || signals.stay_style_signals.includes("beach_property")
    || signals.stay_style_signals.includes("villa")
    || signals.stay_style_signals.includes("premium")
  ) {
    return "More resort-led and comfort-led than activity-packed";
  }

  if (signals.activity_signals.includes("thrill_activities") || signals.activity_signals.includes("water_activities")) {
    return "Adventure cues are showing up strongly";
  }

  if (signals.activity_signals.length >= 2) {
    return "More experience-led than hotel-led";
  }

  if (signals.vibe_signals.includes("family")) {
    return "Comfort and trip smoothness may matter more than squeezing in everything";
  }

  return null;
}

function detectDestinations(brief: BuildTripBrief, inspirationInputs: TravelerInspirationInput[]) {
  const explicit = uniq([
    brief.destination_in_mind,
    ...brief.shortlisted_destinations,
    ...inspirationInputs.filter((item) => item.type === "place").map((item) => item.value),
  ]);
  const text = corpusFrom(brief, inspirationInputs);

  const scored = DESTINATION_KEYWORDS.map((entry) => {
    const explicitMatch = explicit.some((value) => value.toLowerCase() === entry.destination.toLowerCase());
    const patternMatches = entry.patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
    const placeMentions = inspirationInputs.filter((item) =>
      item.type === "place" && item.value.toLowerCase().includes(entry.destination.toLowerCase()),
    ).length;
    const score = (explicitMatch ? 6 : 0) + patternMatches + placeMentions;
    return {
      destination: entry.destination,
      score,
      explicitMatch,
    };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((entry, index) => ({
    destination: entry.destination,
    confidence: entry.explicitMatch || entry.score >= 4
      ? "high"
      : index === 0 && entry.score >= 2
        ? "medium"
        : "low",
    reason: entry.explicitMatch
      ? "You explicitly shared this destination."
      : entry.score >= 3
        ? "This destination keeps showing up across the inspiration you shared."
        : "There is an early destination hint in the inspiration you shared.",
  })) as BuildTripDestinationSignal[];
}

function collectKeywordSignals(corpus: string, dictionary: Record<string, RegExp[]>) {
  return Object.entries(dictionary)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(corpus)))
    .map(([key]) => key);
}

function detectDuration(brief: BuildTripBrief, corpus: string) {
  if (brief.trip_duration.trim()) return brief.trip_duration.trim();
  const match = corpus.match(/(\d+)\s*(?:n|night|nights|d|day|days)/i);
  if (match) return `${match[1]} ${/n/i.test(match[0] ?? "") ? "nights" : "days"}`;
  if (/\blong weekend\b/.test(corpus)) return "long weekend";
  return null;
}

function detectTravelerMix(brief: BuildTripBrief, corpus: string) {
  if (brief.traveler_mix) return brief.traveler_mix;
  if (/\bcouple\b|\bhoneymoon\b|\bromantic\b|\banniversary\b|\bwife\b|\bhusband\b/.test(corpus)) return "couple";
  if (/\bfamily\b|\bparents\b|\bkids\b|\bchildren\b|\btoddler\b|\bbaby\b/.test(corpus)) return "family";
  if (/\bfriends\b|\bgroup\b|\bbachelor\b|\bgirls trip\b|\bboys trip\b/.test(corpus)) return "friends";
  if (/\bsolo\b/.test(corpus)) return "solo";
  return null;
}

function buildMissingAnchors(params: {
  brief: BuildTripBrief;
  budgetBand: ReturnType<typeof estimateBudgetBand>;
  budgetIntent: BuildTripSignalExtraction["budget_intent_signal"];
  destinationShortlist: string[];
  signals: {
    vibe_signals: string[];
    stay_style_signals?: string[];
    traveler_mix_signal: string | null;
    duration_signal: string | null;
    destination_signal_strength: BuildTripSignalExtraction["destination_signal_strength"];
    travel_month_signal: string | null;
    departure_city_signal: string | null;
    hotel_priority_signal: boolean;
  };
}) {
  const { brief, budgetBand, budgetIntent, destinationShortlist, signals } = params;
  const missing = new Map<string, number>();

  const addMissing = (key: string, score: number) => {
    missing.set(key, Math.max(score, missing.get(key) ?? 0));
  };

  if (destinationShortlist.length === 0 && !brief.holiday_style) {
    addMissing("destination_or_trip_style", brief.start_mode === "destination_discovery" ? 100 : 96);
  } else if (
    signals.destination_signal_strength === "multiple_competing"
    && (!brief.destination_in_mind.trim() || !destinationShortlist[0]?.trim().toLowerCase().includes(brief.destination_in_mind.trim().toLowerCase()))
  ) {
    addMissing("destination_choice", 92);
  } else if (
    brief.start_mode === "inspiration_dump"
    && signals.destination_signal_strength === "single_strong"
    && !brief.destination_in_mind.trim()
  ) {
    addMissing("destination_confirmation", 88);
  }

  if (!signals.travel_month_signal) addMissing("travel_month", destinationShortlist.length > 0 ? 90 : 70);

  if (!signals.traveler_mix_signal && !brief.traveler_mix) {
    addMissing("traveler_mix", signals.hotel_priority_signal ? 84 : 76);
  } else if (!brief.traveler_mix && signals.traveler_mix_signal) {
    addMissing("traveler_mix_validation", 82);
  }

  if (!budgetBand && !budgetIntent) {
    addMissing("budget_range", signals.hotel_priority_signal || signals.vibe_signals.includes("luxury") ? 86 : 68);
  }

  if (!signals.departure_city_signal && (destinationShortlist.length > 0 || brief.domestic_or_international === "international")) {
    addMissing("departure_city", destinationShortlist.length > 0 ? 74 : 58);
  }

  if (!signals.duration_signal && destinationShortlist.length > 0 && signals.travel_month_signal) {
    addMissing("trip_length", 52);
  }

  if (
    signals.vibe_signals.length === 0
    && brief.start_mode === "inspiration_dump"
    && destinationShortlist.length === 0
  ) {
    addMissing("trip_vibe", 82);
  }

  return Array.from(missing.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

function assessInputStrength(params: {
  brief: BuildTripBrief;
  budgetBand: ReturnType<typeof estimateBudgetBand>;
  budgetIntent: BuildTripSignalExtraction["budget_intent_signal"];
  destinationShortlist: string[];
  inspirationInputs: TravelerInspirationInput[];
  signals: {
    vibe_signals: string[];
    stay_style_signals: string[];
    traveler_mix_signal: string | null;
    duration_signal: string | null;
    destination_signal_strength: BuildTripSignalExtraction["destination_signal_strength"];
    travel_month_signal: string | null;
    departure_city_signal: string | null;
  };
}) {
  const { brief, budgetBand, budgetIntent, destinationShortlist, inspirationInputs, signals } = params;
  let score = 0;

  if (signals.destination_signal_strength === "single_strong") score += 3;
  else if (destinationShortlist.length > 0) score += 2;
  if (brief.holiday_style || signals.vibe_signals.length > 0) score += 1;
  if (signals.vibe_signals.length >= 2 || signals.stay_style_signals.length > 0) score += 1;
  if (budgetBand || budgetIntent) score += 1;
  if (signals.travel_month_signal) score += 1;
  if (signals.departure_city_signal) score += 1;
  if (signals.traveler_mix_signal || brief.traveler_mix) score += 1;
  if (signals.duration_signal || brief.trip_duration.trim()) score += 1;
  if (brief.priorities.length > 0) score += 1;
  if (inspirationInputs.length >= 2) score += 1;

  if (
    (signals.destination_signal_strength === "single_strong" || destinationShortlist.length > 0) &&
    (budgetBand || budgetIntent) &&
    signals.travel_month_signal &&
    (signals.traveler_mix_signal || brief.traveler_mix)
  ) {
    return "strong" as const;
  }

  if (score >= 6) return "strong" as const;
  if (score >= 3) return "medium" as const;
  return "weak" as const;
}

function deriveAspirationLevel(vibes: string[], stayStyles: string[], priorities: string[]) {
  const luxuryLean = vibes.includes("luxury") || vibes.includes("celebration") || priorities.includes("luxury") || priorities.includes("better_hotel");
  const premiumStay = stayStyles.includes("premium") || stayStyles.includes("resort_led") || stayStyles.includes("villa");
  if (luxuryLean && premiumStay) return "premium_aspirational" as const;
  if (luxuryLean || premiumStay) return "aspirational" as const;
  if (priorities.includes("better_experience") || vibes.includes("romantic") || vibes.includes("adventure")) return "balanced" as const;
  return "grounded" as const;
}

function deriveRealismAssessment(
  aspirationLevel: BuildTripSignalExtraction["aspiration_level"],
  budgetBand: ReturnType<typeof estimateBudgetBand>,
  priorities: string[],
) {
  if (!budgetBand) return "unknown" as const;
  if (aspirationLevel === "premium_aspirational" && budgetBand.max <= 100000) return "aspirational_mismatch" as const;
  if ((aspirationLevel === "premium_aspirational" || priorities.includes("luxury")) && budgetBand.max <= 200000) return "slightly_above_budget" as const;
  if (aspirationLevel === "aspirational" && budgetBand.max < 100000) return "slightly_above_budget" as const;
  return "aligned" as const;
}

function deriveDestinationFlexibility(
  brief: BuildTripBrief,
  preferences: TravelerPreferences,
  destinations: BuildTripDestinationSignal[],
) {
  if (preferences.destination_flexibility === "fixed") return "fixed" as const;
  if (preferences.destination_flexibility === "open_to_similar") return "open_to_similar" as const;
  if (brief.start_mode === "destination_discovery") return "exploring" as const;
  if (brief.start_mode === "inspiration_dump" && destinations.length > 1) return "exploring" as const;
  if (brief.entry_mode === "shortlisting_a_few_places" || destinations.length > 1) return "open_to_similar" as const;
  return "fixed" as const;
}

function buildInspirationRead(inputs: TravelerInspirationInput[], brief: BuildTripBrief, destinations: BuildTripDestinationSignal[]) {
  if (brief.start_mode === "inspiration_dump" && inputs.length > 0) {
    return destinations.length > 1
      ? "This looks like saved inspiration with a few competing trip directions, not random travel clutter."
      : "This looks like inspiration-led planning with one trip direction starting to emerge from what you shared.";
  }
  if (brief.start_mode === "destination_discovery") {
    return "This looks like destination discovery, so the job is to narrow intelligently before pricing anything.";
  }
  return "This looks closer to shaping one trip than open-ended browsing.";
}

export function buildTripSignals(params: {
  brief: BuildTripBrief;
  preferences?: TravelerPreferences;
  inspirationInputs?: TravelerInspirationInput[];
}) {
  const { brief } = params;
  const preferences = params.preferences ?? {};
  const normalizedInputs = normalizeInspirationInputs(params.inspirationInputs ?? buildInspirationInputsFromText(brief.inspiration_dump_text));
  const text = corpusFrom(brief, normalizedInputs);
  const likelyDestinations = detectDestinations(brief, normalizedInputs);
  const destinationStrength = destinationSignalStrength(likelyDestinations);
  const vibeSignals = uniq([
    ...collectKeywordSignals(text, VIBE_KEYWORDS),
    ...brief.priorities.filter((value) => ["luxury", "family_time", "relaxation", "adventure", "sightseeing", "food"].includes(value)),
    ...(brief.holiday_style ? [brief.holiday_style] : []),
    ...likelyDestinations.flatMap((signal) => DESTINATION_KEYWORDS.find((entry) => entry.destination === signal.destination)?.tags ?? []),
  ]);
  const activitySignals = uniq([
    ...collectKeywordSignals(text, ACTIVITY_KEYWORDS),
    ...brief.priorities.filter((value) => ["adventure", "sightseeing", "family_time", "relaxation"].includes(value)),
  ]);
  const stayStyleSignals = uniq([
    ...collectKeywordSignals(text, STAY_STYLE_KEYWORDS),
    ...brief.priorities.filter((value) => ["better_hotel", "luxury", "comfort"].includes(value)).map((value) => value === "better_hotel" ? "premium" : value),
  ]);
  const budgetBand = estimateBudgetBand(brief, normalizedInputs);
  const budgetIntent = detectBudgetIntent(text);
  const travelerMix = detectTravelerMix(brief, text);
  const travelMonth = detectTravelMonth(brief, text);
  const departureCity = detectDepartureCity(brief, text);
  const domesticOrInternational = detectDomesticInternational(brief, likelyDestinations);
  const inferredHotelNames = detectHotelNames(normalizedInputs, text);
  const hotelPrioritySignal = Boolean(
    inferredHotelNames.length > 0
      || stayStyleSignals.some((value) => ["premium", "resort_led", "villa", "beach_property"].includes(value))
      || /\bhotel\b|\bresort\b|\bvilla\b|\bstay\b|\bsunset resort\b/.test(text)
      || brief.priorities.includes("better_hotel")
      || brief.priorities.includes("comfort"),
  );
  const emiAffordabilitySignal = Boolean(
    /\bemi\b|\bmonthly\b|\bpay later\b|\binstallment\b|\bmanageable budget\b/.test(text)
      || brief.priorities.includes("easy_payment"),
  );
  const aspirationLevel = deriveAspirationLevel(vibeSignals, stayStyleSignals, brief.priorities);
  const realismAssessment = deriveRealismAssessment(aspirationLevel, budgetBand, brief.priorities);
  const destinationFlexibility = deriveDestinationFlexibility(brief, preferences, likelyDestinations);
  const destinationShortlist = likelyDestinations.map((item) => item.destination).slice(0, 4);
  const durationSignal = detectDuration(brief, text);
  const missingAnchors = buildMissingAnchors({
    brief,
    budgetBand,
    budgetIntent,
    destinationShortlist,
    signals: {
      vibe_signals: vibeSignals,
      traveler_mix_signal: travelerMix,
      duration_signal: durationSignal,
      destination_signal_strength: destinationStrength,
      travel_month_signal: travelMonth,
      departure_city_signal: departureCity,
      hotel_priority_signal: hotelPrioritySignal,
    },
  });
  const inputStrength = assessInputStrength({
    brief,
    budgetBand,
    budgetIntent,
    destinationShortlist,
    inspirationInputs: normalizedInputs,
    signals: {
      vibe_signals: vibeSignals,
      stay_style_signals: stayStyleSignals,
      traveler_mix_signal: travelerMix,
      duration_signal: durationSignal,
      destination_signal_strength: destinationStrength,
      travel_month_signal: travelMonth,
      departure_city_signal: departureCity,
    },
  });

  return {
    likely_destinations: likelyDestinations,
    likely_trip_type: brief.trip_type
      || travelerMix
      || (vibeSignals.includes("family") ? "family_holiday" : null)
      || (vibeSignals.includes("romantic") ? "romantic_couple" : null),
    vibe_signals: vibeSignals.slice(0, 6),
    activity_signals: activitySignals.slice(0, 5),
    stay_style_signals: stayStyleSignals.slice(0, 5),
    budget_signal: budgetBand?.label ?? (budgetIntent === "value" ? "value-leaning" : budgetIntent === "premium" ? "premium-leaning" : budgetIntent === "balanced" ? "balanced budget" : null),
    budget_intent_signal: budgetIntent,
    duration_signal: durationSignal,
    travel_month_signal: travelMonth,
    traveler_mix_signal: travelerMix,
    departure_city_signal: departureCity,
    domestic_or_international_signal: domesticOrInternational,
    hotel_priority_signal: hotelPrioritySignal,
    emi_affordability_signal: emiAffordabilitySignal,
    inferred_hotel_names: inferredHotelNames,
    destination_signal_strength: destinationStrength,
    aspiration_level: aspirationLevel,
    realism_assessment: realismAssessment,
    destination_flexibility: destinationFlexibility,
    inspiration_read: buildInspirationRead(normalizedInputs, brief, likelyDestinations),
    input_strength: inputStrength,
    missing_anchors: missingAnchors,
  } satisfies BuildTripSignalExtraction;
}

export function buildClarifyingQuestions(params: {
  brief: BuildTripBrief;
  preferences?: TravelerPreferences;
  inspirationInputs?: TravelerInspirationInput[];
  signals?: BuildTripSignalExtraction;
}) {
  const { brief } = params;
  const preferences = params.preferences ?? {};
  const signals = params.signals ?? buildTripSignals(params);
  type BuildTripQuestionCandidate = BuildTripClarifyingQuestion & { priority: number };

  const candidates: BuildTripQuestionCandidate[] = [];
  const leadDestination = signals.likely_destinations[0]?.destination ?? null;
  const travelerMixRead = describeTravelerMix(signals.traveler_mix_signal);
  const explicitDestination = brief.destination_in_mind.trim().length > 0;

  const addCandidate = (candidate: BuildTripQuestionCandidate | null) => {
    if (!candidate) return;
    candidates.push(candidate);
  };

  if (
    signals.missing_anchors.includes("destination_confirmation")
    && leadDestination
    && !explicitDestination
    && !preferences.destination_flexibility
  ) {
    addCandidate({
      priority: 96,
      code: "destination_validation",
      question: `This looks more like a ${leadDestination} trip than a generic shortlist. Is that the destination you have in mind?`,
      why: "Confirming the destination lets the engine stop treating this as open discovery and start shaping the trip properly.",
      target: "preferences",
      field: "destination_flexibility",
      options: [
        { value: "fixed", label: `Yes, keep ${leadDestination}` },
        { value: "open_to_similar", label: "Open to similar places" },
        { value: "exploring", label: "Still exploring" },
      ],
    });
  }

  if (
    (signals.missing_anchors.includes("destination_choice") || brief.start_mode === "destination_discovery")
    && signals.likely_destinations.length >= 2
    && !preferences.destination_flexibility
  ) {
    const first = signals.likely_destinations[0]?.destination;
    const second = signals.likely_destinations[1]?.destination;

    addCandidate({
      priority: 94,
      code: "destination_choice",
      question: first && second
        ? `We can see both ${first} and ${second} type cues here. Which direction feels closer to what you want?`
        : "Are you fixed on one place, or open to similar destinations?",
      why: "One destination decision will narrow the trip faster than asking you a full form.",
      target: "preferences",
      field: "destination_flexibility",
      options: [
        ...(first ? [{ value: "fixed", label: `Lean into ${first}` }] : []),
        { value: "open_to_similar", label: "Keep a shortlist alive" },
        { value: "exploring", label: "Still exploring" },
      ],
    });
  }

  if (
    signals.missing_anchors.includes("traveler_mix_validation")
    && !brief.traveler_mix
    && signals.traveler_mix_signal
    && travelerMixRead
  ) {
    addCandidate({
      priority: 91,
      code: "traveler_mix_validation",
      question: `This is reading more like a ${humanize(signals.traveler_mix_signal)} trip. Is that right?`,
      why: "Traveler mix changes hotel fit, pacing, and what a realistic version should look like.",
      target: "brief",
      field: "traveler_mix",
      options: [
        { value: signals.traveler_mix_signal, label: `Yes, ${travelerMixRead}` },
        { value: "couple", label: "Couple" },
        { value: "family", label: "Family" },
        { value: "friends", label: "Friends" },
        { value: "solo", label: "Solo" },
      ].filter((option, index, list) => list.findIndex((item) => item.value === option.value) === index),
    });
  } else if (signals.missing_anchors.includes("traveler_mix")) {
    addCandidate({
      priority: 82,
      code: "traveler_mix",
      question: leadDestination
        ? `Is this ${leadDestination} idea for a couple, family, friends, or a solo trip?`
        : "Is this for a couple, family, friends, or a solo trip?",
      why: "That one detail changes hotel fit, pace, and what we should optimize first.",
      target: "brief",
      field: "traveler_mix",
      options: [
        { value: "couple", label: "Couple" },
        { value: "family", label: "Family" },
        { value: "friends", label: "Friends" },
        { value: "solo", label: "Solo" },
      ],
    });
  }

  if (
    signals.missing_anchors.includes("trip_vibe")
    || (signals.missing_anchors.includes("destination_or_trip_style") && signals.vibe_signals.length === 0)
  ) {
    addCandidate({
      priority: 89,
      code: "holiday_style",
      question: "What kind of trip is this starting to look like to you?",
      why: "One trip-style anchor is enough to turn scattered inspiration into a smarter shortlist.",
      target: "brief",
      field: "holiday_style",
      options: [
        { value: "beach", label: "Beach break" },
        { value: "mountains", label: "Mountains" },
        { value: "romantic_couple", label: "Couple trip" },
        { value: "family_holiday", label: "Family holiday" },
        { value: "city_break", label: "City break" },
      ],
    });
  }

  if (signals.missing_anchors.includes("travel_month")) {
    addCandidate({
      priority: leadDestination ? 90 : 72,
      code: "travel_month",
      question: leadDestination
        ? `When are you roughly hoping to do this ${leadDestination} trip?`
        : "When are you roughly hoping to travel?",
      why: "Timing is often the one anchor that turns a good trip direction into a realistic shortlist.",
      target: "brief",
      field: "tentative_month_or_dates",
      options: [
        { value: "Next 1-2 months", label: "Next 1-2 months" },
        { value: "Next 3-6 months", label: "Next 3-6 months" },
        { value: "Festive season", label: "Festive season" },
        { value: "Still flexible", label: "Still flexible" },
      ],
    });
  }

  if (signals.missing_anchors.includes("budget_range")) {
    addCandidate({
      priority: signals.hotel_priority_signal || signals.emi_affordability_signal ? 86 : 68,
      code: "budget_range",
      question: signals.hotel_priority_signal
        ? "Would you like us to shape this around a stronger stay, a balanced budget, or easier monthly payment?"
        : "Should we shape this for value, mid-range comfort, or a stronger stay?",
      why: "The budget anchor tells us whether to lead with a realistic version, a better stay, or a pay-smarter option.",
      target: "brief",
      field: "approximate_budget_band",
      options: [
        { value: "50k_1l", label: "Value-first" },
        { value: "1l_2l", label: "Balanced comfort" },
        { value: "2l_5l", label: "Stronger stay" },
      ],
    });
  }

  if (
    !preferences.trip_focus
    && (
      (signals.stay_style_signals.length > 0 && signals.activity_signals.length > 0)
      || signals.activity_signals.includes("thrill_activities")
    )
  ) {
    addCandidate({
      priority: signals.activity_signals.includes("thrill_activities") ? 84 : 74,
      code: "trip_focus_validation",
      question: signals.activity_signals.includes("thrill_activities")
        ? "We can see adventure cues here. Do you want to keep that, or should we optimise more for comfort?"
        : "This looks like both stay-comfort and experience cues are showing up. Which should lead the trip?",
      why: "That choice changes whether we shape the next version around the stay, the experiences, or a balanced mix.",
      target: "preferences",
      field: "trip_focus",
      options: [
        { value: "stay_experience", label: "Lean into the stay" },
        { value: "activities", label: "Keep the experiences leading" },
        { value: "balanced", label: "Keep it balanced" },
      ],
    });
  }

  if (
    !brief.domestic_or_international
    && brief.start_mode === "destination_discovery"
    && signals.likely_destinations.length === 0
    && !leadDestination
  ) {
    addCandidate({
      priority: 78,
      code: "domestic_or_international",
      question: "Should we keep this domestic, or are you open to international options too?",
      why: "That one choice cuts the shortlist much faster than asking broad travel questions.",
      target: "brief",
      field: "domestic_or_international",
      options: [
        { value: "domestic", label: "Keep it domestic" },
        { value: "international", label: "Open to international" },
        { value: "either", label: "Either is fine" },
      ],
    });
  }

  if (signals.missing_anchors.includes("departure_city")) {
    addCandidate({
      priority: 74,
      code: "departure_city",
      question: leadDestination
        ? `Which city would you likely start from for ${leadDestination}?`
        : "Which city would you likely start from?",
      why: "Starting city affects routing, value, and whether a trip is easy to shape or awkward to price.",
      target: "brief",
      field: "departure_city",
      options: DEPARTURE_CITY_PATTERNS.slice(0, 5).map((entry) => ({
        value: entry.city,
        label: entry.city,
      })),
    });
  }

  if (
    signals.missing_anchors.includes("trip_length")
    && !brief.trip_duration
    && signals.travel_month_signal
  ) {
    addCandidate({
      priority: 54,
      code: "trip_length",
      question: "Are you thinking of a short escape, a 5 to 6 day trip, or something longer?",
      why: "Trip length changes whether we should keep this destination tight or add more movement.",
      target: "brief",
      field: "trip_duration",
      options: [
        { value: "3 nights", label: "Short escape" },
        { value: "5 nights", label: "5 to 6 days" },
        { value: "7 nights", label: "A week or more" },
      ],
    });
  }

  if (
    !preferences.budget_calibration
    && signals.realism_assessment !== "aligned"
    && signals.budget_signal
  ) {
    addCandidate({
      priority: 58,
      code: "budget_calibration",
      question: "Should we keep this close to the current budget, or stretch a bit for a meaningfully better version?",
      why: "That tells us whether to lead with the realistic version, the stronger version, or both.",
      target: "preferences",
      field: "budget_calibration",
      options: [
        { value: "aim_lower", label: "Stay lower" },
        { value: "current_range_ok", label: "Current range is fine" },
        { value: "stretch_for_better_trip", label: "Stretch a bit if worth it" },
      ],
    });
  }

  if (
    !preferences.improvement_goal
    && (
      signals.hotel_priority_signal
      || signals.emi_affordability_signal
      || signals.stay_style_signals.includes("premium")
      || signals.vibe_signals.includes("romantic")
    )
  ) {
    addCandidate({
      priority: 56,
      code: "improvement_goal",
      question: signals.hotel_priority_signal
        ? "Would you rather improve the stay, keep the budget tighter, or make payment easier?"
        : "What would you most like us to improve first?",
      why: "One clear goal helps the engine avoid showing you three competing versions at once.",
      target: "preferences",
      field: "improvement_goal",
      options: [
        { value: "lower_price", label: "Lower price" },
        { value: "better_hotel", label: "Better stay" },
        { value: "easier_payment", label: "Easier payment" },
        { value: "more_activities", label: "Better experiences" },
      ],
    });
  }

  const limit = signals.input_strength === "strong" ? 2 : 1;

  return candidates
    .sort((a, b) => b.priority - a.priority)
    .filter((question, index, list) => list.findIndex((item) => item.code === question.code) === index)
    .slice(0, limit)
    .map(({ priority: _priority, ...question }) => question);
}

function buildTravelerContext(brief: BuildTripBrief, preferences: TravelerPreferences, signals: BuildTripSignalExtraction): TravelerPreferences {
  const topPriority = brief.priorities[0] ?? "";
  const improvementGoal = preferences.improvement_goal
    ?? (brief.priorities.includes("easy_payment")
      || signals.emi_affordability_signal
      ? "easier_payment"
      : brief.priorities.includes("better_hotel") || signals.stay_style_signals.includes("premium")
        ? "better_hotel"
        : brief.priorities.includes("better_experience")
          ? "more_activities"
          : "smoother_plan");

  return {
    trip_priority: preferences.trip_priority ?? (topPriority || signals.vibe_signals[0] || undefined),
    trip_type: preferences.trip_type ?? (brief.trip_type || brief.traveler_mix || signals.traveler_mix_signal || undefined),
    improvement_goal: improvementGoal,
    quote_status: preferences.quote_status ?? (
      brief.start_mode === "known_destination" ? "just_exploring" : "one_of_a_few_quotes"
    ),
    date_flexibility: preferences.date_flexibility ?? (!brief.tentative_month_or_dates ? undefined : "a_bit_flexible"),
    destination_flexibility: preferences.destination_flexibility ?? signals.destination_flexibility,
    trip_focus: preferences.trip_focus ?? undefined,
    budget_calibration: preferences.budget_calibration ?? undefined,
  };
}

function buildDestinationShortlist(brief: BuildTripBrief, signals: BuildTripSignalExtraction) {
  if (signals.likely_destinations.length > 0) {
    return signals.likely_destinations.map((item) => item.destination).slice(0, 4);
  }
  const styleShortlist = STYLE_SHORTLISTS[brief.holiday_style] ?? [];
  return styleShortlist.slice(0, 4);
}

function buildTripStructureSummary(signals: BuildTripSignalExtraction, preferences: TravelerPreferences) {
  if (signals.input_strength === "weak") {
    if (signals.vibe_signals.includes("romantic") || signals.vibe_signals.includes("beach")) {
      return "This is already reading more like a stay-and-feel trip than a packed checklist. One destination choice and one timing clue should tighten it quickly.";
    }
    return "This is still at trip-shaping stage, but the overall direction is starting to form. One or two practical details should turn it into a cleaner shortlist.";
  }
  if (preferences.trip_focus === "stay_experience" || signals.stay_style_signals.includes("resort_led") || signals.stay_style_signals.includes("villa")) {
    return "This looks more stay-led than checklist-led. One strong property plus two or three signature experiences may work better than packing every day.";
  }
  if (preferences.trip_focus === "activities" || signals.activity_signals.length >= 2) {
    return "This looks more experience-led than hotel-led. A clean route with better-timed activities may matter more than a premium stay in every stop.";
  }
  return "This looks like a balanced trip where stay quality, pacing, and one or two memorable experiences need to work together.";
}

function formatMoney(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function buildVersionOutputs(
  budgetBand: ReturnType<typeof estimateBudgetBand>,
  signals: BuildTripSignalExtraction,
  travelerContext: TravelerPreferences,
) {
  if (!budgetBand) {
    return {
      realistic: null,
      upgraded: null,
      rebalance: null,
      realisticAmount: null as number | null,
      upgradedAmount: null as number | null,
    };
  }

  const realisticAmount = Math.round((budgetBand.min + budgetBand.max) / 2);
  const upgradeMultiplier = signals.aspiration_level === "premium_aspirational" ? 1.28 : 1.18;
  const upgradedAmount = Math.round(realisticAmount * upgradeMultiplier);
  const rebalanceAmount = Math.round(realisticAmount * 0.98);

  const realistic: BuildTripVersionOutput = {
    title: "Realistic version",
    price_summary: `${formatMoney(realisticAmount)} total trip zone`,
    monthly_summary: monthlyLabel(realisticAmount),
    summary: signals.realism_assessment === "aspirational_mismatch"
      ? "This keeps the same overall vibe in a more manageable range."
      : "This is the cleaner version that best fits the current direction and budget.",
  };

  const upgraded: BuildTripVersionOutput = {
    title: "Upgraded version",
    price_summary: `${formatMoney(upgradedAmount)} total trip zone`,
    monthly_summary: monthlyLabel(upgradedAmount),
    summary: signals.stay_style_signals.includes("premium") || travelerContext.trip_focus === "stay_experience"
      ? "This leans harder into the stay and overall feel of the trip."
      : "This uses a moderate budget step-up to improve the best part of the trip rather than everything at once.",
  };

  const rebalance: BuildTripVersionOutput = {
    title: "Rebalanced version",
    price_summary: `${formatMoney(rebalanceAmount)} total trip zone`,
    monthly_summary: monthlyLabel(rebalanceAmount),
    summary: "This keeps the overall range similar but shifts more of the value into the part of the trip that seems to matter most.",
  };

  return {
    realistic,
    upgraded,
    rebalance,
    realisticAmount,
    upgradedAmount,
  };
}

function buildBookableRead(params: {
  brief: BuildTripBrief;
  signals: BuildTripSignalExtraction;
  budgetBand: ReturnType<typeof estimateBudgetBand>;
  destinationShortlist: string[];
}) {
  const { brief, signals, budgetBand, destinationShortlist } = params;
  const missingSummary = signals.missing_anchors[0] === "travel_month"
    ? "We need your month of travel before pricing becomes meaningful."
    : signals.missing_anchors[0] === "destination_confirmation"
      ? "We have one destination direction emerging, but confirming it will make pricing more believable."
      : signals.missing_anchors[0] === "destination_choice"
        ? "We need one destination choice before pricing stops looking spread out."
    : signals.missing_anchors[0] === "traveler_mix"
      ? "We need to know whether this is for a couple, family, friends, or solo travel."
      : signals.missing_anchors[0] === "traveler_mix_validation"
        ? "We have a likely traveler mix, but confirming it will make the trip read more trustworthy."
      : signals.missing_anchors[0] === "budget_range"
        ? "We need a rough budget range before we decide between value, better stay, or EMI-first."
        : signals.missing_anchors[0] === "destination_or_trip_style"
          ? "We need one destination or trip-style anchor before this turns into a real shortlist."
          : signals.missing_anchors[0] === "departure_city"
            ? "We need your starting city before routing and price direction get sharper."
            : "We need one more practical detail before this becomes a cleaner trip direction.";
  const hasDestination = destinationShortlist.length > 0;
  const hasSingleStrongDirection = signals.destination_signal_strength === "single_strong" || destinationShortlist.length === 1 || brief.start_mode === "known_destination";
  const hasBudget = Boolean(budgetBand || signals.budget_intent_signal);
  const hasTiming = Boolean(signals.travel_month_signal);
  const hasPassengers = Boolean(Number(brief.budget_for_count) > 0 || signals.traveler_mix_signal);

  if (!hasDestination && !hasBudget) {
    return {
      status: "insufficient_trip_structure" as const,
      summary: signals.input_strength === "medium"
        ? "We already have the shape of the trip, but one practical anchor will make the shortlist much sharper."
        : "We already have a starting direction. One practical detail will make the next version much more useful.",
      pricing_type: "unavailable" as const,
      pricing_confidence: "low" as const,
      price_summary: missingSummary,
      confidence_reason: "The trip is still at idea stage, not pricing stage.",
    };
  }

  if (!hasSingleStrongDirection && destinationShortlist.length >= 2) {
    return {
      status: "multiple_bookable_directions" as const,
      summary: "We found a few directions worth pricing, but one destination choice will make the next step much cleaner.",
      pricing_type: "range" as const,
      pricing_confidence: hasBudget ? "medium" as const : "low" as const,
      price_summary: hasBudget
        ? `These directions can likely be shaped somewhere around ${budgetBand?.label ?? "your range"}, but the final price will depend on which destination wins.`
        : "We can likely turn this into bookable options once one destination direction is chosen.",
      confidence_reason: "Multiple destinations are still alive, so the system can shape directions but not one clean bookable version yet.",
    };
  }

  if (hasDestination && hasBudget && hasPassengers && hasTiming) {
    return {
      status: "pricing_pending" as const,
      summary: "This is structured enough to move toward pricing or supplier matching when provider reads are switched on.",
      pricing_type: "range" as const,
      pricing_confidence: "medium" as const,
      price_summary: `We can likely shape this into a bookable option around ${budgetBand?.label ?? "your current range"}, then tighten the exact version with one supplier read.`,
      confidence_reason: "Destination, budget, travelers, and timing are all visible, but live supplier matching is still shadow-first.",
    };
  }

  if (hasDestination && (hasBudget || hasTiming)) {
    return {
      status: "partial_bookable_match" as const,
      summary: "We already have a usable trip direction. One more detail should turn this into a stronger pricing read.",
      pricing_type: hasBudget ? "estimated" as const : "unavailable" as const,
      pricing_confidence: hasBudget ? "medium" as const : "low" as const,
      price_summary: hasBudget
        ? `This looks shapeable around ${budgetBand?.label ?? "your current budget"}, but the final trip still needs one more anchor.`
        : "We need either a cleaner budget or timing signal before we price this properly.",
      confidence_reason: "The trip direction is emerging, but at least one booking input is still thin.",
    };
  }

  return {
    status: "no_bookable_attempt" as const,
    summary: signals.input_strength === "medium"
      ? "This is already useful as a trip direction, even if it is not ready for pricing yet."
      : "This is still better treated as a trip direction than a priced itinerary.",
    pricing_type: "unavailable" as const,
    pricing_confidence: "low" as const,
    price_summary: missingSummary,
    confidence_reason: "The system should shape the trip first and price it second.",
  };
}

function buildNextClarificationPrompt(
  signals: BuildTripSignalExtraction,
  clarifyingQuestions: BuildTripClarifyingQuestion[],
) {
  if (clarifyingQuestions[0]) return clarifyingQuestions[0].question;

  if (signals.missing_anchors.includes("destination_confirmation")) {
    return "We have one destination direction emerging strongly. Confirm that and the next version gets much sharper.";
  }
  if (signals.missing_anchors.includes("destination_choice")) {
    return "A few destinations are still competing. One quick narrowing choice will sharpen everything else.";
  }
  if (signals.missing_anchors.includes("travel_month")) {
    return "We need your month of travel to tighten the shortlist and price direction.";
  }
  if (signals.missing_anchors.includes("traveler_mix") || signals.missing_anchors.includes("traveler_mix_validation")) {
    return "Are you traveling as a couple, family, friends, or solo?";
  }
  if (signals.missing_anchors.includes("budget_range")) {
    return "Should we optimize this for value, a better hotel, or easier payment?";
  }
  if (signals.missing_anchors.includes("destination_or_trip_style")) {
    return "Is this destination fixed, or are you open to a similar place with the same vibe?";
  }
  if (signals.missing_anchors.includes("departure_city")) {
    return "Tell us where you’ll start from so routing and pricing become more realistic.";
  }
  return null;
}

function buildReadBack(params: {
  brief: BuildTripBrief;
  inspirationInputs: TravelerInspirationInput[];
  signals: BuildTripSignalExtraction;
  destinationShortlist: string[];
}) {
  const { inspirationInputs, signals, destinationShortlist } = params;
  const primaryDestination = signals.likely_destinations[0];
  const travelerMixRead = describeTravelerMix(signals.traveler_mix_signal);
  const vibeRead = describeVibe(signals.vibe_signals);
  const focusRead = describeFocus(signals);

  const items: BuildTripReadBackItem[] = [];

  if (primaryDestination) {
    items.push({
      label: "Likely destination",
      value: primaryDestination.destination,
      confidence: primaryDestination.confidence,
    });
  }

  if (travelerMixRead) {
    items.push({
      label: "Likely trip type",
      value: travelerMixRead,
      confidence: signals.traveler_mix_signal ? "medium" : "low",
    });
  }

  if (vibeRead) {
    items.push({
      label: "Vibe we are picking up",
      value: titleCase(vibeRead),
      confidence: signals.vibe_signals.length >= 2 ? "high" : "medium",
    });
  }

  if (focusRead) {
    items.push({
      label: "What seems to matter most",
      value: focusRead,
      confidence: signals.stay_style_signals.length > 0 || signals.activity_signals.length > 0 ? "medium" : "low",
    });
  }

  if (signals.inferred_hotel_names[0]) {
    items.push({
      label: "Stay clue we picked up",
      value: signals.inferred_hotel_names[0],
      confidence: "medium",
    });
  } else if (signals.hotel_priority_signal) {
    items.push({
      label: "Stay clue we picked up",
      value: "Hotel or stay quality looks important in this trip idea",
      confidence: "medium",
    });
  }

  if (signals.travel_month_signal) {
    items.push({
      label: "Timing clue",
      value: signals.travel_month_signal,
      confidence: "medium",
    });
  }

  const sourceTraces = uniq([
    ...inspirationInputs.slice(0, 5).map((item) => sourceTraceLabel(item)),
    ...destinationShortlist.slice(0, 2),
    ...signals.vibe_signals.slice(0, 2).map((value) => titleCase(humanize(value))),
    ...signals.activity_signals.slice(0, 1).map((value) => titleCase(humanize(value))),
    ...signals.stay_style_signals.slice(0, 1).map((value) => titleCase(humanize(value))),
    ...signals.inferred_hotel_names.slice(0, 1),
  ]).slice(0, 6);

  const summaryParts: string[] = [];

  if (primaryDestination && vibeRead) {
    summaryParts.push(`We think this may be a ${primaryDestination.destination} direction with ${vibeRead} cues.`);
  } else if (primaryDestination) {
    summaryParts.push(`We think ${primaryDestination.destination} may be the strongest destination signal in what you shared.`);
  } else if (vibeRead) {
    summaryParts.push(`We are picking up ${vibeRead} cues from what you shared.`);
  }

  if (travelerMixRead) {
    summaryParts.push(`It also feels more like a ${travelerMixRead.toLowerCase()}.`);
  }

  if (focusRead) {
    summaryParts.push(`${focusRead}.`);
  }

  if (summaryParts.length === 0 && sourceTraces.length > 0) {
    summaryParts.push(`We can already see useful travel cues in what you shared, including ${sourceTraces.slice(0, 3).join(", ")}.`);
  }

  return {
    headline: "Our read of what you shared",
    summary: summaryParts.join(" ").replace(/\.\s+\./g, "."),
    items: items.slice(0, 4),
    source_traces: sourceTraces,
  } satisfies BuildTripReadBack;
}

function buildRenderContract(params: {
  brief: BuildTripBrief;
  inspirationInputs: TravelerInspirationInput[];
  signals: BuildTripSignalExtraction;
  clarifyingQuestions: BuildTripClarifyingQuestion[];
  destinationShortlist: string[];
  bookableRead: BuildTripBookableRead;
  financeRead: BuildTripFinanceRead;
  ourRead: BuildTripReadBack;
  versions: {
    realistic: BuildTripVersionOutput | null;
    upgraded: BuildTripVersionOutput | null;
    rebalance: BuildTripVersionOutput | null;
  };
}) {
  const {
    brief,
    inspirationInputs,
    signals,
    clarifyingQuestions,
    destinationShortlist,
    bookableRead,
    financeRead,
    ourRead,
    versions,
  } = params;

  const hasAnyInput = Boolean(
    brief.destination_in_mind.trim()
      || brief.holiday_style
      || brief.inspiration_dump_text.trim()
      || inspirationInputs.length > 0,
  );

  const hasUsableSignal = Boolean(
    destinationShortlist.length > 0
      || signals.vibe_signals.length > 0
      || signals.traveler_mix_signal
      || signals.stay_style_signals.length > 0
      || signals.activity_signals.length > 0
      || clarifyingQuestions.length > 0,
  );

  if (!hasAnyInput || !hasUsableSignal) {
    return {
      source_of_truth: "build_trip_engine",
      state: "capture_only",
      reason: "The engine does not have enough usable travel signal yet.",
      allow_save: false,
      show_our_read: false,
      show_next_question: false,
      show_trip_direction: false,
      show_destination_shortlist: false,
      show_bookable_read: false,
      show_versions: false,
      show_finance_read: false,
    } satisfies BuildTripRenderContract;
  }

  if (
    signals.input_strength === "strong"
    || bookableRead.status === "pricing_pending"
    || bookableRead.status === "partial_bookable_match"
    || (financeRead.no_cost_emi_relevant && signals.destination_signal_strength !== "none")
    || (
      versions.realistic
      && signals.destination_signal_strength === "single_strong"
      && Boolean(signals.travel_month_signal || signals.traveler_mix_signal)
    )
  ) {
    return {
      source_of_truth: "build_trip_engine",
      state: "structured_recommendation",
      reason: "The engine has enough structure to show trip direction, price shape, and versioning.",
      allow_save: true,
      show_our_read: ourRead.items.length > 0 || ourRead.source_traces.length > 0,
      show_next_question: Boolean(clarifyingQuestions[0]),
      show_trip_direction: true,
      show_destination_shortlist: destinationShortlist.length > 0,
      show_bookable_read: true,
      show_versions: true,
      show_finance_read: true,
    } satisfies BuildTripRenderContract;
  }

  if (
    signals.input_strength === "medium"
    || destinationShortlist.length > 0
    || signals.vibe_signals.length > 0
    || signals.traveler_mix_signal
  ) {
    return {
      source_of_truth: "build_trip_engine",
      state: "trip_direction",
      reason: "The engine has enough signal to shape the trip direction before asking for contact details.",
      allow_save: true,
      show_our_read: ourRead.items.length > 0 || ourRead.source_traces.length > 0,
      show_next_question: Boolean(clarifyingQuestions[0]),
      show_trip_direction: true,
      show_destination_shortlist: destinationShortlist.length > 0,
      show_bookable_read: true,
      show_versions: false,
      show_finance_read: financeRead.no_cost_emi_relevant,
    } satisfies BuildTripRenderContract;
  }

  return {
    source_of_truth: "build_trip_engine",
    state: "guided_question",
    reason: "The engine has a valid starting point, but one useful answer should come before stronger shaping.",
    allow_save: true,
    show_our_read: ourRead.items.length > 0 || ourRead.source_traces.length > 0,
    show_next_question: true,
    show_trip_direction: true,
    show_destination_shortlist: false,
    show_bookable_read: false,
    show_versions: false,
    show_finance_read: false,
  } satisfies BuildTripRenderContract;
}

function buildFinanceRead(params: {
  brief: BuildTripBrief;
  signals: BuildTripSignalExtraction;
  travelerContext: TravelerPreferences;
  realisticAmount: number | null;
  upgradedAmount: number | null;
}) {
  const { brief, signals, travelerContext, realisticAmount, upgradedAmount } = params;
  const monthlyRealistic = monthlyLabel(realisticAmount);
  const monthlyUpgraded = monthlyLabel(upgradedAmount);
  const monthlyUpgradeDelta = realisticAmount != null && upgradedAmount != null
    ? monthlyLabel(Math.max(0, upgradedAmount - realisticAmount))
    : null;
  const noCostEmiRelevant = Boolean(
    realisticAmount != null &&
    realisticAmount >= 30000 &&
    (
      brief.priorities.includes("easy_payment") ||
      travelerContext.improvement_goal === "easier_payment" ||
      signals.emi_affordability_signal ||
      signals.realism_assessment !== "aligned" ||
      signals.aspiration_level !== "grounded"
    )
  );

  return {
    should_show: Boolean(realisticAmount && noCostEmiRelevant),
    headline: noCostEmiRelevant
      ? "A smarter payment structure may unlock the better version of this trip"
      : "Payment can stay in the background unless you want more flexibility",
    summary: noCostEmiRelevant
      ? monthlyUpgradeDelta
        ? `We can likely show a realistic version first, then a stronger version that feels like only ${monthlyUpgradeDelta} more per month.`
        : "If you book through SanKash, No-Cost EMI can make the trip easier to shape without turning the whole conversation into a hard finance pitch."
      : "If payment comfort matters later, EMI can still be stitched into the trip without changing the travel direction first.",
    no_cost_emi_relevant: noCostEmiRelevant,
    realistic_monthly: monthlyRealistic,
    upgraded_monthly: monthlyUpgraded,
    monthly_upgrade_delta: monthlyUpgradeDelta,
  } satisfies BuildTripFinanceRead;
}

export function buildTripEngine(params: {
  brief: BuildTripBrief;
  preferences?: TravelerPreferences;
  inspirationInputs?: TravelerInspirationInput[];
}) {
  const { brief } = params;
  const rawInputs = params.inspirationInputs ?? buildInspirationInputsFromText(brief.inspiration_dump_text);
  const inspirationInputs = normalizeInspirationInputs(rawInputs);
  const signals = buildTripSignals({
    brief,
    preferences: params.preferences,
    inspirationInputs,
  });
  const travelerContext = buildTravelerContext(brief, params.preferences ?? {}, signals);
  const clarifyingQuestions = buildClarifyingQuestions({
    brief,
    preferences: travelerContext,
    inspirationInputs,
    signals,
  });
  const destinationShortlist = buildDestinationShortlist(brief, signals);
  const budgetBand = estimateBudgetBand(brief, inspirationInputs);
  const versions = buildVersionOutputs(budgetBand, signals, travelerContext);
  const bookableRead = buildBookableRead({
    brief,
    signals,
    budgetBand,
    destinationShortlist,
  });
  const ourRead = buildReadBack({
    brief,
    inspirationInputs,
    signals,
    destinationShortlist,
  });
  const financeRead = buildFinanceRead({
    brief,
    signals,
    travelerContext,
    realisticAmount: versions.realisticAmount,
    upgradedAmount: versions.upgradedAmount,
  });

  const destinationLabel = destinationShortlist[0]
    ? destinationShortlist.slice(0, 3).join(", ")
    : brief.holiday_style
      ? titleCase(humanize(brief.holiday_style))
      : "your trip";
  const vibeLabel = signals.vibe_signals[0]
    ? humanize(signals.vibe_signals[0])
    : brief.holiday_style
      ? humanize(brief.holiday_style)
      : "travel";
  const travelerLabel = humanize(signals.traveler_mix_signal ?? (brief.traveler_mix || "trip"));

  let recommendedPath: BuildTripSynthesisOutput["recommended_path"] = "build_my_trip";
  let nextStepLabel = signals.input_strength === "weak" ? "Add one useful detail" : "Tighten this trip direction";

  if (financeRead.no_cost_emi_relevant) {
    recommendedPath = "check_your_emi";
    nextStepLabel = "See the pay-smarter version";
  } else if (bookableRead.status === "pricing_pending" || bookableRead.status === "partial_bookable_match") {
    recommendedPath = "review_your_quote";
    nextStepLabel = "Move this toward pricing";
  }

  const nextClarificationPrompt = buildNextClarificationPrompt(signals, clarifyingQuestions);

  const headline = signals.input_strength === "weak"
    ? destinationShortlist.length > 0 || signals.vibe_signals.length > 0
      ? "We already have a usable trip direction to build on"
      : "We have a starting point, and one useful detail will sharpen it fast"
    : bookableRead.status === "pricing_pending"
      ? `We can now shape ${destinationLabel} into a cleaner, more bookable direction`
      : bookableRead.status === "multiple_bookable_directions"
        ? `You already have a shortlist worth shaping, not just random saved ideas`
        : `You look closer to a ${vibeLabel}-led ${travelerLabel} trip than a generic plan`;

  const subtext = signals.input_strength === "weak" && nextClarificationPrompt
    ? `${signals.inspiration_read} ${nextClarificationPrompt}`
    : signals.inspiration_read;
  const tripDirection = destinationShortlist.length > 0
    ? `You seem to be leaning toward a ${vibeLabel}-led ${travelerLabel} trip, with ${destinationLabel} fitting that direction best right now.`
    : `You seem to be leaning toward a ${vibeLabel}-led ${travelerLabel} trip, even if the exact destination is still open.`;
  const aspirationSummary = signals.realism_assessment === "aspirational_mismatch"
    ? "What you shared feels a little more premium than the current range, so the smartest answer is to show a realistic version and an upgraded version side by side."
    : signals.realism_assessment === "slightly_above_budget"
      ? "The core vibe is realistic, but one or two choices may need to be shaped more carefully to stay in budget."
      : "The vibe you want and the current budget look reasonably aligned.";
  const budgetFitSummary = budgetBand
    ? signals.realism_assessment === "aligned"
      ? `The current brief looks shapeable around ${budgetBand.label}, which is a healthy starting range for this trip style.`
      : `The current brief points toward ${budgetBand.label}, but the vibe suggests we should test both a realistic version and a slightly stronger version.`
    : signals.input_strength === "weak"
      ? "Budget is still too open, so the smartest next move is to answer one practical question before we try to shape versions."
      : "Budget is still too open to give a tighter price read, but we can already shape the trip direction.";

  const renderContract = buildRenderContract({
    brief,
    inspirationInputs,
    signals,
    clarifyingQuestions,
    destinationShortlist,
    bookableRead,
    financeRead,
    ourRead,
    versions,
  });

  const synthesis: BuildTripSynthesisOutput = {
    headline,
    subtext,
    our_read: ourRead,
    trip_direction: tripDirection,
    destination_shortlist: destinationShortlist,
    trip_structure: buildTripStructureSummary(signals, travelerContext),
    budget_fit_summary: budgetFitSummary,
    aspiration_summary: aspirationSummary,
    next_clarification_prompt: nextClarificationPrompt,
    bookable_read: bookableRead,
    finance_read: financeRead,
    realistic_version: versions.realistic,
    upgraded_version: versions.upgraded,
    rebalance_version: versions.rebalance,
    recommended_path: recommendedPath,
    next_step_label: nextStepLabel,
  };

  return {
    start_mode: brief.start_mode,
    inspiration_inputs: inspirationInputs,
    signals,
    clarifying_questions: clarifyingQuestions,
    synthesis,
    traveler_context: travelerContext,
    render_contract: renderContract,
  } satisfies BuildTripEngineOutput;
}

export function buildTripSummary(
  brief: BuildTripBrief,
  params?: {
    preferences?: TravelerPreferences;
    inspirationInputs?: TravelerInspirationInput[];
  },
): BuildTripSummary {
  const engine = buildTripEngine({
    brief,
    preferences: params?.preferences,
    inspirationInputs: params?.inspirationInputs,
  });

  return {
    headline: engine.synthesis.headline,
    subtext: engine.synthesis.subtext,
    trip_direction: engine.synthesis.trip_direction,
    recommendation_summary: [
      engine.synthesis.trip_structure,
      engine.synthesis.budget_fit_summary,
    ].filter(Boolean).join(" "),
    recommended_path: engine.synthesis.recommended_path,
    next_step_label: engine.synthesis.next_step_label,
    traveler_context: engine.traveler_context,
  };
}
