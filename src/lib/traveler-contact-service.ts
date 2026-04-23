import { supabase } from "@/integrations/supabase/client";

interface CaptureTravelerContactParams {
  lead_id: string;
  full_name: string;
  mobile_number: string;
  email?: string | null;
  intent_snapshot?: Record<string, unknown>;
}

interface CaptureTravelerContactResponse {
  success: true;
  lead?: Record<string, unknown> | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCaptureTravelerContactResponse(data: unknown): CaptureTravelerContactResponse {
  if (!isRecord(data)) {
    throw new Error("Traveler contact submission returned an unexpected response.");
  }

  const backendError = typeof data.error === "string" ? data.error.trim() : "";
  if (backendError) {
    throw new Error(backendError);
  }

  if (data.success !== true) {
    throw new Error("Traveler contact submission did not confirm success.");
  }

  return {
    success: true,
    lead: isRecord(data.lead) ? data.lead : null,
  };
}

export async function captureTravelerContact(params: CaptureTravelerContactParams): Promise<CaptureTravelerContactResponse> {
  const { data, error } = await supabase.functions.invoke("capture-traveler-contact", {
    body: params,
  });

  if (error) throw error;
  return normalizeCaptureTravelerContactResponse(data);
}

