import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

const {
  saveAgentQuoteReviewLead,
  createLeadWithDedup,
  uploadLeadAttachment,
  refreshLeadTripIntelligence,
  toastSuccess,
  toastError,
} = vi.hoisted(() => ({
  saveAgentQuoteReviewLead: vi.fn(),
  createLeadWithDedup: vi.fn(),
  uploadLeadAttachment: vi.fn(),
  refreshLeadTripIntelligence: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/agent-quote-review-service", () => ({
  saveAgentQuoteReviewLead,
}));

vi.mock("@/lib/upload-validation", () => ({
  validateFile: vi.fn(() => ({ valid: true })),
  assessTravelConfidence: vi.fn(() => ({ confidence: "high" })),
  sampleAcceptedFiles: ["holiday-quote.pdf"],
}));

vi.mock("@/lib/insurance-rules", () => ({
  getAgentInsuranceInsight: vi.fn(() => ({
    headline: "Protection products may be relevant",
    detail: "Attach travel protection to increase ancillary revenue on this itinerary",
  })),
}));

vi.mock("@/lib/analytics", () => ({
  trackAgentQuoteUpload: vi.fn(),
  trackQuoteAnalysisRequested: vi.fn(),
}));

vi.mock("@/lib/leads-service", () => ({
  createLeadWithDedup,
}));

vi.mock("@/lib/attachments-service", () => ({
  uploadLeadAttachment,
}));

vi.mock("@/lib/lead-trip-intelligence-service", () => ({
  refreshLeadTripIntelligence,
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

vi.mock("framer-motion", () => {
  const motion = new Proxy(
    {},
    {
      get: () =>
        React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) => (
          <div ref={ref as React.Ref<HTMLDivElement>} {...props}>
            {children}
          </div>
        )),
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import ItineraryUploader from "@/components/agents/ItineraryUploader";
import BuildMyTrip from "@/components/travelers/BuildMyTrip";

describe("agent itinerary upload and build-my-trip submission", () => {
  beforeEach(() => {
    vi.useRealTimers();
    saveAgentQuoteReviewLead.mockReset();
    createLeadWithDedup.mockReset();
    uploadLeadAttachment.mockReset();
    refreshLeadTripIntelligence.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it("waits for agent contact details before creating an actionable quote-review lead", async () => {
    vi.useRealTimers();
    saveAgentQuoteReviewLead.mockResolvedValue({ id: "agent-lead-1" });

    const { container } = render(<ItineraryUploader />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["quote"], "goa-package.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText("Commercial Review Preview", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(saveAgentQuoteReviewLead).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /share details to unlock/i }));
    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Aakash Dahiya" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save and continue/i }));

    expect(await screen.findByText(/mobile number or email is required/i)).toBeInTheDocument();
    expect(saveAgentQuoteReviewLead).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("you@agency.com"), {
      target: { value: "akash@agency.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save and continue/i }));

    await waitFor(() => {
      expect(saveAgentQuoteReviewLead).toHaveBeenCalledWith(
        file,
        "high",
        expect.objectContaining({
          full_name: "Aakash Dahiya",
          email: "akash@agency.com",
        }),
      );
    });

    expect(await screen.findByText("Review request saved")).toBeInTheDocument();
  }, 10000);

  it("stores build-my-trip leads under itinerary_upload and gives the submitted state a live talk-to-us path", async () => {
    createLeadWithDedup.mockResolvedValue({
      lead: { id: "lead-build-trip" },
      isDuplicate: false,
    });
    uploadLeadAttachment.mockResolvedValue(null);
    refreshLeadTripIntelligence.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <BuildMyTrip />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /I know where/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));

    fireEvent.change(screen.getByPlaceholderText("e.g. Bali, Vietnam, Kashmir"), {
      target: { value: "Phuket" },
    });
    fireEvent.click(screen.getByRole("button", { name: /couple/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Next$/i }));

    fireEvent.click(screen.getByRole("button", { name: /See /i }));
    fireEvent.click(screen.getByRole("button", { name: /Shape this trip/i }));

    await waitFor(() => {
      expect(createLeadWithDedup).toHaveBeenCalled();
    });

    expect(createLeadWithDedup.mock.calls[0]?.[0]).toMatchObject({
      lead_source_type: "itinerary_upload",
      lead_source_page: "for-travelers",
      audience_type: "traveler",
    });

    expect(await screen.findByText("Trip direction saved")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Talk to us/i })).toHaveAttribute("href", "/contact");
  });
});
