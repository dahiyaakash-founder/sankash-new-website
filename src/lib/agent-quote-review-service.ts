import { uploadLeadAttachment } from "@/lib/attachments-service";
import { logLeadCreated } from "@/lib/activity-service";
import { triggerItineraryAnalysis } from "@/lib/itinerary-analysis-service";
import { createLeadWithDedup, uploadQuoteFile, type LeadRow } from "@/lib/leads-service";

export type AgentQuoteReviewConfidence = "high" | "medium";

export interface AgentQuoteReviewContact {
  full_name: string;
  mobile_number?: string | null;
  email?: string | null;
  company_name?: string | null;
}

/**
 * Persists the minimum viable agent review artifact before the preview UI
 * is allowed to present a successful result.
 *
 * If the quote file upload or lead creation fails, we reject so the caller
 * can keep the user out of a false-success state. Secondary enrichment
 * (attachment indexing / AI analysis) remains best-effort.
 */
export async function saveAgentQuoteReviewLead(
  file: File,
  confidence: AgentQuoteReviewConfidence,
  contact: AgentQuoteReviewContact,
): Promise<LeadRow> {
  const fullName = contact.full_name.trim();
  const mobile = contact.mobile_number?.trim() || null;
  const email = contact.email?.trim() || null;
  const company = contact.company_name?.trim() || null;

  if (!fullName) {
    throw new Error("Agent full name is required");
  }

  if (!mobile && !email) {
    throw new Error("Provide a mobile number or email before saving this review");
  }

  const uploaded = await uploadQuoteFile(file);

  const { lead } = await createLeadWithDedup({
    full_name: fullName,
    mobile_number: mobile,
    email,
    company_name: company,
    lead_source_page: "for-travel-agents",
    lead_source_type: "agent_quote_review",
    audience_type: "agent",
    quote_file_name: file.name,
    quote_file_url: uploaded.url,
    metadata_json: {
      confidence,
      anonymous_intent: false,
      lead_capture_classification: "actionable_lead",
      requires_contact_for_lead: false,
    },
  });

  if (!lead?.id) {
    throw new Error("Lead creation failed");
  }

  await logLeadCreated(lead.id, "for-travel-agents").catch(() => {});

  try {
    const attachment = await uploadLeadAttachment(file, lead.id, { sourceType: "agent_quote_review" });

    if (attachment && uploaded.url) {
      await triggerItineraryAnalysis({
        lead_id: lead.id,
        attachment_id: attachment.id,
        file_url: uploaded.url,
        file_name: file.name,
        audience_type: "agent",
      }).catch((error) => {
        console.warn("Itinerary analysis failed (non-blocking):", error);
      });
    }
  } catch (error) {
    console.warn("Agent quote attachment save failed (non-blocking):", error);
  }

  return lead;
}
