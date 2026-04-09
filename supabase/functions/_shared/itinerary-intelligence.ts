export const ITINERARY_INTELLIGENCE_VERSION = "2026-04-09-v2";

export type PackageMode = "land_only" | "flights_and_hotels" | "hotels_only" | "custom" | "unknown";
export type AdvisorySeverity = "high" | "medium" | "low";
export type AdvisoryPriority = "high" | "medium" | "low";
export type UnlockableModuleStatus = "ready" | "needs_more_input" | "planned";

export interface ItineraryDecisionFlag {
  code: string;
  title: string;
  detail: string;
  severity: AdvisorySeverity;
  active: boolean;
}

export interface ItineraryAdvisoryInsight {
  code: string;
  title: string;
  detail: string;
  severity: AdvisorySeverity;
  category: "budget" | "transport" | "coverage" | "timing" | "meals" | "hotel" | "seller" | "traveler";
  evidence?: string[];
}

export interface ItineraryQuestion {
  code: string;
  question: string;
  why: string;
  priority: AdvisoryPriority;
}

export interface NextInputNeeded {
  code: string;
  label: string;
  reason: string;
  priority: AdvisoryPriority;
  suggested_upload?: string;
}

export interface UnlockableModule {
  code: string;
  label: string;
  status: UnlockableModuleStatus;
  reason: string;
  provider_hint?: "internal" | "tbo_future";
}

export interface EnrichmentStatus {
  advisory_version: string;
  has_price: boolean;
  has_traveler_count: boolean;
  has_flights: boolean;
  has_hotels: boolean;
  timing_ready: boolean;
  budgeting_ready: boolean;
  package_mode: PackageMode;
  completeness_band: "strong" | "partial" | "thin";
  next_best_action: {
    code: string;
    label: string;
    detail: string;
  };
  tbo_hooks: {
    comparable_hotels: boolean;
    component_compare: boolean;
    smarter_rebuild: boolean;
  };
}

export interface DerivedItineraryIntelligence {
  package_mode: PackageMode;
  extracted_completeness_score: number;
  traveler_questions_json: ItineraryQuestion[];
  seller_questions_json: ItineraryQuestion[];
  advisory_insights_json: ItineraryAdvisoryInsight[];
  next_inputs_needed_json: NextInputNeeded[];
  unlockable_modules_json: UnlockableModule[];
  enrichment_status_json: EnrichmentStatus;
  decision_flags_json: ItineraryDecisionFlag[];
}

export interface ItineraryIntelligenceInput {
  domestic_or_international?: string | null;
  destination_country?: string | null;
  destination_city?: string | null;
  additional_destinations_json?: string[] | null;
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
  hotel_names_json?: string[] | null;
  airline_names_json?: string[] | null;
  sectors_json?: string[] | null;
  inclusions_text?: string | null;
  exclusions_text?: string | null;
  visa_mentioned?: boolean | null;
  insurance_mentioned?: boolean | null;
  flight_departure_time?: string | null;
  flight_arrival_time?: string | null;
  hotel_check_in?: string | null;
  hotel_check_out?: string | null;
  parsing_confidence?: string | null;
  missing_fields_json?: string[] | null;
  extraction_warnings_json?: string[] | null;
}

const GROUND_DESTINATION_HINTS = new Set([
  "auli",
  "dalhousie",
  "dharamshala",
  "kasol",
  "kasauli",
  "kullu",
  "manali",
  "mcleodganj",
  "mussoorie",
  "nainital",
  "shimla",
  "spiti",
  "tirthan",
]);

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

function firstNonEmpty(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (hasText(value)) return value!.trim();
  }
  return null;
}

function uniquePush<T extends { code: string }>(list: T[], item: T) {
  if (!list.some((entry) => entry.code === item.code)) {
    list.push(item);
  }
}

function priorityRank(priority: AdvisoryPriority) {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}

function nextInputRank(code: string) {
  const ranking = [
    "traveler_count",
    "travel_dates",
    "hotel_details",
    "origin_transport_plan",
    "flight_details",
    "price_breakup",
    "price_basis",
    "timing_details",
    "meal_plan_detail",
    "full_quote_context",
  ];

  const index = ranking.indexOf(code);
  return index === -1 ? ranking.length : index;
}

function addMissingFieldDrivenNextInputs(
  nextInputsNeeded: NextInputNeeded[],
  missingFields: Set<string>,
  context: {
    likelyStayCase: boolean;
    hasFlights: boolean;
    timingRelevant: boolean;
  },
) {
  const fieldGroups: Array<{
    fields: string[];
    input: NextInputNeeded;
    enabled?: boolean;
  }> = [
    {
      fields: ["traveller_count_total", "adults_count", "children_count", "infants_count"],
      input: {
        code: "traveler_count",
        label: "Add traveler count",
        reason: "We still need the adult and child count to judge affordability properly.",
        priority: "high",
        suggested_upload: "Seller quote page or message that shows adult and child count",
      },
    },
    {
      fields: ["travel_start_date", "travel_end_date"],
      input: {
        code: "travel_dates",
        label: "Add the page with exact travel dates",
        reason: "Actual travel dates are still missing or unclear.",
        priority: "high",
        suggested_upload: "Departure page, booking confirmation, or itinerary page that shows exact dates",
      },
    },
    {
      fields: ["hotel_names", "hotel_check_in", "hotel_check_out"],
      input: {
        code: "hotel_details",
        label: "Upload the hotel page or full package PDF",
        reason: "The hotel names or stay details are still incomplete.",
        priority: "high",
        suggested_upload: "Accommodation table, hotel confirmation page, or full quote PDF",
      },
      enabled: context.likelyStayCase,
    },
    {
      fields: ["total_price", "price_per_person"],
      input: {
        code: "price_breakup",
        label: "Upload the final quote page or price breakup",
        reason: "The current material does not yet show a reliable final price.",
        priority: "high",
        suggested_upload: "Final quote PDF, pricing summary, or breakup screenshot",
      },
    },
    {
      fields: ["airline_names", "sectors", "flight_departure_time", "flight_arrival_time"],
      input: {
        code: "flight_details",
        label: "Upload your flight or train details",
        reason: "Transport details are still missing from this case.",
        priority: "high",
        suggested_upload: "Airline itinerary, train booking, or seller message with transport plan",
      },
      enabled: context.likelyStayCase || context.hasFlights,
    },
    {
      fields: ["flight_arrival_time", "hotel_check_in"],
      input: {
        code: "timing_details",
        label: "Upload arrival time and hotel check-in details",
        reason: "Trip timing checks need both arrival timing and hotel timing.",
        priority: "medium",
        suggested_upload: "Flight itinerary screenshot and hotel confirmation page",
      },
      enabled: context.timingRelevant,
    },
  ];

  for (const group of fieldGroups) {
    if (group.enabled === false) continue;
    if (!group.fields.some((field) => missingFields.has(field))) continue;
    uniquePush(nextInputsNeeded, group.input);
  }
}

function getMealPlan(inclusionsText: string | null | undefined) {
  const text = normalizeText(inclusionsText);
  const breakfast = /\bbreakfast\b/.test(text);
  const lunch = /\blunch\b/.test(text);
  const dinner = /\bdinner\b/.test(text);
  const allMeals = /\ball meals\b|\bfull board\b|\ball inclusive\b/.test(text);

  if (!text) return "unknown";
  if (allMeals) return "full_board";
  if (breakfast && lunch && dinner) return "full_board";
  if (breakfast && dinner) return "half_board";
  if (breakfast && !lunch && !dinner) return "breakfast_only";
  if (lunch || dinner) return "partial";
  return "unknown";
}

function buildMissingFieldSet(input: ItineraryIntelligenceInput) {
  return new Set((input.missing_fields_json ?? []).filter(Boolean));
}

function hasFlightSignals(input: ItineraryIntelligenceInput) {
  return Boolean(
    (input.airline_names_json ?? []).length ||
    (input.sectors_json ?? []).length ||
    hasText(input.flight_departure_time) ||
    hasText(input.flight_arrival_time),
  );
}

function hasHotelSignals(input: ItineraryIntelligenceInput) {
  return Boolean(
    (input.hotel_names_json ?? []).length ||
    hasText(input.hotel_check_in) ||
    hasText(input.hotel_check_out),
  );
}

function buildContextText(input: ItineraryIntelligenceInput) {
  return normalizeText([
    input.inclusions_text,
    input.exclusions_text,
    input.destination_city,
    input.destination_country,
    ...(input.additional_destinations_json ?? []),
  ].filter(Boolean).join(" "));
}

function hasStayLanguage(input: ItineraryIntelligenceInput) {
  const context = buildContextText(input);
  return /\bhotel\b|\baccommodation\b|\bstay\b|\broom\b|\bnight stay\b|\bovernight\b/.test(context);
}

function hasCoreGroundSignals(input: ItineraryIntelligenceInput) {
  const context = buildContextText(input);
  return (
    /\bairport transfer\b|\btransfer\b|\bpickup\b|\bdrop\b|\bsightseeing\b|\bexcursion\b|\bactivity\b|\bferry\b|\bcruise\b|\bprivate vehicle\b|\bcoach\b|\bguide(?:d)?\b|\bpermits?\b|\bentry tickets?\b/.test(context) ||
    Boolean((input.additional_destinations_json ?? []).length)
  );
}

function hasIndependentStaySignals(input: ItineraryIntelligenceInput) {
  const context = buildContextText(input);
  return /\bindependent\b|\barrive independently\b|\bcity stay\b|\bhotel booking\b|\bstarts and ends in\b/.test(context);
}

function isLikelyStayCase(input: ItineraryIntelligenceInput, packageMode: PackageMode) {
  return hasHotelSignals(input) || hasStayLanguage(input) || packageMode === "land_only" || packageMode === "hotels_only";
}

function hasExplicitInsuranceExclusion(input: ItineraryIntelligenceInput) {
  const exclusionText = normalizeText(input.exclusions_text);
  return /\btravel insurance\b|\binsurance\b/.test(exclusionText);
}

function shouldFlagInsuranceGap(input: ItineraryIntelligenceInput, packageMode: PackageMode, completenessBand: "strong" | "partial" | "thin") {
  if (input.insurance_mentioned === true) return false;

  const explicitInsuranceExclusion = hasExplicitInsuranceExclusion(input);
  const isInternational = input.domestic_or_international === "international";
  const visiblePrice = input.total_price ?? input.price_per_person ?? null;
  const hasPrice = visiblePrice != null;
  const priceThresholdBreached = (visiblePrice ?? 0) >= (isInternational ? 50000 : 100000);
  const exclusionHeavy = (input.exclusions_text ?? "").split(",").filter((item) => item.trim()).length >= 3;

  if (explicitInsuranceExclusion) return true;
  if (isInternational) return completenessBand !== "thin" || hasPrice;
  if (input.visa_mentioned === true) return true;
  if (priceThresholdBreached && exclusionHeavy) return true;
  if (packageMode === "flights_and_hotels" && hasPrice && exclusionHeavy) return true;
  return false;
}

function inferPackageMode(input: ItineraryIntelligenceInput): PackageMode {
  const hasFlights = hasFlightSignals(input);
  const hasHotels = hasHotelSignals(input) || hasStayLanguage(input);
  const hasGroundPackageSignals = hasCoreGroundSignals(input);
  const hasIndependentHotelSignals = hasIndependentStaySignals(input);

  if (hasFlights && hasHotels) return "flights_and_hotels";
  if (hasFlights && !hasHotels) return hasGroundPackageSignals ? "custom" : "unknown";
  if (hasHotels && hasGroundPackageSignals) return "land_only";
  if (hasHotels && hasIndependentHotelSignals) return "hotels_only";
  if (hasHotels) return "hotels_only";
  if (hasGroundPackageSignals) return "land_only";
  return "unknown";
}

function computeCompletenessScore(input: ItineraryIntelligenceInput) {
  let score = 0;

  if (hasText(input.destination_city) || hasText(input.destination_country)) score += 12;
  if (hasText(input.travel_start_date)) score += 8;
  if (hasText(input.travel_end_date)) score += 5;
  if (input.duration_nights != null || input.duration_days != null) score += 5;
  if (input.total_price != null) score += 18;
  if (input.price_per_person != null) score += 6;
  if (input.traveller_count_total != null) score += 15;
  if ((input.hotel_names_json ?? []).length > 0) score += 8;
  if ((input.airline_names_json ?? []).length > 0 || (input.sectors_json ?? []).length > 0) score += 8;
  if (hasText(input.flight_departure_time) || hasText(input.flight_arrival_time)) score += 5;
  if (hasText(input.hotel_check_in) || hasText(input.hotel_check_out)) score += 4;
  if (hasText(input.inclusions_text)) score += 4;
  if (input.insurance_mentioned === true) score += 2;
  if (input.visa_mentioned === true) score += 2;
  if ((input.extraction_warnings_json ?? []).length > 0) score -= Math.min(8, (input.extraction_warnings_json ?? []).length * 2);
  if ((input.parsing_confidence ?? "low") === "low") score -= 10;
  if ((input.parsing_confidence ?? "low") === "medium") score -= 4;

  return Math.max(0, Math.min(100, score));
}

export function deriveItineraryIntelligence(input: ItineraryIntelligenceInput): DerivedItineraryIntelligence {
  const travelerQuestions: ItineraryQuestion[] = [];
  const sellerQuestions: ItineraryQuestion[] = [];
  const advisoryInsights: ItineraryAdvisoryInsight[] = [];
  const nextInputsNeeded: NextInputNeeded[] = [];
  const unlockableModules: UnlockableModule[] = [];
  const decisionFlags: ItineraryDecisionFlag[] = [];

  const packageMode = inferPackageMode(input);
  const completenessScore = computeCompletenessScore(input);
  const completenessBand = completenessScore >= 70 ? "strong" : completenessScore >= 40 ? "partial" : "thin";
  const missingFields = buildMissingFieldSet(input);

  const destination = firstNonEmpty([input.destination_city, input.destination_country]) ?? "this trip";
  const destinationKey = normalizeText(input.destination_city);
  const hasFlights = hasFlightSignals(input);
  const hasHotels = hasHotelSignals(input);
  const likelyStayCase = isLikelyStayCase(input, packageMode);
  const hasVisiblePrice = input.total_price != null || input.price_per_person != null;
  const hasPrice = input.total_price != null;
  const hasTravelerCount = input.traveller_count_total != null;
  const hasFlightTiming = hasText(input.flight_arrival_time);
  const hasHotelTiming = hasText(input.hotel_check_in);
  const timingRelevant = hasFlights && likelyStayCase;
  const timingReady = hasFlights && hasHotels && hasFlightTiming && hasHotelTiming;
  const mealPlan = getMealPlan(input.inclusions_text);
  const isInternational = input.domestic_or_international === "international";
  const priceLabel = input.total_price != null
    ? `${(input.currency ?? "INR").toUpperCase()} ${Number(input.total_price).toLocaleString("en-IN")}`
    : input.price_per_person != null
      ? `${(input.currency ?? "INR").toUpperCase()} ${Number(input.price_per_person).toLocaleString("en-IN")} per traveler`
      : null;
  const hotelNames = (input.hotel_names_json ?? []).filter(Boolean);
  const localTransferOnly = /\btransfer\b|\bpickup\b|\bdrop\b/.test(normalizeText(input.inclusions_text));
  const explicitInsuranceExclusion = hasExplicitInsuranceExclusion(input);
  const transportMissing = packageMode === "land_only" || packageMode === "hotels_only" || (hasHotels && !hasFlights && localTransferOnly);
  const priceBasisUnclear = hasVisiblePrice && (input.price_per_person == null || input.traveller_count_total == null);
  const shouldFlagInsurance = shouldFlagInsuranceGap(input, packageMode, completenessBand);
  const budgetingGaps: string[] = [];

  if (packageMode === "land_only") {
    uniquePush(decisionFlags, {
      code: "land_only_likely",
      title: "Land-only package likely",
      detail: `This looks like a stay-and-local-services package for ${destination}, not a full door-to-door trip.`,
      severity: "high",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "land_only_likely",
      title: "This looks like a land-only package",
      detail: `The visible package appears to cover the destination stay and local components, but not the full journey from your starting city.`,
      severity: "high",
      category: "transport",
      evidence: [firstNonEmpty([input.inclusions_text, input.destination_city]) ?? destination],
    });
    uniquePush(travelerQuestions, {
      code: "origin_city_and_mode",
      question: `Which city are you starting from for ${destination}?`,
      why: "We need the first leg to estimate your real total trip cost.",
      priority: "high",
    });
    uniquePush(sellerQuestions, {
      code: "seller_transport_scope",
      question: "Does this price include travel to the trip start point, or only the land package after arrival?",
      why: "This clarifies whether the visible quote is full-trip or only destination services.",
      priority: "high",
    });
    uniquePush(nextInputsNeeded, {
      code: "origin_transport_plan",
      label: "Upload your train, flight, or road booking plan",
      reason: "The current package may not include the first leg of your journey.",
      priority: "high",
      suggested_upload: "Flight screenshot, train booking, or seller message about pickup/start city",
    });
    budgetingGaps.push("transport to the trip start point");
  }

  if (packageMode === "hotels_only") {
    uniquePush(decisionFlags, {
      code: "hotels_only_likely",
      title: "This looks closer to a hotel booking",
      detail: `The visible quote looks like a stay in ${destination}, not a full holiday package with transport and day-wise travel components.`,
      severity: "medium",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "hotels_only_likely",
      title: "This looks closer to a hotel-only booking",
      detail: "The visible details focus on the stay itself, so transport, sightseeing, and the rest of the holiday budget may still sit outside this booking.",
      severity: "medium",
      category: "transport",
      evidence: hotelNames.length > 0 ? hotelNames.slice(0, 1) : undefined,
    });
    budgetingGaps.push("travel to and from the hotel");
  }

  if (transportMissing) {
    uniquePush(decisionFlags, {
      code: "transport_missing_from_total",
      title: "Transport may be missing from total trip cost",
      detail: "The quote does not clearly show how you reach the start point of the trip.",
      severity: "high",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "transport_missing_from_total",
      title: "Your visible price may not be the full trip price",
      detail: "Travel to the trip start point may still sit outside this quote, so the final budget could be higher than the shown package value.",
      severity: "high",
      category: "budget",
      evidence: priceLabel ? [priceLabel] : undefined,
    });
  }

  if (!hasText(input.travel_start_date) || !hasText(input.travel_end_date)) {
    uniquePush(decisionFlags, {
      code: "travel_dates_missing",
      title: "Exact trip dates are missing",
      detail: "The current quote does not clearly confirm the actual start and end dates of travel.",
      severity: "high",
      active: true,
    });
    uniquePush(nextInputsNeeded, {
      code: "travel_dates",
      label: "Add the page with exact travel dates",
      reason: "Actual travel dates are still missing or incomplete.",
      priority: "high",
      suggested_upload: "Departure page, booking confirmation, or itinerary page that shows exact dates",
    });
  }

  if (!hasTravelerCount) {
    uniquePush(decisionFlags, {
      code: "traveler_count_missing",
      title: "Traveler count missing",
      detail: "The quote does not confirm how many adults, children, or infants this price covers.",
      severity: "high",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "traveler_count_missing",
      title: "Traveler count is missing",
      detail: "We should confirm the number of travelers before treating this as a strong affordability signal.",
      severity: "high",
      category: "traveler",
    });
    uniquePush(travelerQuestions, {
      code: "traveler_count",
      question: "How many adults, children, and infants are traveling?",
      why: "Affordability, per-person cost, and hotel suitability depend on the group size.",
      priority: "high",
    });
    uniquePush(sellerQuestions, {
      code: "seller_price_basis",
      question: "Can you confirm whether this quote is for the full group or based on a standard occupancy like 2 adults?",
      why: "We need the price basis before comparing value properly.",
      priority: "high",
    });
    uniquePush(nextInputsNeeded, {
      code: "traveler_count",
      label: "Add traveler count",
      reason: "Without traveler count, per-person affordability stays weak.",
      priority: "high",
      suggested_upload: "Seller quote page or message that shows adult/child count",
    });
    budgetingGaps.push("traveler count");
  }

  if (!hasVisiblePrice || missingFields.has("total_price") || missingFields.has("price_per_person")) {
    uniquePush(decisionFlags, {
      code: "price_missing_or_partial",
      title: "Price details are incomplete",
      detail: "The visible material does not yet show a strong final trip amount or clear price breakup.",
      severity: "high",
      active: true,
    });
    uniquePush(nextInputsNeeded, {
      code: "price_breakup",
      label: "Upload the final quote page or price breakup",
      reason: "We need the final amount or fare breakup before judging value properly.",
      priority: "high",
      suggested_upload: "Final quote PDF, pricing summary, or breakup screenshot",
    });
  }

  if (likelyStayCase && !hasHotels) {
    uniquePush(decisionFlags, {
      code: "hotel_names_missing",
      title: "Hotel names are still missing",
      detail: "The package looks stay-based, but the actual hotel names are not visible yet.",
      severity: "medium",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "hotel_names_missing",
      title: "We still need the hotel names",
      detail: "Without the exact hotels, we cannot judge location quality, room value, or whether the seller is using a placeholder stay.",
      severity: "medium",
      category: "hotel",
    });
    uniquePush(nextInputsNeeded, {
      code: "hotel_details",
      label: "Upload the hotel page or full package PDF",
      reason: "The current material does not clearly show the hotel names or room category.",
      priority: "high",
      suggested_upload: "Accommodation table, hotel confirmation page, or full quote PDF",
    });
    uniquePush(sellerQuestions, {
      code: "seller_hotel_names",
      question: "Can you share the exact hotel names and room category that this quote is based on?",
      why: "Hotel substitutions and vague placeholders make it hard to judge real value.",
      priority: "high",
    });
  }

  if (mealPlan === "breakfast_only") {
    uniquePush(decisionFlags, {
      code: "meal_plan_breakfast_only",
      title: "Meal plan looks light",
      detail: "Only breakfast is visible in the package inclusions.",
      severity: "medium",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "meal_plan_breakfast_only",
      title: "Only breakfast appears included",
      detail: "Lunch and dinner may become a separate out-of-pocket cost during the trip.",
      severity: "medium",
      category: "meals",
      evidence: hasText(input.inclusions_text) ? [input.inclusions_text!.slice(0, 160)] : undefined,
    });
    uniquePush(sellerQuestions, {
      code: "seller_meal_plan",
      question: "Which meals are included each day, and what is definitely extra?",
      why: "Meal gaps often change the actual day-to-day spend more than travelers expect.",
      priority: "medium",
    });
    budgetingGaps.push("lunch and dinner costs");
  } else if (mealPlan === "unknown" && hasHotels) {
    uniquePush(decisionFlags, {
      code: "meal_plan_unclear",
      title: "Meal plan unclear",
      detail: "The itinerary does not clearly show what meals are included.",
      severity: "medium",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "meal_plan_unclear",
      title: "Meal plan is still unclear",
      detail: "We cannot tell yet whether meals are included beyond the room stay, so daily food spend may still be missing from the real budget.",
      severity: "medium",
      category: "meals",
    });
    uniquePush(nextInputsNeeded, {
      code: "meal_plan_detail",
      label: "Add a page with package inclusions",
      reason: "Meal coverage is still unclear.",
      priority: "medium",
      suggested_upload: "Package inclusions screenshot or PDF page",
    });
  }

  if (shouldFlagInsurance) {
    const insuranceSeverity: AdvisorySeverity = isInternational || explicitInsuranceExclusion ? "high" : "medium";
    uniquePush(decisionFlags, {
      code: "insurance_not_visible",
      title: "Insurance not visible",
      detail: "Travel insurance is not currently visible in this itinerary.",
      severity: insuranceSeverity,
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "insurance_not_visible",
      title: "Travel insurance is not visible",
      detail: explicitInsuranceExclusion
        ? "The quote explicitly leaves travel insurance outside the package, so this protection layer still needs a decision."
        : isInternational
          ? "This is an international trip, so insurance is worth checking before payment."
          : "Insurance is not clearly visible yet, but it only matters if you want that cover added separately.",
      severity: insuranceSeverity,
      category: "coverage",
    });
    uniquePush(sellerQuestions, {
      code: "seller_insurance",
      question: "Is travel insurance included, optional, or completely separate from this quote?",
      why: "We want to know whether medical or cancellation cover is already part of the package.",
      priority: "medium",
    });
    if (explicitInsuranceExclusion) {
      budgetingGaps.push("travel insurance");
    }
  }

  if (isInternational && input.visa_mentioned !== true) {
    uniquePush(decisionFlags, {
      code: "visa_not_visible",
      title: "Visa support not visible",
      detail: "The quote does not clearly mention visa support or visa fees.",
      severity: "high",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "visa_not_visible",
      title: "Visa support is not visible",
      detail: "For this international trip, visa handling and visa cost should be confirmed before payment.",
      severity: "high",
      category: "coverage",
    });
    uniquePush(sellerQuestions, {
      code: "seller_visa_scope",
      question: "Is visa assistance included, and are visa fees already part of this quote?",
      why: "Visa fees and timelines can materially change the real cost and booking readiness.",
      priority: "high",
    });
    budgetingGaps.push("visa costs");
  }

  if (timingRelevant && !timingReady) {
    uniquePush(decisionFlags, {
      code: "timing_data_incomplete",
      title: "Trip timing check is blocked",
      detail: "Flight arrival and hotel check-in are not both visible yet.",
      severity: "medium",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "timing_data_incomplete",
      title: "Timing details are incomplete",
      detail: "We cannot properly check arrival gaps or late check-in risk until both flight and hotel timings are visible.",
      severity: "medium",
      category: "timing",
    });
    uniquePush(nextInputsNeeded, {
      code: "timing_details",
      label: "Upload arrival time and hotel check-in details",
      reason: "Trip timing checks need both transport and hotel timing.",
      priority: "medium",
      suggested_upload: "Flight itinerary screenshot and hotel confirmation page",
    });
    uniquePush(sellerQuestions, {
      code: "seller_timing_details",
      question: "Can you share the exact arrival timing and hotel check-in timing for this booking?",
      why: "We want to catch late-arrival and check-in gaps before the trip is paid for.",
      priority: "medium",
    });
  }

  if (priceBasisUnclear) {
    uniquePush(decisionFlags, {
      code: "price_basis_unclear",
      title: "Price basis is unclear",
      detail: "The visible quote shows a total amount, but not enough context to map it cleanly per traveler.",
      severity: "medium",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "price_basis_unclear",
      title: "Price is visible, but the basis is still unclear",
      detail: "We should confirm whether the shown amount is for the full group, for a standard room occupancy, or per traveler.",
      severity: "medium",
      category: "budget",
      evidence: priceLabel ? [priceLabel] : undefined,
    });
    uniquePush(nextInputsNeeded, {
      code: "price_basis",
      label: "Upload the occupancy or traveler-based quote page",
      reason: "We still need to tie the visible price to the traveler count and room basis.",
      priority: "medium",
      suggested_upload: "Occupancy pricing table, per-person quote, or seller message with group basis",
    });
  }

  if (GROUND_DESTINATION_HINTS.has(destinationKey) && !hasFlights) {
    uniquePush(decisionFlags, {
      code: "destination_travel_mode_question",
      title: "Starting-leg travel mode needs confirmation",
      detail: `Trips to ${destination} often need a clear starting city and first-leg travel plan.`,
      severity: "medium",
      active: true,
    });
    uniquePush(travelerQuestions, {
      code: "destination_mode_question",
      question: `Are you planning to reach ${destination} by road, train, or air?`,
      why: "That first-leg choice often changes the real cost and comfort of the trip.",
      priority: "medium",
    });
  }

  if (hotelNames.length > 0) {
    uniquePush(decisionFlags, {
      code: "hotel_quality_followup_available",
      title: "Hotel comparison can be enriched further",
      detail: "Hotel names are visible, so comparable quality and location checks are possible next.",
      severity: "low",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "hotel_quality_followup_available",
      title: "Hotel quality check is the next useful enrichment",
      detail: "We can compare hotel location, room category, and value once partner inventory or hotel metadata is plugged in.",
      severity: "low",
      category: "hotel",
      evidence: hotelNames.length ? hotelNames.slice(0, 2) : undefined,
    });
    uniquePush(sellerQuestions, {
      code: "seller_hotel_quality",
      question: "Can you confirm the exact hotel, room category, cancellation terms, and whether this is the final hotel or a similar-category placeholder?",
      why: "Hotel substitutions and room-category gaps often change the real value of a package.",
      priority: "medium",
    });
  }

  if (likelyStayCase && !hasFlights) {
    uniquePush(travelerQuestions, {
      code: "flight_plan_missing",
      question: "Have you already booked your flights or train, or is that still open?",
      why: "If the stay is visible but transport is still open, your total budget is not final yet.",
      priority: "high",
    });
    uniquePush(nextInputsNeeded, {
      code: "flight_details",
      label: "Upload your flight or train details",
      reason: "Transport is still missing from this case.",
      priority: "high",
      suggested_upload: "Airline itinerary, train booking, or seller message with transport plan",
    });
  }

  const materialBudgetGap =
    transportMissing ||
    !hasTravelerCount ||
    priceBasisUnclear ||
    shouldFlagInsurance ||
    (isInternational && input.visa_mentioned !== true) ||
    (mealPlan === "unknown" && likelyStayCase);

  if (hasVisiblePrice && materialBudgetGap) {
    uniquePush(decisionFlags, {
      code: "full_trip_budget_incomplete",
      title: "Full-trip budgeting is incomplete",
      detail: "The visible quote is useful, but not yet strong enough to stand in as your real trip budget.",
      severity: "high",
      active: true,
    });
    uniquePush(advisoryInsights, {
      code: "full_trip_budget_incomplete",
      title: "This quote is still incomplete for full-trip budgeting",
      detail: budgetingGaps.length > 0
        ? `Key budget gaps still look open: ${budgetingGaps.join(", ")}.`
        : "A few trip-cost layers are still missing, so the current amount may understate the real spend.",
      severity: "high",
      category: "budget",
    });
  }

  addMissingFieldDrivenNextInputs(nextInputsNeeded, missingFields, {
    likelyStayCase,
    hasFlights,
    timingRelevant,
  });

  const materiallyIncomplete =
    completenessBand !== "strong" ||
    missingFields.size > 0 ||
    decisionFlags.some((flag) => flag.severity === "high");

  if (materiallyIncomplete && nextInputsNeeded.length === 0) {
    uniquePush(nextInputsNeeded, {
      code: "full_quote_context",
      label: "Upload the full quote or complete itinerary",
      reason: "The current material is not complete enough for a strong review yet.",
      priority: "high",
      suggested_upload: "Full package PDF, full quote screenshots, or the booking confirmation page",
    });
  }

  const finalizedNextInputs = [...nextInputsNeeded]
    .sort((left, right) => {
      const priorityDiff = priorityRank(left.priority) - priorityRank(right.priority);
      if (priorityDiff !== 0) return priorityDiff;
      const intentDiff = nextInputRank(left.code) - nextInputRank(right.code);
      if (intentDiff !== 0) return intentDiff;
      return left.label.localeCompare(right.label);
    })
    .slice(0, 3);

  const emiReady = hasVisiblePrice;
  const timingModuleReady = timingReady;
  const budgetingReady = hasVisiblePrice && hasTravelerCount;

  uniquePush(unlockableModules, {
    code: "emi_affordability",
    label: "EMI & affordability",
    status: emiReady ? "ready" : "needs_more_input",
    reason: emiReady ? "Trip price is visible." : "Trip price is still missing.",
    provider_hint: "internal",
  });

  uniquePush(unlockableModules, {
    code: "trip_timing_check",
    label: "Trip Timing Check",
    status: timingRelevant ? (timingModuleReady ? "ready" : "needs_more_input") : "planned",
    reason: timingRelevant
      ? (timingModuleReady ? "Flight and hotel timings are available." : "Flight arrival and hotel timing are not both visible yet.")
      : "Trip timing only becomes relevant when both the stay and the travel leg are visible.",
    provider_hint: "internal",
  });

  uniquePush(unlockableModules, {
    code: "seller_question_checklist",
    label: "Questions to ask your seller",
    status: sellerQuestions.length > 0 ? "ready" : "planned",
    reason: sellerQuestions.length > 0 ? "The engine has a seller checklist ready." : "Seller checklist will grow as more trip details are found.",
    provider_hint: "internal",
  });

  if (hotelNames.length > 0) {
    uniquePush(unlockableModules, {
      code: "hotel_quality_compare",
      label: "Hotel quality comparison",
      status: "planned",
      reason: "Hotel names are visible and ready for partner-inventory comparison later.",
      provider_hint: "tbo_future",
    });
  }

  if (hotelNames.length > 0 || hasFlights) {
    uniquePush(unlockableModules, {
      code: "component_compare",
      label: "Component comparison",
      status: "planned",
      reason: "This case has enough structure to support future component-level comparison.",
      provider_hint: "tbo_future",
    });
  }

  if (hasVisiblePrice) {
    uniquePush(unlockableModules, {
      code: "smarter_rebuild_signal",
      label: "Smarter rebuild signal",
      status: "planned",
      reason: "Visible pricing can later be compared against rebuilt options and partner inventory.",
      provider_hint: "tbo_future",
    });
  }

  const nextBestAction =
    finalizedNextInputs.find((item) => item.code === "traveler_count") ||
    finalizedNextInputs.find((item) => item.code === "travel_dates") ||
    finalizedNextInputs.find((item) => item.code === "price_breakup") ||
    finalizedNextInputs.find((item) => item.code === "hotel_details") ||
    finalizedNextInputs.find((item) => item.code === "origin_transport_plan") ||
    finalizedNextInputs.find((item) => item.code === "flight_details") ||
    finalizedNextInputs.find((item) => item.code === "timing_details") ||
    finalizedNextInputs[0] || {
      code: "review_seller_checklist",
      label: "Review the seller checklist",
      reason: "The core extraction is usable, so the next win is clarifying open trip details before paying.",
      priority: "low" as AdvisoryPriority,
    };

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
      has_price: hasVisiblePrice,
      has_traveler_count: hasTravelerCount,
      has_flights: hasFlights,
      has_hotels: hasHotels,
      timing_ready: timingReady,
      budgeting_ready: budgetingReady,
      package_mode: packageMode,
      completeness_band: completenessBand,
      next_best_action: {
        code: nextBestAction.code,
        label: nextBestAction.label,
        detail: nextBestAction.reason,
      },
      tbo_hooks: {
        comparable_hotels: hotelNames.length > 0,
        component_compare: hotelNames.length > 0 || hasFlights,
        smarter_rebuild: hasVisiblePrice,
      },
    },
    decision_flags_json: decisionFlags,
  };
}
