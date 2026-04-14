import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  refreshLeadTripIntelligence,
} from "../_shared/lead-trip-intelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CaptureTravelerContactRequest {
  lead_id: string;
  full_name: string;
  mobile_number: string;
  email?: string | null;
  intent_snapshot?: Record<string, unknown> | null;
}

function normalizePhone(raw: string) {
  const stripped = raw.replace(/[\s\-().]+/g, "");
  let digits = stripped.replace(/[^0-9]/g, "");
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as CaptureTravelerContactRequest;
    const leadId = body.lead_id;
    const fullName = body.full_name?.trim();
    const phone = normalizePhone(body.mobile_number ?? "");
    const email = body.email?.trim() || null;
    const intentSnapshot = body.intent_snapshot && typeof body.intent_snapshot === "object"
      ? body.intent_snapshot as Record<string, unknown>
      : null;

    if (!leadId || !fullName || phone.length !== 10) {
      return new Response(JSON.stringify({ error: "lead_id, full_name, and a valid mobile_number are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, lead_source_page, audience_type, metadata_json, mobile_number, email")
      .eq("id", leadId)
      .single();

    if (leadError) throw leadError;

    const metadata = lead.metadata_json && typeof lead.metadata_json === "object"
      ? lead.metadata_json as Record<string, unknown>
      : {};

    if (lead.lead_source_page !== "for-travelers") {
      return new Response(JSON.stringify({ error: "This lead cannot be updated through the public traveler flow" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (lead.mobile_number || lead.email) {
      return new Response(JSON.stringify({ error: "Contact details were already captured for this lead" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from("leads")
      .update({
        full_name: fullName,
        mobile_number: phone,
        email,
        lead_source_type: "traveler_quote_unlock",
        audience_type: lead.audience_type ?? "traveler",
        metadata_json: {
          ...metadata,
          upload_only: false,
          unlocked_from_existing_itinerary: true,
          traveler_intent_session: intentSnapshot ?? metadata.traveler_intent_session ?? null,
          traveler_contact_captured_at: new Date().toISOString(),
        },
      })
      .eq("id", leadId)
      .select()
      .single();

    if (updateError) throw updateError;

    await supabaseAdmin.from("lead_activity").insert({
      lead_id: leadId,
      activity_type: "traveler_contact_captured",
      description: "Traveler unlocked detailed review on the existing itinerary lead",
    }).then(() => {}, () => {});

    await refreshLeadTripIntelligence({
      supabaseAdmin,
      leadId,
      reason: "traveler_contact_captured",
    }).then(() => {}, () => {});

    return new Response(JSON.stringify({ success: true, lead: updatedLead }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("capture-traveler-contact error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
