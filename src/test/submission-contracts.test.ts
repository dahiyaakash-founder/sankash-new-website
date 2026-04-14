import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, invoke } = vi.hoisted(() => ({
  rpc: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc,
    functions: {
      invoke,
    },
  },
}));

import { createLeadWithDedup } from "@/lib/leads-service";
import { captureTravelerContact } from "@/lib/traveler-contact-service";

describe("submission response contracts", () => {
  beforeEach(() => {
    rpc.mockReset();
    invoke.mockReset();
  });

  it("accepts a valid dedup lead response", async () => {
    rpc.mockResolvedValue({
      data: {
        id: "lead-123",
        assigned_to: "owner-1",
        is_duplicate: true,
      },
      error: null,
    });

    const result = await createLeadWithDedup({
      full_name: "Akash",
      audience_type: "traveler",
      lead_source_page: "contact",
      lead_source_type: "contact_form",
    } as any);

    expect(result.lead.id).toBe("lead-123");
    expect(result.lead.assigned_to).toBe("owner-1");
    expect(result.isDuplicate).toBe(true);
  });

  it("rejects malformed dedup lead responses before forms can show false success", async () => {
    rpc.mockResolvedValue({
      data: { is_duplicate: false },
      error: null,
    });

    await expect(createLeadWithDedup({
      full_name: "Akash",
      audience_type: "traveler",
      lead_source_page: "contact",
      lead_source_type: "contact_form",
    } as any)).rejects.toThrow("Lead submission did not return a lead id.");
  });

  it("rejects malformed traveler-contact responses before unlock success is shown", async () => {
    invoke.mockResolvedValue({
      data: { lead: { id: "lead-123" } },
      error: null,
    });

    await expect(captureTravelerContact({
      lead_id: "lead-123",
      full_name: "Akash",
      mobile_number: "9876543210",
      email: "akash@example.com",
    })).rejects.toThrow("Traveler contact submission did not confirm success.");
  });

  it("accepts a valid traveler-contact response", async () => {
    invoke.mockResolvedValue({
      data: { success: true, lead: { id: "lead-123" } },
      error: null,
    });

    await expect(captureTravelerContact({
      lead_id: "lead-123",
      full_name: "Akash",
      mobile_number: "9876543210",
    })).resolves.toEqual({
      success: true,
      lead: { id: "lead-123" },
    });
  });
});
