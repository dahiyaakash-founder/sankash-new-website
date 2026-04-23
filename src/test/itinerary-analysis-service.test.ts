import { describe, expect, it } from "vitest";
import { normalizeItineraryAnalysis } from "@/lib/itinerary-analysis-service";

describe("normalizeItineraryAnalysis", () => {
  it("coerces mixed backend field shapes into a stable traveler contract", () => {
    const normalized = normalizeItineraryAnalysis({
      analysis: {
        id: "analysis-1",
        lead_id: "lead-1",
        attachment_id: null,
        created_at: "2026-04-14T00:00:00.000Z",
        updated_at: "2026-04-14T00:00:00.000Z",
        uploaded_by_audience: "traveler",
        raw_text: null,
        parsing_confidence: "medium",
        domestic_or_international: "international",
        destination_country: "Thailand",
        destination_city: "Phuket",
        travel_start_date: null,
        travel_end_date: null,
        duration_nights: null,
        duration_days: null,
        total_price: 175000,
        price_per_person: null,
        currency: "INR",
        traveller_count_total: null,
        adults_count: null,
        children_count: null,
        infants_count: null,
        travel_agent_name: null,
        customer_name: null,
        hotel_names_json: "Sunset Resort Phuket",
        airline_names_json: [{ label: "IndiGo" }],
        sectors_json: null,
        additional_destinations_json: [{ title: "Phi Phi" }],
        inclusions_text: "Breakfast only",
        exclusions_text: null,
        visa_mentioned: false,
        insurance_mentioned: false,
        emi_candidate: true,
        insurance_candidate: true,
        pg_candidate: false,
        missing_fields_json: "traveller_count_total",
        extracted_snippets_json: { message: "Breakfast only" },
        extracted_fields_json: "not-an-object",
        file_count: 1,
        file_names_json: { value: "quote.pdf" },
        extraction_warnings_json: [{ message: "Hotel names are still vague." }],
        flight_departure_time: null,
        flight_arrival_time: null,
        hotel_check_in: null,
        hotel_check_out: null,
        confidence_notes: null,
        package_mode: "land_only",
        extracted_completeness_score: 46,
        advisory_summary: "A partial Phuket quote.",
        advisory_insights_json: [
          "Transport may still be missing",
          { title: "Only breakfast appears included", detail: "Lunch and dinner may be extra.", severity: "warning", category: "inclusions" },
        ],
        traveler_questions_json: [
          "Is airport transfer included?",
          { code: "traveler_count", question: "How many adults and children are traveling?", why: "This changes affordability." },
        ],
        seller_questions_json: { question: "Can you share the hotel name?" },
        next_inputs_needed_json: { label: "Add exact travel dates", reason: "Dates are still unclear", priority: "high" },
        unlockable_modules_json: { code: "emi_affordability", label: "EMI & affordability", reason: "Trip price is visible.", status: "ready" },
        enrichment_status_json: "not-an-object",
        decision_flags_json: [],
        traveler_output_json: "bad-shape",
        pain_signals_json: null,
        pleasure_signals_json: null,
        customer_conversion_json: "bad-shape",
        optional_missing_prompts_json: null,
        inspiration_capture_json: null,
      },
      traveler_output: {
        pain_signals: [{ title: "Meal plan still looks light", detail: "Only breakfast is visible." }],
        pleasure_signals: "Price is visible",
        optional_missing_prompts: { prompt: "Add the hotel page", reason: "We can judge the stay better." },
        customer_conversion: { hero_headline: "One thing is still worth checking" },
        inspiration_capture: "Share another trip idea if you want us to improve this",
      },
    });

    expect(normalized.hotel_names_json).toEqual(["Sunset Resort Phuket"]);
    expect(normalized.airline_names_json).toEqual(["IndiGo"]);
    expect(normalized.additional_destinations_json).toEqual(["Phi Phi"]);
    expect(normalized.file_names_json).toEqual(["quote.pdf"]);
    expect(normalized.extraction_warnings_json).toEqual(["Hotel names are still vague."]);
    expect(normalized.advisory_insights_json).toHaveLength(2);
    expect(normalized.traveler_questions_json[0]?.question).toBe("Is airport transfer included?");
    expect(normalized.seller_questions_json[0]?.question).toBe("Can you share the hotel name?");
    expect(normalized.next_inputs_needed_json[0]?.label).toBe("Add exact travel dates");
    expect(normalized.unlockable_modules_json[0]).toMatchObject({
      module_id: "emi_affordability",
      label: "EMI & affordability",
      available: true,
    });
    expect(normalized.pain_signals_json?.[0]?.title).toBe("Meal plan still looks light");
    expect(normalized.pleasure_signals_json?.[0]?.title).toBe("Price is visible");
    expect(normalized.optional_missing_prompts_json?.[0]?.customer_prompt).toBe("Add the hotel page");
    expect(normalized.customer_conversion_json?.hero_headline).toBe("One thing is still worth checking");
    expect(normalized.inspiration_capture_json?.prompt).toBe("Share another trip idea if you want us to improve this");
    expect(normalized.traveler_output_json).toEqual({
      pain_signals: [{ title: "Meal plan still looks light", detail: "Only breakfast is visible." }],
      pleasure_signals: "Price is visible",
      optional_missing_prompts: { prompt: "Add the hotel page", reason: "We can judge the stay better." },
      customer_conversion: { hero_headline: "One thing is still worth checking" },
      inspiration_capture: "Share another trip idea if you want us to improve this",
    });
  });
});
