import { describe, expect, it } from "vitest";
import { deriveItineraryIntelligence } from "../../supabase/functions/_shared/itinerary-intelligence";
import {
  buildLearningSignals,
  buildRecommendationEngine,
  buildIntentSignals,
  deriveIntentAssessment,
  deriveMultiItineraryInsight,
  deriveSourceLikelihoodAssessment,
} from "../../supabase/functions/_shared/trip-commercial-intelligence";
import {
  buildBenchmarkSummary,
  buildProductFitFlags,
  deriveLeadClassification,
  mergeLeadAnalysisRows,
} from "../../supabase/functions/_shared/lead-trip-intelligence";

function deriveCommercialCase(lead: any, analyses: any[], attachments: any[] = [], activity: any[] = []) {
  const merged = mergeLeadAnalysisRows(lead, analyses, attachments);
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

  const classification = deriveLeadClassification(lead, merged, intelligence);
  const multi = deriveMultiItineraryInsight({ lead, analyses, merged, intelligence });
  const intentSignals = buildIntentSignals({ lead, merged, analyses, attachments, activity });
  const benchmarkSummary = buildBenchmarkSummary(merged, {
    benchmark_key: merged.benchmark_key,
    sample_count: 7,
    weighted_sample_score: 5.5,
    min_total_price: 90000,
    max_total_price: 150000,
    avg_total_price: 120000,
    median_total_price: 118000,
    common_hotels_json: ["Sen Grand Hotel or similar", "Ramada Encore"],
    common_inclusions_json: ["flights", "hotel", "breakfast", "transfers"],
    common_exclusions_json: ["insurance", "lunch"],
    product_fit_summary_json: { emi_candidate_cases: 4 },
  } as any);
  const productFit = buildProductFitFlags(lead, merged, intelligence, classification, benchmarkSummary);
  const sourceLikelihood = deriveSourceLikelihoodAssessment({
    lead,
    analyses,
    merged,
    similarSummary: { match_count: 3, top_matches: [] },
  });
  const intent = deriveIntentAssessment({
    lead,
    merged,
    intelligence,
    classification,
    signals: intentSignals,
    multi,
    sourceLikelihood,
  });
  const recommendations = buildRecommendationEngine({
    merged,
    intelligence,
    benchmarkSummary,
    similarSummary: { match_count: 3, top_matches: [] },
    productFit,
    intent,
    multi,
    alternativeBenchmarks: [
      {
        benchmark_key: "international|bali|flights_and_hotels|medium|pair",
        destination_city: "Bali",
        destination_country: "Indonesia",
        sample_count: 5,
        weighted_sample_score: 4.2,
        avg_total_price: 99000,
      },
    ],
  });
  const learning = buildLearningSignals({
    classification,
    lead,
    merged,
    intent,
    sourceLikelihood,
  });

  return { merged, intelligence, classification, multi, intentSignals, intent, recommendations, sourceLikelihood, learning };
}

describe("trip commercial intelligence", () => {
  it("reads one multi-file analysis as the same trip multi-document case", () => {
    const lead = {
      id: "lead-multi-doc",
      full_name: "Traveler (anonymous)",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {},
    };

    const analyses = [{
      id: "analysis-1",
      created_at: "2026-04-10T10:00:00.000Z",
      parsing_confidence: "high",
      extracted_completeness_score: 82,
      destination_city: "Hanoi",
      destination_country: "Vietnam",
      domestic_or_international: "international",
      duration_days: 8,
      duration_nights: 7,
      total_price: 130000,
      file_count: 3,
      hotel_names_json: ["Sen Grand Hotel or similar"],
      airline_names_json: ["VietJet"],
      inclusions_text: "Return airfare, hotel stay, breakfast and transfers",
      exclusions_text: "Insurance and personal expenses",
    }];

    const result = deriveCommercialCase(lead, analyses, [
      { id: "att-1", file_name: "brochure.pdf", uploaded_at: "2026-04-10T10:00:00.000Z" },
      { id: "att-2", file_name: "flights.png", uploaded_at: "2026-04-10T10:01:00.000Z" },
    ]);

    expect(result.multi.multi_itinerary_type).toBe("same_trip_multi_document");
    expect(result.multi.buying_state_inference).toBe("assembling_one_trip");
  });

  it("flags multi-destination indecision clearly", () => {
    const lead = {
      id: "lead-indecision",
      full_name: "Traveler (anonymous)",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {},
    };

    const analyses = [
      {
        id: "analysis-a",
        created_at: "2026-04-10T10:00:00.000Z",
        parsing_confidence: "medium",
        extracted_completeness_score: 55,
        destination_city: "Bali",
        destination_country: "Indonesia",
        domestic_or_international: "international",
        total_price: 140000,
      },
      {
        id: "analysis-b",
        created_at: "2026-04-10T11:00:00.000Z",
        parsing_confidence: "medium",
        extracted_completeness_score: 58,
        destination_city: "Phuket",
        destination_country: "Thailand",
        domestic_or_international: "international",
        total_price: 128000,
      },
    ];

    const result = deriveCommercialCase(lead, analyses);
    expect(result.multi.multi_itinerary_type).toBe("multi_destination_indecision");
    expect(result.intent.decision_stage).toBe("option_comparison");
    expect(result.recommendations.top_recommendations.some((item) => item.code === "destination_shortlist")).toBe(true);
  });

  it("recognizes likely price comparison for the same trip", () => {
    const lead = {
      id: "lead-price-compare",
      full_name: "Rohan Malhotra",
      mobile_number: "9999999999",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {
        traveler_intent_session: {
          viewed_traveler_page: true,
          viewed_emi_page: true,
          pages_visited_before_upload: ["/for-travelers", "/emi-calculator"],
          page_types_before_upload: ["traveler", "emi_calculator"],
          session_count: 2,
          return_visit_count: 1,
          returned_multiple_times: true,
          time_spent_before_upload_seconds: 210,
        },
      },
    };

    const analyses = [
      {
        id: "analysis-1",
        created_at: "2026-04-10T10:00:00.000Z",
        parsing_confidence: "high",
        extracted_completeness_score: 86,
        destination_city: "Hanoi",
        destination_country: "Vietnam",
        domestic_or_international: "international",
        travel_start_date: "2026-05-20",
        travel_end_date: "2026-05-27",
        duration_days: 8,
        duration_nights: 7,
        total_price: 152000,
        traveller_count_total: 2,
        travel_agent_name: "Seller A Travels",
        hotel_names_json: ["Sen Grand Hotel or similar"],
      },
      {
        id: "analysis-2",
        created_at: "2026-04-10T11:00:00.000Z",
        parsing_confidence: "high",
        extracted_completeness_score: 84,
        destination_city: "Hanoi",
        destination_country: "Vietnam",
        domestic_or_international: "international",
        travel_start_date: "2026-05-20",
        travel_end_date: "2026-05-27",
        duration_days: 8,
        duration_nights: 7,
        total_price: 129000,
        traveller_count_total: 2,
        travel_agent_name: "Seller B Holidays",
        hotel_names_json: ["Ramada Encore"],
      },
    ];

    const result = deriveCommercialCase(lead, analyses);
    expect(["same_trip_multi_seller", "same_destination_price_comparison"]).toContain(result.multi.multi_itinerary_type);
    expect(result.intent.conversion_probability_band).toBe("high");
    expect(result.recommendations.recommended_products.some((item) => item.code === "no_cost_emi" || item.code === "emi")).toBe(true);
  });

  it("keeps anonymous brochure-like uploads as research signals, not sales truth", () => {
    const lead = {
      id: "lead-anon",
      full_name: "Traveler (anonymous)",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {},
    };

    const analyses = [{
      id: "analysis-1",
      created_at: "2026-04-10T10:00:00.000Z",
      parsing_confidence: "medium",
      extracted_completeness_score: 48,
      destination_city: "Goa",
      destination_country: "India",
      domestic_or_international: "domestic",
      duration_days: 4,
      duration_nights: 3,
      price_per_person: 7999,
      inclusions_text: "Breakfast and transfers included",
      exclusions_text: "Flights, GST, insurance, lunch and dinner not included",
      hotel_names_json: [],
    }];

    const result = deriveCommercialCase(lead, analyses);
    expect(result.classification).toBe("research_lead");
    expect(result.learning.learning_signal_class).not.toBe("sales_signal");
    expect(["public_brochure_or_ota", "benchmark_or_test_upload", "unclear"]).toContain(result.sourceLikelihood.likely_source_profile);
    expect(["low", "medium"]).toContain(result.intent.conversion_probability_band);
  });

  it("scores a strong high-intent lead with a close-ready pitch", () => {
    const lead = {
      id: "lead-high-intent",
      full_name: "Megha Gupta",
      mobile_number: "9898989898",
      email: "megha@example.com",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {
        traveler_intent_session: {
          viewed_traveler_page: true,
          viewed_emi_page: true,
          viewed_emi_section: true,
          pages_visited_before_upload: ["/for-travelers", "/emi-calculator"],
          page_types_before_upload: ["traveler", "emi_calculator"],
          session_count: 2,
          return_visit_count: 1,
          returned_multiple_times: true,
          time_spent_before_upload_seconds: 320,
        },
      },
    };

    const analyses = [{
      id: "analysis-1",
      created_at: "2026-04-10T10:00:00.000Z",
      parsing_confidence: "high",
      extracted_completeness_score: 92,
      destination_city: "Bali",
      destination_country: "Indonesia",
      domestic_or_international: "international",
      travel_start_date: "2026-04-28",
      travel_end_date: "2026-05-04",
      duration_days: 7,
      duration_nights: 6,
      total_price: 189900,
      price_per_person: 94950,
      traveller_count_total: 2,
      adults_count: 2,
      hotel_names_json: ["Courtyard Seminyak"],
      airline_names_json: ["Singapore Airlines"],
      inclusions_text: "Flights, hotel, breakfast, airport transfers and visa support included",
      exclusions_text: "Insurance and lunch not included",
    }];

    const result = deriveCommercialCase(lead, analyses, [], [
      { activity_type: "traveler_contact_captured", created_at: "2026-04-10T11:00:00.000Z" },
    ]);

    expect(result.classification).toBe("sales_lead");
    expect(result.intent.conversion_probability_band).toBe("high");
    expect(["booking_ready", "financing_evaluation"]).toContain(result.intent.decision_stage);
    expect(result.learning.learning_signal_class).toBe("sales_signal");
  });

  it("uses source-likelihood as an explicit intent signal", () => {
    const anonymousLead = {
      id: "lead-brochure",
      full_name: "Traveler (anonymous)",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {},
    };

    const brochureAnalyses = [{
      id: "analysis-brochure",
      created_at: "2026-04-10T10:00:00.000Z",
      parsing_confidence: "medium",
      extracted_completeness_score: 52,
      destination_city: "Goa",
      destination_country: "India",
      domestic_or_international: "domestic",
      duration_days: 4,
      duration_nights: 3,
      price_per_person: 7999,
      inclusions_text: "Holiday package, breakfast included, itinerary highlights, package cost includes transfers",
      exclusions_text: "Flights, lunch, dinner, GST and insurance not included. Terms and conditions apply.",
    }];

    const salesLead = {
      id: "lead-seller-quote",
      full_name: "Rohan Sharma",
      mobile_number: "9999999999",
      email: "rohan@example.com",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
      metadata_json: {
        traveler_intent_session: {
          session_count: 2,
          return_visit_count: 1,
          returned_multiple_times: true,
          viewed_emi_page: true,
          time_spent_before_upload_seconds: 160,
        },
      },
    };

    const sellerAnalyses = [{
      id: "analysis-seller-quote",
      created_at: "2026-04-10T11:00:00.000Z",
      parsing_confidence: "high",
      extracted_completeness_score: 88,
      destination_city: "Hanoi",
      destination_country: "Vietnam",
      domestic_or_international: "international",
      travel_start_date: "2026-05-20",
      travel_end_date: "2026-05-27",
      duration_days: 8,
      duration_nights: 7,
      total_price: 129000,
      traveller_count_total: 2,
      travel_agent_name: "Seller B Holidays",
      customer_name: "Rohan Sharma",
      inclusions_text: "Final quote for 2 passengers with return airfare, hotel, breakfast and airport transfers",
      exclusions_text: "Insurance excluded",
    }];

    const brochureCase = deriveCommercialCase(anonymousLead, brochureAnalyses);
    const sellerCase = deriveCommercialCase(salesLead, sellerAnalyses);

    expect(["public_brochure_or_ota", "benchmark_or_test_upload"]).toContain(brochureCase.sourceLikelihood.likely_source_profile);
    expect(sellerCase.sourceLikelihood.likely_source_profile).toBe("personalized_seller_quote");
    expect(sellerCase.intent.intent_score).toBeGreaterThan(brochureCase.intent.intent_score);
    expect(sellerCase.intent.recommended_pitch_angle).not.toBe("stay_light_until_real_signal");
  });
});
