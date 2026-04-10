export interface ParsedItineraryExtraction {
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
  "ac hotel",
  "adler",
  "baywatch",
  "carlton",
  "citymax",
  "courtyard",
  "holiday inn",
  "hotel",
  "ibis",
  "lake palace",
  "mercure",
  "novotel",
  "opera",
  "park",
  "radisson",
  "roma",
  "sun park",
  "taj",
  "the park",
  "village hotel",
];

const HOTEL_SUFFIX_PATTERN = /\b(hotel|resort|residency|inn|suite|suites|houseboat|palace|spa|villa|villas|lodge|camp|cruise)\b/i;
const GENERIC_HOTEL_PHRASES = /\b(mentioned hotels|similar hotels|hotel stay|hotel check-?in|hotel check-?out|hotel details|overnight stay|overnight in|star hotel|hotels? included)\b/i;
const HOTEL_SECTION_HEADING_PATTERN = /^(?:hotels?(?: name| details| options?)?|accommodation(?: details)?|stay(?: details)?|room category|proposed hotels?)\s*[:\-]?\s*(.*)$/i;
const HOTEL_SECTION_STOP_PATTERN = /^(?:meals?|breakfast|lunch|dinner|inclusions?|exclusions?|price|cost|fare|flight|airfare|visa|insurance|transfers?|pickup|drop|sightseeing|day\s*\d+|night\s*\d+|notes?)\b/i;
const HOTEL_INLINE_SEQUENCE_PATTERN = /\b(?:The\s+)?[A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,6}\s+(?:Hotel|Resort|Residency|Inn|Suite|Suites|Houseboat|Palace|Spa|Villa|Villas|Lodge|Camp|Cruise)\b(?:\s+or similar)?/g;
const HOTEL_STAR_RATING_PATTERN = /\(?\b[3-5]\s*(?:\*+|star)\b\)?/gi;
const HOTEL_BRAND_SEQUENCE_PATTERN = new RegExp(
  `\\b(?:${HOTEL_BRAND_PREFIXES.filter((prefix) => prefix !== "hotel" && prefix !== "park")
    .map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
    .join("|")})\\b(?:\\s+[A-Z][A-Za-z0-9&.'-]+){0,6}(?:\\s+or similar)?`,
  "gi",
);

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
    .replace(/^at\s+/i, "")
    .replace(HOTEL_STAR_RATING_PATTERN, "")
    .replace(/^[A-Za-z\s]+(?:-\s+|:\s+)(?=(?:the\s+)?[A-Z])/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\b(Breakfast|Lunch|Dinner|Meal Plan|Twin Share|Per Person)\b.*$/i, "")
    .replace(/\s+with(?:\s+(?:breakfast|lunch|dinner|meals?|airport|transfer|visa|insurance|tour|sightseeing))?\s*$/i, "")
    .replace(/\b(or similar)\b/i, "or similar")
    .replace(/[|•]+/g, " ")
    .trim();

  if (!cleaned) return null;
  if (cleaned.length < 4 || cleaned.length > 90) return null;
  if (GENERIC_HOTEL_PHRASES.test(cleaned)) return null;
  return cleaned;
}

function looksLikeHotelCandidate(candidate: string, allowSectionHeuristic = false) {
  const normalized = candidate.trim();
  const strippedForHeuristic = normalized.replace(HOTEL_STAR_RATING_PATTERN, "").trim();
  const lower = normalized.toLowerCase();

  if (!normalized) return false;
  if (HOTEL_SUFFIX_PATTERN.test(normalized)) return true;
  if (HOTEL_BRAND_PREFIXES.some((prefix) => lower.includes(prefix))) return true;
  if (!allowSectionHeuristic) return false;
  if (GENERIC_HOTEL_PHRASES.test(strippedForHeuristic)) return false;
  if (/\b(meals?|breakfast|lunch|dinner|price|cost|fare|flight|airfare|visa|insurance|transfers?|pickup|drop|sightseeing|activity|itinerary|quote)\b/i.test(strippedForHeuristic)) {
    return false;
  }
  if (/\d{2,}/.test(strippedForHeuristic)) return false;
  return /^[A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){1,6}(?:\s+or similar)?$/.test(strippedForHeuristic);
}

function extractInlineHotelSequences(line: string) {
  const candidates: string[] = [];

  for (const match of line.matchAll(HOTEL_INLINE_SEQUENCE_PATTERN)) {
    const candidate = sanitizeHotelCandidate(match[0]);
    if (candidate) candidates.push(candidate);
  }

  for (const match of line.matchAll(HOTEL_BRAND_SEQUENCE_PATTERN)) {
    const candidate = sanitizeHotelCandidate(match[0]);
    if (candidate) candidates.push(candidate);
  }

  return uniqueStrings(candidates);
}

function extractLabelCount(line: string, labels: string[]) {
  const joinedLabels = labels.join("|");
  const afterLabel = line.match(new RegExp(`\\b(?:${joinedLabels})\\b\\s*[:\\-]?\\s*(\\d+)\\b`, "i"));
  if (afterLabel?.[1]) return Number(afterLabel[1]);

  const beforeLabel = line.match(new RegExp(`\\b(\\d+)\\s*(?:${joinedLabels})\\b`, "i"));
  if (beforeLabel?.[1]) return Number(beforeLabel[1]);

  return null;
}

function buildFallbackTextCorpus(parsed: ParsedItineraryExtraction, rawText: string) {
  const parts = [
    rawText,
    parsed.inclusions_text,
    parsed.exclusions_text,
    parsed.price_notes,
    parsed.confidence_notes,
    ...(parsed.extracted_snippets ?? []),
  ];

  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const part of parts) {
    const normalized = (part ?? "").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }

  return deduped.join("\n");
}

function extractHotelNamesFromText(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    let candidate: string | null = null;
    let allowSectionHeuristic = false;

    const labeledMatch = line.match(HOTEL_SECTION_HEADING_PATTERN);
    if (labeledMatch) {
      candidate = labeledMatch[1];
      allowSectionHeuristic = true;

      if (!candidate) {
        const sectionLines: string[] = [];
        for (let offset = 1; offset <= 4 && index + offset < lines.length; offset += 1) {
          const sectionLine = lines[index + offset];
          if (HOTEL_SECTION_STOP_PATTERN.test(sectionLine)) break;
          sectionLines.push(sectionLine);
        }

        if (sectionLines.length > 0) {
          candidate = sectionLines.join(" | ");
        }
      }
    } else {
      const stayMatch = line.match(/\b(?:stay at|accommodation at|hotel)\s*[:\-]?\s*(.+)$/i);
      if (stayMatch) {
        candidate = stayMatch[1];
      }
    }

    const inlineCandidates = extractInlineHotelSequences(line);
    const candidatePool = candidate ? [{ value: candidate, allowSectionHeuristic }] : [];

    if (!candidate && inlineCandidates.length === 0 && looksLikeHotelCandidate(line, false)) {
      candidatePool.push({ value: line, allowSectionHeuristic: false });
    }

    for (const inlineCandidate of inlineCandidates) {
      candidates.push(inlineCandidate);
    }

    for (const entry of candidatePool) {
      const splitCandidates = entry
        .value
        .split(/\s+\|\s+|\s+\/\s+|;\s*|,(?=\s*[A-Z])/)
        .map((part) => part.trim())
        .filter(Boolean);

      for (const part of splitCandidates) {
        if (!looksLikeHotelCandidate(part, entry.allowSectionHeuristic)) {
          continue;
        }

        const sanitized = sanitizeHotelCandidate(part);
        if (sanitized) candidates.push(sanitized);
      }
    }
  }

  return uniqueStrings(candidates);
}

interface TravelerBreakdown {
  total: number | null;
  adults: number | null;
  children: number | null;
  infants: number | null;
  conflict: boolean;
}

function extractTravelerBreakdown(rawText: string): TravelerBreakdown {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates: TravelerBreakdown[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!/(travellers?|travelers?|guests?|pax|persons?|adults?|children?|child|infants?)/.test(lower)) continue;
    if (/child with bed|child without bed|single occupancy|infant \(below/i.test(lower)) continue;

    const totalCount = extractLabelCount(line, ["travellers?", "travelers?", "guests?", "pax", "persons?"]);
    const adults = extractLabelCount(line, ["adults?"]);
    const children = extractLabelCount(line, ["children?", "child"]);
    const infants = extractLabelCount(line, ["infants?"]);
    const total =
      totalCount != null ? totalCount :
      adults != null || children != null || infants != null
        ? [adults, children, infants].reduce((s: number, value) => s + (value ?? 0), 0)
        : null;

    if (total == null) continue;
    candidates.push({ total, adults, children, infants, conflict: false });
  }

  if (candidates.length === 0) {
    return { total: null, adults: null, children: null, infants: null, conflict: false };
  }

  const last = candidates[candidates.length - 1];
  const distinctTotals = new Set(candidates.map((candidate) => JSON.stringify(candidate)));
  return { ...last, conflict: distinctTotals.size > 1 };
}

function normalizeTravelDates(parsed: ParsedItineraryExtraction, rawText: string, now: Date) {
  const start = parseIsoDate(parsed.travel_start_date);
  const end = parseIsoDate(parsed.travel_end_date);
  const expectedTripSpan = parsed.duration_days != null
    ? Math.max(0, parsed.duration_days - 1)
    : parsed.duration_nights != null
      ? Math.max(0, parsed.duration_nights)
      : null;

  const lowerRawText = rawText.toLowerCase();
  const hasAvailabilityWindowHints = /\btravel periods?\b|\btravel window\b|\bvalid(?:ity| till)\b|\boffer valid\b|\bavailable from\b/.test(lowerRawText);

  if (start && end) {
    const actualSpan = diffDays(start, end);
    const obviouslyWindowBased =
      actualSpan > 21 &&
      (
        hasAvailabilityWindowHints ||
        (expectedTripSpan != null && actualSpan > expectedTripSpan + 5)
      );

    if (obviouslyWindowBased) {
      parsed.travel_start_date = null;
      parsed.travel_end_date = null;
      markMissing(parsed, "travel_start_date");
      markMissing(parsed, "travel_end_date");
      appendWarning(parsed, "Detected an availability window instead of exact trip dates. Exact travel dates are still missing.");
      return;
    }
  }

  if ((start || end) && hasAvailabilityWindowHints && expectedTripSpan == null) {
    parsed.travel_start_date = null;
    parsed.travel_end_date = null;
    markMissing(parsed, "travel_start_date");
    markMissing(parsed, "travel_end_date");
    appendWarning(parsed, "Date text looks like an offer or availability window, not a confirmed trip date.");
    return;
  }

  if (start && start < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))) {
    appendWarning(parsed, "Visible departure date is already in the past. Please confirm whether this is an old quote or archived departure.");
  }
}

export function normalizeItineraryExtraction(
  parsedInput: Record<string, unknown>,
  rawText: string,
  now: Date = new Date(),
): ParsedItineraryExtraction {
  const parsed = structuredClone(parsedInput) as ParsedItineraryExtraction;
  const fallbackTextCorpus = buildFallbackTextCorpus(parsed, rawText);
  const lowerFallbackCorpus = fallbackTextCorpus.toLowerCase();

  parsed.hotel_names = uniqueStrings(parsed.hotel_names ?? []);
  parsed.airline_names = uniqueStrings(parsed.airline_names ?? []);
  parsed.sectors = uniqueStrings(parsed.sectors ?? []);
  parsed.additional_destinations = uniqueStrings(parsed.additional_destinations ?? []);
  parsed.missing_fields = uniqueStrings(parsed.missing_fields ?? []);
  parsed.extraction_warnings = uniqueStrings(parsed.extraction_warnings ?? []);

  const fallbackHotels = extractHotelNamesFromText(fallbackTextCorpus);
  if (fallbackHotels.length > 0) {
    parsed.hotel_names = uniqueStrings([...(parsed.hotel_names ?? []), ...fallbackHotels]);
    clearMissing(parsed, "hotel_names");
  } else if ((parsed.hotel_names ?? []).length === 0 && /\baccommodation\b|\bhotel\b|\bstay\b|\broom\b/.test(lowerFallbackCorpus)) {
    appendWarning(parsed, "Accommodation is mentioned, but the exact hotel names are still not visible in the material.");
    markMissing(parsed, "hotel_names");
  }

  {
    const fallbackTravelerBreakdown = extractTravelerBreakdown(fallbackTextCorpus);
    if (fallbackTravelerBreakdown.total != null) {
      parsed.traveller_count_total = parsed.traveller_count_total ?? fallbackTravelerBreakdown.total;
      parsed.adults_count = parsed.adults_count ?? fallbackTravelerBreakdown.adults;
      parsed.children_count = parsed.children_count ?? fallbackTravelerBreakdown.children;
      parsed.infants_count = parsed.infants_count ?? fallbackTravelerBreakdown.infants;
      clearMissing(parsed, "traveller_count_total");
      clearMissing(parsed, "adults_count");
      if (parsed.children_count != null) clearMissing(parsed, "children_count");
      if (parsed.infants_count != null) clearMissing(parsed, "infants_count");
      if (fallbackTravelerBreakdown.conflict) {
        appendWarning(parsed, "Multiple traveler-count values were found. The latest explicit count was used.");
      }
    }
  }

  normalizeTravelDates(parsed, fallbackTextCorpus, now);

  return parsed;
}
