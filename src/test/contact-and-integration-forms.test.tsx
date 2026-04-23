import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createLeadWithDedup } = vi.hoisted(() => ({
  createLeadWithDedup: vi.fn(),
}));

vi.mock("@/lib/leads-service", () => ({
  createLeadWithDedup,
}));

vi.mock("@/lib/analytics", () => ({
  trackContactFormSubmit: vi.fn(),
  trackDemoRequestSubmit: vi.fn(),
  trackSupportClick: vi.fn(),
  trackIntegrationQuestionSubmit: vi.fn(),
}));

vi.mock("@/components/SiteLayout", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/SEOHead", () => ({
  default: () => null,
  contactPageSchema: {},
}));

vi.mock("@/components/contact/SanKashAssistant", () => ({
  default: () => null,
}));

import Contact from "@/pages/Contact";
import IntegrationQuestionModal from "@/components/developers/IntegrationQuestionModal";

describe("contact and integration submission flows", () => {
  beforeEach(() => {
    createLeadWithDedup.mockReset();
  });

  it("renders the contact thank-you state after a valid submission", async () => {
    createLeadWithDedup.mockResolvedValue({
      lead: { id: "lead-1" },
      isDuplicate: false,
    });

    const { container } = render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>,
    );

    fireEvent.change(container.querySelector('input[name="fullName"]')!, {
      target: { value: "Akash Dahiya" },
    });
    fireEvent.change(container.querySelector('input[name="email"]')!, {
      target: { value: "akash@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    expect(await screen.findByText("Thank you!")).toBeInTheDocument();
    expect(screen.getByText("We'll be in touch within 24 hours.")).toBeInTheDocument();
  });

  it("keeps the contact form on screen and shows an error when the lead response is malformed", async () => {
    createLeadWithDedup.mockRejectedValue(new Error("Lead submission did not return a lead id."));

    const { container } = render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>,
    );

    fireEvent.change(container.querySelector('input[name="fullName"]')!, {
      target: { value: "Akash Dahiya" },
    });
    fireEvent.change(container.querySelector('input[name="email"]')!, {
      target: { value: "akash@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("shows the integration modal success state only after the lead call resolves", async () => {
    createLeadWithDedup.mockResolvedValue({
      lead: { id: "lead-2" },
      isDuplicate: false,
    });

    render(<IntegrationQuestionModal open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Akash Dahiya" },
    });
    fireEvent.change(screen.getByLabelText("Work Email"), {
      target: { value: "akash@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Question"), {
      target: { value: "Need help with checkout integration" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /send question/i }).closest("form")!);

    expect(await screen.findByText("Your question has been submitted")).toBeInTheDocument();
  });

  it("shows an inline integration error instead of crashing on malformed lead responses", async () => {
    createLeadWithDedup.mockRejectedValue(new Error("Lead submission did not return a lead id."));

    render(<IntegrationQuestionModal open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Akash Dahiya" },
    });
    fireEvent.change(screen.getByLabelText("Work Email"), {
      target: { value: "akash@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Question"), {
      target: { value: "Need help with checkout integration" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /send question/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    });
  });
});
