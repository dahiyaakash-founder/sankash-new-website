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

function triggerOutcomeLearning(leadId: string) {
  const url = `${SUPABASE_URL}/functions/v1/process-trip-outcome-learning`;
  const request = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ lead_id: leadId }),
  }).catch((error) => {
    console.warn("process-trip-outcome-learning trigger failed:", error);
  });

  const edgeRuntime = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (promise: Promise<unknown>) => void } }).EdgeRuntime;
  if (edgeRuntime?.waitUntil) {
    edgeRuntime.waitUntil(request);
  }
}

interface RefreshRequest {
  lead_id?: string;
  reason?: string;
  limit?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as RefreshRequest;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (body.lead_id) {
      const result = await refreshLeadTripIntelligence({
        supabaseAdmin,
        leadId: body.lead_id,
        reason: body.reason ?? "manual_refresh",
      });
      triggerOutcomeLearning(body.lead_id);

      return new Response(JSON.stringify({ success: true, mode: "single", result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const limit = Math.max(1, Math.min(25, body.limit ?? 10));
    const { data: jobs, error } = await supabaseAdmin
      .from("trip_intelligence_refresh_queue")
      .select("lead_id, reason")
      .eq("status", "pending")
      .lte("due_at", new Date().toISOString())
      .order("requested_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    const results = [];
    for (const job of jobs ?? []) {
      const result = await refreshLeadTripIntelligence({
        supabaseAdmin,
        leadId: job.lead_id,
        reason: job.reason ?? "queued_refresh",
      });
      triggerOutcomeLearning(job.lead_id);
      results.push(result);
    }

    return new Response(JSON.stringify({
      success: true,
      mode: "queue",
      processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("refresh-trip-intelligence error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
