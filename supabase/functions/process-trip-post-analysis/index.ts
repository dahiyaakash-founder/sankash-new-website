import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  buildLearningSignals,
  deriveSourceLikelihoodAssessment,
  type IntentAssessment,
} from "../_shared/trip-commercial-intelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ProcessRequest {
  lead_id?: string;
  limit?: number;
}

async function processLeadJob(supabaseAdmin: any, leadId: string) {
  await supabaseAdmin
    .from("trip_post_analysis_enrichment_queue")
    .update({
      status: "processing",
      attempts: 1,
      last_error: null,
    })
    .eq("lead_id", leadId);

  try {
    const [
      { data: lead, error: leadError },
      { data: analyses, error: analysesError },
      { data: brain, error: brainError },
    ] = await Promise.all([
      supabaseAdmin.from("leads").select("*").eq("id", leadId).single(),
      supabaseAdmin.from("itinerary_analysis").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabaseAdmin.from("lead_trip_brains").select("*").eq("lead_id", leadId).single(),
    ]);

    if (leadError) throw leadError;
    if (analysesError) throw analysesError;
    if (brainError) throw brainError;

    const sourceLikelihood = deriveSourceLikelihoodAssessment({
      lead,
      analyses: analyses ?? [],
      merged: brain,
      similarSummary: {
        match_count: 0,
        top_matches: [],
      },
    });

    const intent = {
      intent_score: Number(brain.intent_score ?? 0),
      conversion_probability_band: brain.conversion_probability_band ?? "low",
      decision_stage: brain.decision_stage ?? "early_exploration",
      likely_customer_motive: brain.likely_customer_motive ?? "quote_validation",
      recommended_pitch_angle: brain.recommended_pitch_angle ?? "clarify_quote_and_close",
      intent_explanation: brain.intent_explanation ?? "",
      intent_confidence: brain.intent_confidence ?? "low",
    } as IntentAssessment;

    const learningSignals = buildLearningSignals({
      classification: brain.lead_classification,
      lead,
      merged: brain,
      intent,
      sourceLikelihood,
    });

    await Promise.all([
      supabaseAdmin
        .from("lead_trip_brains")
        .update({
          source_likelihood_json: sourceLikelihood,
          source_profile_label: sourceLikelihood.likely_source_profile,
          source_profile_confidence: sourceLikelihood.confidence,
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("lead_ops_copilot")
        .update({
          source_likelihood_json: sourceLikelihood,
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("trip_market_memory")
        .update({
          source_likelihood_json: sourceLikelihood,
          source_profile_label: sourceLikelihood.likely_source_profile,
          source_profile_confidence: sourceLikelihood.confidence,
          learning_signal_class: learningSignals.learning_signal_class,
          learning_weight: learningSignals.learning_weight,
          benchmark_signal_weight: learningSignals.benchmark_signal_weight,
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("trip_post_analysis_enrichment_queue")
        .update({
          status: "done",
          processed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("lead_id", leadId),
    ]);

    return {
      lead_id: leadId,
      source_profile_label: sourceLikelihood.likely_source_profile,
      learning_signal_class: learningSignals.learning_signal_class,
    };
  } catch (error) {
    await supabaseAdmin
      .from("trip_post_analysis_enrichment_queue")
      .update({
        status: "error",
        last_error: (error as Error).message,
      })
      .eq("lead_id", leadId);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as ProcessRequest;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const leadIds = body.lead_id
      ? [body.lead_id]
      : (
        await supabaseAdmin
          .from("trip_post_analysis_enrichment_queue")
          .select("lead_id")
          .eq("status", "pending")
          .lte("due_at", new Date().toISOString())
          .order("requested_at", { ascending: true })
          .limit(Math.max(1, Math.min(20, body.limit ?? 10)))
      ).data?.map((row: any) => row.lead_id) ?? [];

    const results = [];
    for (const leadId of leadIds) {
      const result = await processLeadJob(supabaseAdmin, leadId);
      results.push(result);
    }

    if (results.length > 0) {
      await supabaseAdmin.rpc("rebuild_trip_destination_benchmarks").catch(() => {});
      await supabaseAdmin.rpc("rebuild_trip_hotel_frequency").catch(() => {});
      await supabaseAdmin.rpc("rebuild_trip_similar_cases").catch(() => {});
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("process-trip-post-analysis error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
