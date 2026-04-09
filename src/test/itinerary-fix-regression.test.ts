import { describe, expect, it } from "vitest";
import {
  deriveItineraryIntelligence,
  type ItineraryIntelligenceInput,
} from "@/lib/itinerary-intelligence";
import {
  normalizeItineraryExtraction,
  type ParsedItineraryExtraction,
} from "@/lib/itinerary-postprocess";

const NOW = new Date("2026-04-09T00:00:00.000Z");

function toIntelligenceInput(parsed: ParsedItineraryExtraction): ItineraryIntelligenceInput {
  return {
    domestic_or_international: parsed.domestic_or_international ?? null,
    destination_country: parsed.destination_country ?? null,
    destination_city: parsed.destination_city ?? null,
    additional_destinations_json: parsed.additional_destinations ?? [],
    travel_start_date: parsed.travel_start_date ?? null,
    travel_end_date: parsed.travel_end_date ?? null,
    duration_nights: parsed.duration_nights ?? null,
    duration_days: parsed.duration_days ?? null,
    total_price: parsed.total_price ?? null,
    price_per_person: parsed.price_per_person ?? null,
    currency: parsed.currency ?? null,
    traveller_count_total: parsed.traveller_count_total ?? null,
    adults_count: parsed.adults_count ?? null,
    children_count: parsed.children_count ?? null,
    infants_count: parsed.infants_count ?? null,
    hotel_names_json: parsed.hotel_names ?? [],
    airline_names_json: parsed.airline_names ?? [],
    sectors_json: parsed.sectors ?? [],
    flight_departure_time: parsed.flight_departure_time ?? null,
    flight_arrival_time: parsed.flight_arrival_time ?? null,
    hotel_check_in: parsed.hotel_check_in ?? null,
    hotel_check_out: parsed.hotel_check_out ?? null,
    inclusions_text: parsed.inclusions_text ?? null,
    exclusions_text: parsed.exclusions_text ?? null,
    visa_mentioned: parsed.visa_mentioned ?? null,
    insurance_mentioned: parsed.insurance_mentioned ?? null,
    parsing_confidence: parsed.parsing_confidence ?? null,
    missing_fields_json: parsed.missing_fields ?? [],
    extraction_warnings_json: parsed.extraction_warnings ?? [],
  };
}

const bernWindowParsed: ParsedItineraryExtraction = {
  domestic_or_international: "international",
  destination_city: "Bern",
  destination_country: "Switzerland",
  travel_start_date: "2025-08-01",
  travel_end_date: "2026-12-22",
  duration_nights: 2,
  duration_days: 3,
  price_per_person: 1666,
  currency: "AUD",
  traveller_count_total: null,
  hotel_names: [],
  inclusions_text: "2 nights stay in Bern, breakfast daily, chocolate tour, Bern Ticket for local transport",
  exclusions_text: "Airfare, visa fees, travel insurance",
  visa_mentioned: false,
  insurance_mentioned: false,
  parsing_confidence: "medium",
  missing_fields: ["travel_start_date", "travel_end_date", "traveller_count_total", "hotel_names"],
};

const bernWindowRawText = `
Best of Bern
Travel period: 01 Aug 2025 - 22 Dec 2026
Starts and ends in Bern
2 nights stay in Bern
Breakfast daily
Chocolate tour and Bern Ticket for local transport
Exclusions: Airfare, visa fees, travel insurance
From AUD 1,666 per person
`;

describe("itinerary review fix regressions", () => {
  it("generates specific next inputs for a materially incomplete public case", () => {
    const normalized = normalizeItineraryExtraction(bernWindowParsed, bernWindowRawText, NOW);
    const intelligence = deriveItineraryIntelligence(toIntelligenceInput(normalized));
    const nextInputCodes = intelligence.next_inputs_needed_json.map((item) => item.code);

    expect(intelligence.next_inputs_needed_json.length).toBeGreaterThanOrEqual(1);
    expect(intelligence.next_inputs_needed_json.length).toBeLessThanOrEqual(3);
    expect(nextInputCodes).toEqual(
      expect.arrayContaining(["traveler_count", "travel_dates", "hotel_details"]),
    );
  });

  it("does not treat an availability window as actual travel dates", () => {
    const normalized = normalizeItineraryExtraction(bernWindowParsed, bernWindowRawText, NOW);

    expect(normalized.travel_start_date).toBeNull();
    expect(normalized.travel_end_date).toBeNull();
    expect(normalized.extraction_warnings).toEqual(
      expect.arrayContaining([
        "Detected an availability window instead of exact trip dates. Exact travel dates are still missing.",
      ]),
    );
  });

  it("adds a past-date warning without inventing future-looking timing commentary", () => {
    const vietnamParsed: ParsedItineraryExtraction = {
      domestic_or_international: "international",
      destination_city: "Hanoi",
      destination_country: "Vietnam",
      travel_start_date: "2025-10-26",
      duration_nights: 7,
      duration_days: 8,
      total_price: 130000,
      currency: "INR",
      airline_names: ["Vietnam Airlines"],
      hotel_names: [],
      inclusions_text: "Flights, hotel, breakfast, visa",
      exclusions_text: "GST, TCS, travel insurance",
      visa_mentioned: true,
      insurance_mentioned: false,
      parsing_confidence: "medium",
      missing_fields: ["traveller_count_total", "hotel_names", "hotel_check_in", "flight_arrival_time"],
    };

    const rawText = `
    Vietnam Explorer
    Departure: 26 Oct 2025
    Stay at Sen Grand Hotel or similar
    Visa included
    Travel insurance excluded
    `;

    const normalized = normalizeItineraryExtraction(vietnamParsed, rawText, NOW);
    const intelligence = deriveItineraryIntelligence(toIntelligenceInput(normalized));

    expect(normalized.extraction_warnings?.some((warning) => /already in the past/i.test(warning))).toBe(true);
    expect(
      intelligence.advisory_insights_json.every((item) =>
        !/(over a year away|months away|already departed|in the past)/i.test(item.detail),
      ),
    ).toBe(true);
  });

  it("avoids generic insurance warnings on weak domestic quotes", () => {
    const weakGoaQuote: ItineraryIntelligenceInput = {
      domestic_or_international: "domestic",
      destination_city: "Goa",
      destination_country: "India",
      duration_nights: 3,
      total_price: null,
      price_per_person: 12000,
      currency: "INR",
      inclusions_text: "3N stay, breakfast, pickup",
      exclusions_text: null,
      parsing_confidence: "low",
      missing_fields_json: ["travel_start_date", "travel_end_date", "traveller_count_total", "hotel_names"],
      extraction_warnings_json: ["Only partial seller message was visible"],
    };

    const intelligence = deriveItineraryIntelligence(weakGoaQuote);
    const advisoryCodes = intelligence.advisory_insights_json.map((item) => item.code);

    expect(advisoryCodes).not.toContain("insurance_not_visible");
  });

  it("classifies the Bern-style public stay as hotels_only instead of land_only", () => {
    const normalized = normalizeItineraryExtraction(bernWindowParsed, bernWindowRawText, NOW);
    const intelligence = deriveItineraryIntelligence(toIntelligenceInput(normalized));

    expect(intelligence.package_mode).toBe("hotels_only");
  });

  it("recovers hotel names from brochure-style raw text before hotel-dependent advice runs", () => {
    const parsed: ParsedItineraryExtraction = {
      domestic_or_international: "domestic",
      destination_city: "Goa",
      destination_country: "India",
      duration_nights: 3,
      duration_days: 4,
      total_price: 9700,
      price_per_person: 9700,
      currency: "INR",
      hotel_names: [],
      inclusions_text: "Breakfast and dinner, private AC vehicle",
      exclusions_text: "Flight not included",
      missing_fields: ["hotel_names"],
      parsing_confidence: "medium",
    };

    const rawText = `
    Goa Delight 3N/4D
    Accommodation:
    Baywatch Express Urbane
    Meals: Breakfast and dinner
    `;

    const normalized = normalizeItineraryExtraction(parsed, rawText, NOW);

    expect(normalized.hotel_names).toEqual(["Baywatch Express Urbane"]);
    expect(normalized.missing_fields).not.toContain("hotel_names");
  });

  it("recovers brochure hotel names from extracted snippets when raw PDF text is unavailable", () => {
    const parsed: ParsedItineraryExtraction = {
      domestic_or_international: "international",
      destination_city: "Hanoi",
      destination_country: "Vietnam",
      duration_nights: 7,
      duration_days: 8,
      total_price: 130000,
      price_per_person: 130000,
      currency: "INR",
      hotel_names: [],
      inclusions_text: "Accommodation with daily breakfast, all airport transfers, airfare ex Bangalore, and visa.",
      exclusions_text: "Travel insurance if not mentioned in the itinerary.",
      extracted_snippets: [
        "Accommodation: Sen Grand Hotel or similar",
        "Airfare ex Bangalore included",
      ],
      missing_fields: ["hotel_names"],
      parsing_confidence: "medium",
    };

    const normalized = normalizeItineraryExtraction(parsed, "[PDF: vietnam.pdf, 482910 bytes]", NOW);

    expect(normalized.hotel_names).toEqual(["Sen Grand Hotel or similar"]);
    expect(normalized.extraction_warnings).not.toEqual(
      expect.arrayContaining(["Accommodation is mentioned, but the exact hotel names are still not visible in the material."]),
    );
  });

  it("lets a later file enrich missing fields and records traveler-count conflicts", () => {
    const parsed: ParsedItineraryExtraction = {
      domestic_or_international: "international",
      destination_city: "Paris",
      destination_country: "France",
      travel_start_date: "2026-06-14",
      travel_end_date: "2026-06-20",
      duration_nights: 6,
      duration_days: 7,
      total_price: 260000,
      currency: "INR",
      traveller_count_total: null,
      hotel_names: [],
      airline_names: ["Air India"],
      sectors: ["DEL-CDG", "CDG-DEL"],
      inclusions_text: "Flights, hotel, breakfast",
      exclusions_text: "Visa fees extra",
      visa_mentioned: false,
      insurance_mentioned: false,
      parsing_confidence: "medium",
      missing_fields: ["traveller_count_total", "hotel_names"],
    };

    const rawText = `
    --- File 1: brochure.pdf ---
    2 Adults
    Paris summer special

    --- File 2: revised-quote.png ---
    3 Adults + 1 Child
    Stay at Mercure Paris Centre or similar
    `;

    const normalized = normalizeItineraryExtraction(parsed, rawText, NOW);
    const intelligence = deriveItineraryIntelligence(toIntelligenceInput(normalized));

    expect(normalized.traveller_count_total).toBe(4);
    expect(normalized.adults_count).toBe(3);
    expect(normalized.children_count).toBe(1);
    expect(normalized.hotel_names).toEqual(["Mercure Paris Centre or similar"]);
    expect(normalized.extraction_warnings?.some((warning) => /Multiple traveler-count values were found/i.test(warning))).toBe(true);
    expect(intelligence.next_inputs_needed_json.map((item) => item.code)).not.toContain("traveler_count");
  });

  it("uses inclusion text to keep multi-file package clarity strong even when hotel names are still missing", () => {
    const parsed: ParsedItineraryExtraction = {
      domestic_or_international: "international",
      destination_city: "Hanoi",
      destination_country: "Vietnam",
      travel_start_date: "2025-10-26",
      duration_nights: 7,
      duration_days: 8,
      total_price: 130000,
      price_per_person: 130000,
      currency: "INR",
      hotel_names: [],
      airline_names: [],
      sectors: [],
      inclusions_text: "Accommodation with daily breakfast, early check-in, all airport transfers, airfare ex Bangalore, and visa.",
      exclusions_text: "Travel insurance if not mentioned in the itinerary.",
      extracted_snippets: [
        "File 1: 7N Vietnam package",
        "File 2: accommodation and airfare ex Bangalore included",
      ],
      missing_fields: ["traveller_count_total", "hotel_names", "hotel_check_in", "hotel_check_out"],
      parsing_confidence: "medium",
    };

    const normalized = normalizeItineraryExtraction(
      parsed,
      "--- File 1: vietnam-page.txt ---\nAccommodation with daily breakfast\n--- File 2: vietnam.pdf ---\n[PDF placeholder]",
      NOW,
    );
    const intelligence = deriveItineraryIntelligence(toIntelligenceInput(normalized));

    expect(intelligence.package_mode).toBe("flights_and_hotels");
    expect(intelligence.next_inputs_needed_json.map((item) => item.code)).toEqual(
      expect.arrayContaining(["traveler_count", "hotel_details"]),
    );
    expect(intelligence.advisory_insights_json.map((item) => item.code)).not.toContain("transport_missing_from_total");
  });

  it("stays cautious on sparse domestic quotes instead of forcing land_only", () => {
    const weakGoaQuote: ItineraryIntelligenceInput = {
      domestic_or_international: "domestic",
      destination_city: "Goa",
      destination_country: "India",
      duration_nights: 3,
      total_price: null,
      price_per_person: 12000,
      currency: "INR",
      inclusions_text: "3N stay, breakfast, pickup",
      exclusions_text: null,
      parsing_confidence: "low",
      missing_fields_json: ["travel_start_date", "travel_end_date", "traveller_count_total", "hotel_names"],
      extraction_warnings_json: ["Only partial seller message was visible"],
    };

    const intelligence = deriveItineraryIntelligence(weakGoaQuote);
    const advisoryCodes = intelligence.advisory_insights_json.map((item) => item.code);

    expect(intelligence.package_mode).toBe("unknown");
    expect(advisoryCodes).not.toContain("land_only_likely");
    expect(advisoryCodes).not.toContain("transport_missing_from_total");
  });

  it("keeps a strong synthetic control clean and actionable", () => {
    const strongControl: ItineraryIntelligenceInput = {
      domestic_or_international: "international",
      destination_city: "Bali",
      destination_country: "Indonesia",
      travel_start_date: "2026-08-10",
      travel_end_date: "2026-08-16",
      duration_nights: 6,
      duration_days: 7,
      total_price: 189900,
      price_per_person: 94950,
      currency: "INR",
      traveller_count_total: 2,
      adults_count: 2,
      hotel_names_json: ["Ayodya Resort Bali"],
      airline_names_json: ["Singapore Airlines"],
      sectors_json: ["BLR-SIN", "SIN-DPS", "DPS-SIN", "SIN-BLR"],
      flight_departure_time: "23:10",
      flight_arrival_time: "10:15",
      hotel_check_in: "2026-08-10",
      hotel_check_out: "2026-08-16",
      inclusions_text: "Flights, hotel, breakfast, airport transfer, visa, insurance, full day tour",
      exclusions_text: "Lunch and dinner not included",
      visa_mentioned: true,
      insurance_mentioned: true,
      parsing_confidence: "high",
      missing_fields_json: [],
      extraction_warnings_json: [],
    };

    const intelligence = deriveItineraryIntelligence(strongControl);
    const advisoryCodes = intelligence.advisory_insights_json.map((item) => item.code);
    const decisionCodes = intelligence.decision_flags_json.map((item) => item.code);

    expect(intelligence.package_mode).toBe("flights_and_hotels");
    expect(intelligence.next_inputs_needed_json).toHaveLength(0);
    expect(advisoryCodes).not.toContain("insurance_not_visible");
    expect(decisionCodes).not.toContain("travel_dates_missing");
    expect(decisionCodes).not.toContain("price_basis_unclear");
    expect(intelligence.extracted_completeness_score).toBeGreaterThanOrEqual(80);
  });
});
