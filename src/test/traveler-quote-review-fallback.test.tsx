import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelerAnalysisResults from "@/components/travelers/TravelerAnalysisResults";
import TravelerQuoteUploader from "@/components/travelers/TravelerQuoteUploader";
import type { ItineraryAnalysis } from "@/lib/itinerary-analysis-service";

const {
  createLeadWithDedupMock,
  uploadQuoteFileMock,
  uploadLeadAttachmentMock,
  logLeadCreatedMock,
  triggerItineraryAnalysisMock,
  trackTravelerQuoteUploadMock,
  trackTravelerUnlockSubmitMock,
  trackQuoteAnalysisRequestedMock,
  validateFileMock,
  captureTravelerContactMock,
} = vi.hoisted(() => ({
  createLeadWithDedupMock: vi.fn(),
  uploadQuoteFileMock: vi.fn(),
  uploadLeadAttachmentMock: vi.fn(),
  logLeadCreatedMock: vi.fn(),
  triggerItineraryAnalysisMock: vi.fn(),
  trackTravelerQuoteUploadMock: vi.fn(),
  trackTravelerUnlockSubmitMock: vi.fn(),
  trackQuoteAnalysisRequestedMock: vi.fn(),
  validateFileMock: vi.fn(),
  captureTravelerContactMock: vi.fn(),
}));

vi.mock("framer-motion", () => {
  const MockDiv = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    ),
  );

  return {
    motion: new Proxy(
      {},
      {
        get: () => MockDiv,
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("@/lib/leads-service", () => ({
  createLeadWithDedup: createLeadWithDedupMock,
  uploadQuoteFile: uploadQuoteFileMock,
}));

vi.mock("@/lib/attachments-service", () => ({
  uploadLeadAttachment: uploadLeadAttachmentMock,
}));

vi.mock("@/lib/activity-service", () => ({
  logLeadCreated: logLeadCreatedMock,
}));

vi.mock("@/lib/itinerary-analysis-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/itinerary-analysis-service")>(
    "@/lib/itinerary-analysis-service",
  );

  return {
    ...actual,
    triggerItineraryAnalysis: triggerItineraryAnalysisMock,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackTravelerQuoteUpload: trackTravelerQuoteUploadMock,
  trackTravelerUnlockSubmit: trackTravelerUnlockSubmitMock,
  trackQuoteAnalysisRequested: trackQuoteAnalysisRequestedMock,
}));

vi.mock("@/lib/upload-validation", () => ({
  validateFile: validateFileMock,
  sampleAcceptedFiles: ["Trip PDF", "WhatsApp screenshot"],
}));

vi.mock("@/lib/traveler-contact-service", () => ({
  captureTravelerContact: captureTravelerContactMock,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: () => ({
          data: { publicUrl: "https://example.com/lead-attachment.pdf" },
        }),
      }),
    },
  },
}));

function makeAnalysis(overrides: Partial<ItineraryAnalysis> = {}): ItineraryAnalysis {
  return {
    id: "analysis-1",
    lead_id: "lead-1",
    attachment_id: null,
    created_at: "2026-04-14T10:00:00.000Z",
    updated_at: "2026-04-14T10:00:00.000Z",
    uploaded_by_audience: "traveler",
    raw_text: null,
    parsing_confidence: "medium",
    domestic_or_international: null,
    destination_country: null,
    destination_city: null,
    travel_start_date: null,
    travel_end_date: null,
    duration_nights: null,
    duration_days: null,
    total_price: null,
    price_per_person: null,
    currency: "INR",
    traveller_count_total: null,
    adults_count: null,
    children_count: null,
    infants_count: null,
    travel_agent_name: null,
    customer_name: null,
    hotel_names_json: [],
    airline_names_json: [],
    sectors_json: [],
    additional_destinations_json: [],
    inclusions_text: null,
    exclusions_text: null,
    visa_mentioned: null,
    insurance_mentioned: null,
    emi_candidate: false,
    insurance_candidate: false,
    pg_candidate: false,
    missing_fields_json: [],
    extracted_snippets_json: [],
    extracted_fields_json: {},
    file_count: 1,
    file_names_json: ["trip.pdf"],
    extraction_warnings_json: [],
    flight_departure_time: null,
    flight_arrival_time: null,
    hotel_check_in: null,
    hotel_check_out: null,
    confidence_notes: null,
    package_mode: "unknown",
    extracted_completeness_score: null,
    advisory_summary: null,
    advisory_insights_json: [],
    traveler_questions_json: [],
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

describe("traveler quote review fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateFileMock.mockReturnValue({ valid: true });
    uploadQuoteFileMock.mockResolvedValue({ url: "https://example.com/uploaded.pdf" });
    createLeadWithDedupMock.mockResolvedValue({
      lead: { id: "lead-1" },
      isDuplicate: false,
    });
    uploadLeadAttachmentMock.mockResolvedValue({
      storage_path: "lead-1/maldives.pdf",
    });
    logLeadCreatedMock.mockResolvedValue(undefined);
    triggerItineraryAnalysisMock.mockResolvedValue(null);
  });

  it("shows a graceful manual review fallback when no structured analysis is available", () => {
    render(
      <TravelerAnalysisResults
        analysis={null}
        files={[new File(["trip"], "maldives-itinerary.pdf", { type: "application/pdf" })]}
        onUnlock={vi.fn()}
        onAddMore={vi.fn()}
        onReanalyze={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("We understood you're planning a trip")).toBeInTheDocument();
    expect(
      screen.getByText(/automatic review could not fully identify all the trip details/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with our team/i })).toBeInTheDocument();
    expect(screen.getByText("Trip document received")).toBeInTheDocument();
  });

  it("uses the partial-readable recovery state when the itinerary has meaningful travel clues", () => {
    render(
      <TravelerAnalysisResults
        analysis={makeAnalysis({
          duration_nights: 4,
          duration_days: 5,
          inclusions_text: "Male airport transfers, resort stay, snorkelling excursion",
          parsing_confidence: "low",
        })}
        files={[new File(["trip"], "maldives-itinerary.pdf", { type: "application/pdf" })]}
        onUnlock={vi.fn()}
        onAddMore={vi.fn()}
        onReanalyze={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Here’s what we already understood")).toBeInTheDocument();
    expect(screen.getByText(/Duration clue: 4N \/ 5D/i)).toBeInTheDocument();
    expect(screen.getByText(/Which month are you hoping to travel\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip this and continue with our team/i })).toBeInTheDocument();
  });

  it("keeps the traveler in a recoverable review flow when itinerary analysis fails", async () => {
    triggerItineraryAnalysisMock.mockRejectedValue(new Error("edge function failed"));

    const { container } = render(<TravelerQuoteUploader />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["%PDF-1.4"], "maldives-itinerary.pdf", { type: "application/pdf" });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /review my trip/i }));

    expect(await screen.findByText("We understood you're planning a trip")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with our team/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(createLeadWithDedupMock).toHaveBeenCalledWith(
        expect.objectContaining({
          lead_source_page: "for-travelers",
          lead_source_type: "itinerary_upload",
          metadata_json: expect.objectContaining({
            anonymous_intent: true,
            lead_capture_classification: "anonymous_upload",
          }),
        }),
      );
    });
  });

  it("requires mobile capture before re-analyzing extra files after the first useful readback", async () => {
    triggerItineraryAnalysisMock.mockResolvedValue(
      makeAnalysis({
        destination_city: "Maldives",
        parsing_confidence: "medium",
        duration_nights: 4,
        duration_days: 5,
        total_price: 185000,
        extracted_completeness_score: 46,
        next_inputs_needed_json: [
          {
            label: "Share your travel month",
            reason: "We need your month of travel to tighten timing and budget checks.",
            priority: "high",
          },
        ],
      }),
    );

    const { container } = render(<TravelerQuoteUploader />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["%PDF-1.4"], "maldives-itinerary.pdf", { type: "application/pdf" });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /review my trip/i }));

    expect(await screen.findByText("What's Missing")).toBeInTheDocument();

    const fileInputs = container.querySelectorAll('input[type="file"]');
    const addMoreInput = fileInputs[fileInputs.length - 1] as HTMLInputElement;
    const extraFile = new File(["image"], "travel-dates.png", { type: "image/png" });

    fireEvent.change(addMoreInput, {
      target: { files: [extraFile] },
    });

    fireEvent.click(screen.getByRole("button", { name: /re-analyze/i }));

    expect(await screen.findByText("Keep refining this trip")).toBeInTheDocument();
    expect(triggerItineraryAnalysisMock).toHaveBeenCalledTimes(1);
    expect(uploadLeadAttachmentMock).toHaveBeenCalledTimes(1);
  });
});
