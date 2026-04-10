import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  buildLeadOutcomeSnapshot,
  buildOutcomeLearningSummary,
} from "../_shared/trip-outcome-learning.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OUTCOME_LEARNING_VERSION = "outcome-learning-v1";

interface ProcessRequest {
  lead_id?: string;
  limit?: number;
}

async function processLeadOutcome(supabaseAdmin: any, leadId: string) {
  await supabaseAdmin
    .from("trip_outcome_learning_queue")
    .update({
      status: "processing",
      last_error: null,
      attempts: 1,
    })
    .eq("lead_id", leadId);

  try {
    const [
      { data: lead, error: leadError },
      { data: brain, error: brainError },
      { data: ops, error: opsError },
      { data: intentSignals },
    ] = await Promise.all([
      supabaseAdmin.from("leads").select("*").eq("id", leadId).single(),
      supabaseAdmin.from("lead_trip_brains").select("*").eq("lead_id", leadId).single(),
      supabaseAdmin.from("lead_ops_copilot").select("*").eq("lead_id", leadId).maybeSingle(),
      supabaseAdmin.from("lead_trip_intent_signals").select("*").eq("lead_id", leadId).maybeSingle(),
    ]);

    if (leadError) throw leadError;
    if (brainError) throw brainError;
    if (opsError) throw opsError;

    const outcomeSnapshot = buildLeadOutcomeSnapshot({
      lead,
      brain,
      ops,
      intentSignals,
    });

    await supabaseAdmin
      .from("lead_trip_outcomes")
      .upsert({
        lead_id: leadId,
        unified_case_id: brain.id,
        conversion_status: outcomeSnapshot.conversion_status,
        conversion_date: outcomeSnapshot.conversion_date,
        product_converted_json: outcomeSnapshot.product_converted,
        loan_amount: outcomeSnapshot.loan_amount,
        booked_amount: outcomeSnapshot.booked_amount,
        quote_amount_at_outcome: outcomeSnapshot.quote_amount_at_outcome,
        destination_city: outcomeSnapshot.destination_city,
        destination_country: outcomeSnapshot.destination_country,
        domestic_or_international: outcomeSnapshot.domestic_or_international,
        traveler_profile_json: outcomeSnapshot.traveler_profile_json,
        source_page: outcomeSnapshot.source_page,
        source_type: outcomeSnapshot.source_type,
        owner_user_id: outcomeSnapshot.owner_user_id,
        pitch_angle_that_worked: outcomeSnapshot.pitch_angle_that_worked,
        originally_anonymous: outcomeSnapshot.originally_anonymous,
        upload_count: outcomeSnapshot.upload_count,
        itinerary_count: outcomeSnapshot.itinerary_count,
        lead_classification_at_outcome: outcomeSnapshot.lead_classification_at_outcome,
        intent_score_at_outcome: outcomeSnapshot.intent_score_at_outcome,
        conversion_probability_band_at_outcome: outcomeSnapshot.conversion_probability_band_at_outcome,
        recommendation_outputs_json: outcomeSnapshot.recommendation_outputs_json,
        product_fit_snapshot_json: outcomeSnapshot.product_fit_snapshot_json,
        multi_itinerary_type: outcomeSnapshot.multi_itinerary_type,
        source_profile_label: outcomeSnapshot.source_profile_label,
        first_upload_at: outcomeSnapshot.first_upload_at,
        contact_captured_at: outcomeSnapshot.contact_captured_at,
        time_from_first_upload_to_conversion_hours: outcomeSnapshot.time_from_first_upload_to_conversion_hours,
        time_from_contact_capture_to_conversion_hours: outcomeSnapshot.time_from_contact_capture_to_conversion_hours,
        learning_weight: outcomeSnapshot.learning_weight,
        benchmark_confidence_weight: outcomeSnapshot.benchmark_confidence_weight,
        active_for_learning: outcomeSnapshot.active_for_learning,
        explanation: outcomeSnapshot.explanation,
        outcome_learning_version: OUTCOME_LEARNING_VERSION,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: "lead_id" });

    await supabaseAdmin.rpc("rebuild_trip_destination_outcome_benchmarks");
    await supabaseAdmin.rpc("rebuild_trip_pitch_outcome_memory");
    await supabaseAdmin.rpc("rebuild_trip_product_outcome_memory");

    const [
      { data: outcomeBenchmark },
      { data: pitchRows },
      { data: productRows },
    ] = await Promise.all([
      supabaseAdmin
        .from("trip_destination_outcome_benchmarks")
        .select("*")
        .eq("benchmark_key", brain.benchmark_key)
        .maybeSingle(),
      supabaseAdmin
        .from("trip_pitch_outcome_memory")
        .select("*")
        .eq("domestic_or_international", brain.domestic_or_international ?? "unknown")
        .eq("multi_itinerary_type", brain.multi_itinerary_type ?? "single_itinerary")
        .limit(5),
      supabaseAdmin
        .from("trip_product_outcome_memory")
        .select("*")
        .eq("domestic_or_international", brain.domestic_or_international ?? "unknown")
        .eq("package_mode", brain.package_mode ?? "unknown")
        .limit(6),
    ]);

    const outcomeLearningSummary = buildOutcomeLearningSummary({
      benchmark: outcomeBenchmark ?? null,
      pitchRows: pitchRows ?? [],
      productRows: productRows ?? [],
    });

    await Promise.all([
      supabaseAdmin
        .from("lead_trip_brains")
        .update({
          latest_conversion_status: outcomeSnapshot.conversion_status,
          outcome_learning_summary_json: outcomeLearningSummary,
          outcome_learning_version: OUTCOME_LEARNING_VERSION,
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("lead_ops_copilot")
        .update({
          outcome_learning_summary_json: outcomeLearningSummary,
          outcome_learning_version: OUTCOME_LEARNING_VERSION,
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("trip_market_memory")
        .update({
          latest_conversion_status: outcomeSnapshot.conversion_status,
          outcome_feedback_json: outcomeLearningSummary,
          outcome_learning_version: OUTCOME_LEARNING_VERSION,
          outcome: outcomeSnapshot.conversion_status === "won" ? "won" : outcomeSnapshot.conversion_status === "lost" ? "lost" : "open",
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("trip_outcome_learning_queue")
        .update({
          unified_case_id: brain.id,
          status: "done",
          processed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("lead_id", leadId),
    ]);

    return {
      lead_id: leadId,
      conversion_status: outcomeSnapshot.conversion_status,
      best_pitch_angle: outcomeLearningSummary.best_pitch_angle,
    };
  } catch (error) {
    await supabaseAdmin
      .from("trip_outcome_learning_queue")
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
          .from("trip_outcome_learning_queue")
          .select("lead_id")
          .eq("status", "pending")
          .lte("due_at", new Date().toISOString())
          .order("requested_at", { ascending: true })
          .limit(Math.max(1, Math.min(20, body.limit ?? 10)))
      ).data?.map((row: any) => row.lead_id) ?? [];

    const results = [];
    for (const leadId of leadIds) {
      const result = await processLeadOutcome(supabaseAdmin, leadId);
      results.push(result);
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("process-trip-outcome-learning error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
