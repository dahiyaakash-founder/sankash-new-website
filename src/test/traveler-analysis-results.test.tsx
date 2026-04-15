import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TravelerAnalysisResults from "@/components/travelers/TravelerAnalysisResults";
import { normalizeItineraryAnalysis, type ItineraryAnalysis } from "@/lib/itinerary-analysis-service";

function makeAnalysis(overrides: Partial<ItineraryAnalysis> = {}): ItineraryAnalysis {
  return {
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
    travel_start_date: "2026-12-10",
    travel_end_date: "2026-12-15",
    duration_nights: 5,
    duration_days: 6,
    total_price: 180000,
    price_per_person: 90000,
    currency: "INR",
    traveller_count_total: 2,
    adults_count: 2,
    children_count: null,
    infants_count: null,
    travel_agent_name: null,
    customer_name: null,
    hotel_names_json: ["Sunset Resort Phuket"],
    airline_names_json: ["IndiGo"],
    sectors_json: ["DEL-HKT"],
    additional_destinations_json: [],
    inclusions_text: "Hotel stay, breakfast, airport transfers",
    exclusions_text: "Travel insurance",
    visa_mentioned: false,
    insurance_mentioned: false,
    emi_candidate: true,
    insurance_candidate: true,
    pg_candidate: false,
    missing_fields_json: [],
    extracted_snippets_json: [],
    extracted_fields_json: {},
    file_count: 1,
    file_names_json: ["quote.pdf"],
    extraction_warnings_json: ["Travel insurance not visible in the quote."],
    flight_departure_time: null,
    flight_arrival_time: null,
    hotel_check_in: null,
    hotel_check_out: null,
    confidence_notes: null,
    package_mode: "flights_and_hotels",
    extracted_completeness_score: 78,
    advisory_summary: "This looks like a Phuket couple trip with a visible stay and package price.",
    advisory_insights_json: [
      {
        title: "Insurance not visible",
        description: "Travel insurance is not clearly part of this quote.",
        severity: "warning",
        category: "coverage",
      },
    ],
    traveler_questions_json: [
      {
        code: "seller_insurance",
        question: "Is travel insurance included or separate?",
        why: "That changes the real trip cost and protection coverage.",
        priority: "medium",
      },
    ],
    seller_questions_json: [],
    next_inputs_needed_json: [],
    unlockable_modules_json: [],
    enrichment_status_json: {},
    decision_flags_json: {},
    traveler_output_json: {},
    pain_signals_json: [],
    pleasure_signals_json: [],
    customer_conversion_json: {},
    optional_missing_prompts_json: [],
    inspiration_capture_json: {},
    ...overrides,
  };
}

describe("TravelerAnalysisResults", () => {
  it("routes null analysis into the manual-review fallback instead of a dead unreadable wall", () => {
    render(
      <TravelerAnalysisResults
        analysis={null}
        files={[new File(["quote"], "maldives.pdf", { type: "application/pdf" })]}
        onUnlock={vi.fn()}
        onAddMore={vi.fn()}
        onReanalyze={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("We understood you're planning a trip")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with our team/i })).toBeInTheDocument();
    expect(screen.queryByText("We couldn't read your trip details")).not.toBeInTheDocument();
  });

  it("keeps sparse Maldives-style travel content in the manual-review fallback with visible clues", () => {
    render(
      <TravelerAnalysisResults
        analysis={makeAnalysis({
          destination_city: null,
          destination_country: null,
          total_price: null,
          price_per_person: null,
          travel_start_date: null,
          travel_end_date: null,
          duration_nights: 4,
          duration_days: 5,
          airline_names_json: [],
          sectors_json: ["MLE"],
          inclusions_text: "Water villa stay, speedboat transfers, snorkelling, sunset cruise",
          extracted_completeness_score: 12,
          parsing_confidence: "low",
        })}
        files={[new File(["quote"], "maldives.pdf", { type: "application/pdf" })]}
        onUnlock={vi.fn()}
        onAddMore={vi.fn()}
        onReanalyze={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("We understood you're planning a trip")).toBeInTheDocument();
    expect(screen.getByText(/Duration clue: 4N \/ 5D/i)).toBeInTheDocument();
    expect(screen.getByText(/Visible in plan:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with our team/i })).toBeInTheDocument();
    expect(screen.queryByText("We couldn't read your trip details")).not.toBeInTheDocument();
  });

  it("renders backend-shaped traveler question objects without crashing the success view", () => {
    render(
      <TravelerAnalysisResults
        analysis={makeAnalysis()}
        files={[new File(["quote"], "quote.pdf", { type: "application/pdf" })]}
        onUnlock={vi.fn()}
        onAddMore={vi.fn()}
        onReanalyze={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Quote Review")).toBeInTheDocument();
    expect(screen.getByText("Ask Before Booking")).toBeInTheDocument();
    expect(screen.getByText("Is travel insurance included or separate?")).toBeInTheDocument();
    expect(screen.getByText("That changes the real trip cost and protection coverage.")).toBeInTheDocument();
  });

  it("renders safely when backend traveler payloads arrive in mixed shapes", () => {
    const analysis = normalizeItineraryAnalysis({
      analysis: {
        ...makeAnalysis(),
        advisory_insights_json: "Insurance still needs a closer look",
        traveler_questions_json: "Is airport transfer included?",
        next_inputs_needed_json: { label: "Add exact dates", reason: "Dates are still unclear", priority: "high" },
        unlockable_modules_json: { code: "emi_affordability", label: "EMI & affordability", reason: "Trip price is visible.", status: "ready" },
        extraction_warnings_json: [{ message: "Hotel names are still vague." }],
        pain_signals_json: null,
        pleasure_signals_json: null,
        optional_missing_prompts_json: null,
        customer_conversion_json: null,
        inspiration_capture_json: null,
      },
      traveler_output: {
        pain_signals: "Meal plan still looks light",
        optional_missing_prompts: { prompt: "Add your hotel page", reason: "We can judge the stay better." },
        customer_conversion: { hero_headline: "One thing is still worth checking" },
        inspiration_capture: "Share one more trip idea if you want us to improve this",
      },
    });

    render(
      <TravelerAnalysisResults
        analysis={analysis}
        files={[new File(["quote"], "quote.pdf", { type: "application/pdf" })]}
        onUnlock={vi.fn()}
        onAddMore={vi.fn()}
        onReanalyze={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Quote Review")).toBeInTheDocument();
    expect(screen.getByText("Is airport transfer included?")).toBeInTheDocument();
    expect(screen.getByText("Add your hotel page")).toBeInTheDocument();
    expect(screen.getByText("One thing is still worth checking")).toBeInTheDocument();
  });
});
