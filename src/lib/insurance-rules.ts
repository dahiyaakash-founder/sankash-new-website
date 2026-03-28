/**
 * ─── Temporary provisional rules based on current Lakshay-shared product materials. ───
 * ─── Replace with final approved sheets before launch. ───
 *
 * This module provides destination detection, trip-type classification,
 * duration-band pricing, and benefit summaries for the quote-review
 * insurance card. Architecture is config-driven so swapping the data
 * sources later requires no component changes.
 */

// ── Trip type ──────────────────────────────────────────────────────

export type TripType = "domestic" | "international";
export type InternationalZone = "us-canada" | "rest-of-world";

// ── Destination detection ──────────────────────────────────────────

const INTERNATIONAL_SIGNALS: string[] = [
  // countries / regions
  "dubai", "thailand", "bali", "singapore", "maldives", "mauritius",
  "sri lanka", "vietnam", "japan", "london", "paris", "europe",
  "australia", "new zealand", "south africa", "kenya", "egypt",
  "turkey", "greece", "italy", "spain", "germany", "switzerland",
  "france", "uk", "united kingdom", "indonesia", "malaysia",
  "philippines", "cambodia", "nepal", "bhutan", "myanmar",
  "hong kong", "china", "korea", "taiwan", "mexico", "brazil",
  "caribbean", "fiji", "seychelles", "oman", "bahrain", "qatar",
  "saudi", "abu dhabi", "usa", "us", "canada", "america",
  "new york", "los angeles", "san francisco", "toronto", "vancouver",
  // travel clues
  "visa", "passport", "forex", "foreign exchange", "international",
  "overseas", "abroad",
];

const US_CANADA_SIGNALS: string[] = [
  "usa", "us", "united states", "america", "canada",
  "new york", "los angeles", "san francisco", "chicago", "miami",
  "toronto", "vancouver", "montreal", "washington",
];

const DOMESTIC_SIGNALS: string[] = [
  "goa", "kerala", "manali", "shimla", "kashmir", "rajasthan",
  "andaman", "leh", "ladakh", "uttarakhand", "himachal",
  "ooty", "munnar", "coorg", "darjeeling", "sikkim",
  "varanasi", "jaipur", "udaipur", "jodhpur", "agra",
  "rishikesh", "haridwar", "meghalaya", "assam", "domestic",
  "india", "indian",
];

// ── Duration detection ─────────────────────────────────────────────

/** Try to extract trip duration in days from filename signals */
export function detectDuration(text: string): number | null {
  const lower = text.toLowerCase().replace(/[-_]/g, " ");

  // "5 nights" or "5n" or "5 days" or "5d"
  const nightMatch = lower.match(/(\d{1,2})\s*(?:nights?|n\b)/);
  if (nightMatch) return parseInt(nightMatch[1], 10) + 1; // nights → days

  const dayMatch = lower.match(/(\d{1,2})\s*(?:days?|d\b)/);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  // "5n4d" or "5n/4d"
  const combo = lower.match(/(\d{1,2})n\s*[\/]?\s*(\d{1,2})d/);
  if (combo) return parseInt(combo[1], 10) + 1;

  return null;
}

/** Detect trip type from filename / text signals */
export function detectTripType(text: string): {
  tripType: TripType;
  zone: InternationalZone | null;
} {
  const lower = text.toLowerCase().replace(/[-_]/g, " ");

  const hasInternational = INTERNATIONAL_SIGNALS.some((s) => lower.includes(s));
  const hasDomestic = DOMESTIC_SIGNALS.some((s) => lower.includes(s));

  // If both present, international takes priority (e.g. "India to Dubai")
  if (hasInternational) {
    const isUSCanada = US_CANADA_SIGNALS.some((s) => lower.includes(s));
    return { tripType: "international", zone: isUSCanada ? "us-canada" : "rest-of-world" };
  }

  // Default to domestic
  return { tripType: hasDomestic ? "domestic" : "domestic", zone: null };
}

// ── Pricing bands (provisional) ────────────────────────────────────

export interface PricingBand {
  maxDays: number;
  label: string;
  startingFrom: number; // INR per traveller
}

/**
 * Domestic duration pricing bands (provisional).
 * Source: current domestic plan material shared by Lakshay.
 */
export const DOMESTIC_PRICING_BANDS: PricingBand[] = [
  { maxDays: 4,  label: "1–4 days",   startingFrom: 59 },
  { maxDays: 7,  label: "5–7 days",   startingFrom: 99 },
  { maxDays: 10, label: "8–10 days",  startingFrom: 149 },
  { maxDays: 15, label: "11–15 days", startingFrom: 199 },
  { maxDays: 30, label: "16–30 days", startingFrom: 299 },
];

/**
 * International duration pricing bands — Rest of World (provisional).
 * Source: current Super Saver international material.
 */
export const INTL_ROW_PRICING_BANDS: PricingBand[] = [
  { maxDays: 7,  label: "up to 7 days",  startingFrom: 399 },
  { maxDays: 10, label: "up to 10 days", startingFrom: 549 },
  { maxDays: 15, label: "up to 15 days", startingFrom: 699 },
  { maxDays: 21, label: "up to 21 days", startingFrom: 899 },
  { maxDays: 30, label: "up to 30 days", startingFrom: 1099 },
  { maxDays: 45, label: "up to 45 days", startingFrom: 1499 },
];

/**
 * International duration pricing bands — US / Canada (provisional).
 */
export const INTL_USC_PRICING_BANDS: PricingBand[] = [
  { maxDays: 7,  label: "up to 7 days",  startingFrom: 799 },
  { maxDays: 10, label: "up to 10 days", startingFrom: 999 },
  { maxDays: 15, label: "up to 15 days", startingFrom: 1299 },
  { maxDays: 21, label: "up to 21 days", startingFrom: 1599 },
  { maxDays: 30, label: "up to 30 days", startingFrom: 1999 },
  { maxDays: 45, label: "up to 45 days", startingFrom: 2499 },
];

function findBand(bands: PricingBand[], days: number): PricingBand | null {
  return bands.find((b) => days <= b.maxDays) ?? bands[bands.length - 1];
}

// ── Benefit summaries ──────────────────────────────────────────────

export const DOMESTIC_BENEFITS = [
  "Trip cancellation",
  "Medical & hospitalisation for injury",
  "Medical evacuation",
  "Checked-in baggage loss & delay",
  "Personal accident",
];

export const INTERNATIONAL_BENEFITS = [
  "Medical & hospitalisation",
  "Trip cancellation",
  "Baggage loss & delay",
  "Medical evacuation & repatriation",
  "Missed connection & carrier delay",
  "Personal accident & liability",
];

// ── Insurance insight generator ────────────────────────────────────

export interface InsuranceInsight {
  headline: string;
  detail: string;
}

/**
 * Generate the insurance card content for the review panel.
 * Uses filename signals only (provisional — will use parsed content later).
 */
export function getInsuranceInsight(fileName: string): InsuranceInsight {
  const { tripType, zone } = detectTripType(fileName);
  const duration = detectDuration(fileName);

  if (tripType === "international") {
    const bands = zone === "us-canada" ? INTL_USC_PRICING_BANDS : INTL_ROW_PRICING_BANDS;

    if (duration) {
      const band = findBand(bands, duration);
      if (band) {
        return {
          headline: "International travel protection can be added",
          detail: `Medical, cancellation and baggage cover starting from ₹${band.startingFrom} per traveller`,
        };
      }
    }

    return {
      headline: "International travel protection can be added",
      detail: "Medical, cancellation and baggage cover can be added for overseas travel",
    };
  }

  // Domestic
  if (duration) {
    const band = findBand(DOMESTIC_PRICING_BANDS, duration);
    if (band) {
      return {
        headline: "Domestic travel protection can be added",
        detail: `Cancellation, medical and baggage cover starting from ₹${band.startingFrom} per traveller`,
      };
    }
  }

  return {
    headline: "Domestic travel protection can be added",
    detail: "Relevant cancellation and travel protection options can be added to this trip",
  };
}

/**
 * Generate the insurance card for the agent review panel.
 * Framed as a revenue opportunity.
 */
export function getAgentInsuranceInsight(fileName: string): InsuranceInsight {
  const { tripType, zone } = detectTripType(fileName);
  const duration = detectDuration(fileName);

  if (tripType === "international") {
    const bands = zone === "us-canada" ? INTL_USC_PRICING_BANDS : INTL_ROW_PRICING_BANDS;

    if (duration) {
      const band = findBand(bands, duration);
      if (band) {
        return {
          headline: "Insurance add-on revenue opportunity detected",
          detail: `International protection from ₹${band.startingFrom}/traveller can be offered at checkout`,
        };
      }
    }

    return {
      headline: "Insurance add-on revenue opportunity detected",
      detail: "International medical, cancellation and baggage protection can be offered",
    };
  }

  // Domestic
  if (duration) {
    const band = findBand(DOMESTIC_PRICING_BANDS, duration);
    if (band) {
      return {
        headline: "Protection products may be relevant",
        detail: `Domestic cover from ₹${band.startingFrom}/traveller — trip cancellation, medical and baggage`,
      };
    }
  }

  return {
    headline: "Protection products may be relevant",
    detail: "Domestic trip cancellation, medical and baggage cover can be added",
  };
}
