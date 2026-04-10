import { describe, expect, it } from "vitest";
import {
  mergeLeadAnalysisRows,
  deriveLeadClassification,
  buildBenchmarkSummary,
  buildProductFitFlags,
  buildOpsCopilot,
} from "../../supabase/functions/_shared/lead-trip-intelligence";
import { deriveItineraryIntelligence } from "../../supabase/functions/_shared/itinerary-intelligence";

describe("lead trip intelligence backbone", () => {
  it("merges multiple analysis rows into one lead-level trip brain", () => {
    const lead = {
      id: "lead-1",
      full_name: "Riya Sharma",
      mobile_number: "9876543210",
      email: "riya@example.com",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      status: "new",
      outcome: "open",
    };

    const analyses = [
      {
        id: "analysis-2",
        created_at: "2026-04-10T10:00:00.000Z",
        parsing_confidence: "high",
        extracted_completeness_score: 76,
        destination_city: "Hanoi",
        destination_country: "Vietnam",
        domestic_or_international: "international",
        duration_days: 8,
        duration_nights: 7,
        total_price: 130000,
        currency: "INR",
        inclusions_text: "Return airfare from Bangalore, hotel stay, breakfast, visa support and transfers",
        hotel_names_json: [],
        airline_names_json: ["VietJet"],
        sectors_json: ["BLR-SGN", "HAN-BLR"],
        missing_fields_json: ["traveller_count_total", "hotel_names"],
        extraction_warnings_json: [],
      },
      {
        id: "analysis-1",
        created_at: "2026-04-10T09:00:00.000Z",
        parsing_confidence: "medium",
        extracted_completeness_score: 62,
        destination_city: "Hanoi",
        destination_country: "Vietnam",
        domestic_or_international: "international",
        hotel_names_json: ["Sen Grand Hotel or similar"],
        traveller_count_total: 4,
        adults_count: 3,
        children_count: 1,
        inclusions_text: "Final stay plan includes Sen Grand Hotel or similar with breakfast",
        missing_fields_json: [],
        extraction_warnings_json: [],
      },
    ];

    const merged = mergeLeadAnalysisRows(lead, analyses as any, [
      { id: "att-1", file_name: "brochure.pdf", category: "document" },
      { id: "att-2", file_name: "quote.png", category: "screenshot" },
    ] as any);

    expect(merged.package_mode).toBe("flights_and_hotels");
    expect(merged.hotel_names_json).toContain("Sen Grand Hotel or similar");
    expect(merged.traveller_count_total).toBe(4);
    expect(merged.analysis_count).toBe(2);
    expect(merged.attachment_count).toBe(2);
  });

  it("prioritizes ops usefulness with classification, benchmark, and pitch guidance", () => {
    const lead = {
      id: "lead-2",
      full_name: "Akash Dahiya",
      mobile_number: "9999999999",
      email: "akash@example.com",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      status: "qualified",
      outcome: "open",
    };

    const merged = mergeLeadAnalysisRows(lead, [
      {
        id: "analysis-ops",
        created_at: "2026-04-10T10:00:00.000Z",
        parsing_confidence: "high",
        extracted_completeness_score: 88,
        destination_city: "Manali",
        destination_country: "India",
        domestic_or_international: "domestic",
        duration_days: 5,
        duration_nights: 4,
        total_price: 25335,
        currency: "INR",
        hotel_names_json: ["Sun Park Boutique & Spa"],
        traveller_count_total: null,
        airline_names_json: [],
        sectors_json: [],
        inclusions_text: "Hotel, breakfast, transfer and one activity",
        exclusions_text: "Airfare, lunch, dinner, insurance",
        missing_fields_json: ["traveller_count_total"],
        extraction_warnings_json: [],
      },
    ] as any, [] as any);

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

    const classification = deriveLeadClassification(lead as any, merged, intelligence);
    const benchmarkSummary = buildBenchmarkSummary(merged, {
      benchmark_key: merged.benchmark_key,
      sample_count: 9,
      min_total_price: 18000,
      max_total_price: 22000,
      avg_total_price: 20500,
      median_total_price: 20000,
      common_hotels_json: ["Sun Park Boutique & Spa", "Snow Valley Resorts"],
      common_inclusions_json: ["breakfast", "hotel", "transfers"],
      common_exclusions_json: ["airfare", "insurance"],
      product_fit_summary_json: { emi_candidate_cases: 4 },
    } as any);
    const productFit = buildProductFitFlags(lead as any, merged, intelligence, classification, benchmarkSummary);
    const ops = buildOpsCopilot(
      lead as any,
      merged,
      intelligence,
      classification,
      benchmarkSummary,
      { match_count: 3, top_matches: [] },
      productFit,
    );

    expect(classification).toBe("sales_lead");
    expect(productFit.rebuild_candidate).toBe(true);
    expect(ops.sankash_opportunity_json.map((item: any) => item.code)).toContain("rebuild");
    expect(ops.sankash_opportunity_json.map((item: any) => item.code)).toContain("emi");
    expect(ops.call_talking_points_json.some((item: any) => String(item.body).includes("cashback"))).toBe(true);
    expect(ops.what_looks_wrong_json.some((item: any) => item.code === "benchmark_high_quote")).toBe(true);
  });
});
