import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { deriveItineraryIntelligence } from "../_shared/itinerary-intelligence.ts";
import {
  buildIntentSignals,
  buildLearningSignals,
  buildRecommendationEngine,
  deriveIntentAssessment,
  deriveMultiItineraryInsight,
  deriveSourceLikelihoodAssessment,
} from "../_shared/trip-commercial-intelligence.ts";
import {
  buildBenchmarkSummary,
  buildOpsCopilot,
  buildProductFitFlags,
  buildSimilarSummary,
  deriveLeadClassification,
  mergeLeadAnalysisRows,
  OPS_COPILOT_VERSION,
} from "../_shared/lead-trip-intelligence.ts";

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
  const { data: queueState } = await supabaseAdmin
    .from("trip_post_analysis_enrichment_queue")
    .select("attempts")
    .eq("lead_id", leadId)
    .maybeSingle();

  await supabaseAdmin
    .from("trip_post_analysis_enrichment_queue")
    .update({
      status: "processing",
      attempts: Number(queueState?.attempts ?? 0) + 1,
      last_error: null,
    })
    .eq("lead_id", leadId);

  try {
    const [
      { data: lead, error: leadError },
      { data: analyses, error: analysesError },
      { data: brain, error: brainError },
      { data: attachments, error: attachmentsError },
      { data: activity, error: activityError },
      { data: ops, error: opsError },
    ] = await Promise.all([
      supabaseAdmin.from("leads").select("*").eq("id", leadId).single(),
      supabaseAdmin.from("itinerary_analysis").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabaseAdmin.from("lead_trip_brains").select("*").eq("lead_id", leadId).single(),
      supabaseAdmin.from("lead_attachments").select("*").eq("lead_id", leadId).order("uploaded_at", { ascending: false }),
      supabaseAdmin.from("lead_activity").select("activity_type, created_at").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("lead_ops_copilot").select("*").eq("lead_id", leadId).maybeSingle(),
    ]);

    if (leadError) throw leadError;
    if (analysesError) throw analysesError;
    if (brainError) throw brainError;
    if (attachmentsError) throw attachmentsError;
    if (activityError) throw activityError;
    if (opsError) throw opsError;

    const merged = mergeLeadAnalysisRows(lead, analyses ?? [], attachments ?? []);
    const intelligence = deriveItineraryIntelligence({
      domestic_or_international: merged.domestic_or_international,
      destination_country: merged.destination_country,
      destination_city: merged.destination_city,
      additional_destinations_json: merged.additional_destinations_json,
      travel_start_date: merged.travel_start_date,
      travel_end_date: merged.travel_end_date,
      duration_nights: merged.duration_nights,
      duration_days: merged.duration_days,
      total_price: merged.total_price,
      price_per_person: merged.price_per_person,
      currency: merged.currency,
      traveller_count_total: merged.traveller_count_total,
      adults_count: merged.adults_count,
      children_count: merged.children_count,
      infants_count: merged.infants_count,
      hotel_names_json: merged.hotel_names_json,
      airline_names_json: merged.airline_names_json,
      sectors_json: merged.sectors_json,
      inclusions_text: merged.inclusions_text,
      exclusions_text: merged.exclusions_text,
      visa_mentioned: merged.visa_mentioned,
      insurance_mentioned: merged.insurance_mentioned,
      flight_departure_time: merged.flight_departure_time,
      flight_arrival_time: merged.flight_arrival_time,
      hotel_check_in: merged.hotel_check_in,
      hotel_check_out: merged.hotel_check_out,
      parsing_confidence: merged.parsing_confidence,
      missing_fields_json: merged.missing_fields_json,
      extraction_warnings_json: merged.extraction_warnings_json,
    });

    const classification = deriveLeadClassification(lead, merged, intelligence);
    const multi = deriveMultiItineraryInsight({
      lead,
      analyses: analyses ?? [],
      merged,
      intelligence,
    });
    const intentSignals = buildIntentSignals({
      lead,
      merged,
      analyses: analyses ?? [],
      attachments: attachments ?? [],
      activity: activity ?? [],
    });

    const [
      { data: benchmarkRow },
      { data: alternativeBenchmarks },
      { data: similarRows },
    ] = await Promise.all([
      supabaseAdmin.from("trip_destination_benchmarks").select("*").eq("benchmark_key", brain.benchmark_key ?? merged.benchmark_key).maybeSingle(),
      supabaseAdmin
        .from("trip_destination_benchmarks")
        .select("*")
        .eq("domestic_or_international", merged.domestic_or_international ?? "unknown")
        .eq(
          "duration_bucket",
          merged.duration_days == null ? "unknown" : merged.duration_days <= 3 ? "short" : merged.duration_days <= 6 ? "medium" : merged.duration_days <= 10 ? "long" : "extended",
        )
        .eq(
          "traveler_bucket",
          merged.traveller_count_total == null ? "unknown" : merged.traveller_count_total === 1 ? "solo" : merged.traveller_count_total === 2 ? "pair" : merged.traveller_count_total <= 4 ? "small_group" : "group",
        )
        .limit(20),
      supabaseAdmin
        .from("trip_similar_cases")
        .select("*")
        .eq("unified_case_id", brain.id)
        .order("similarity_score", { ascending: false })
        .limit(5),
    ]);

    const similarIds = (similarRows ?? []).map((row: any) => row.similar_case_id);
    const { data: peers } = similarIds.length > 0
      ? await supabaseAdmin
          .from("trip_market_memory")
          .select("unified_case_id, destination_city, destination_country, total_price, package_mode, traveler_count_total, hotel_names_json, product_fit_flags_json")
          .in("unified_case_id", similarIds)
      : { data: [] };

    const benchmarkSummary = buildBenchmarkSummary(merged, benchmarkRow ?? null);
    const similarSummary = buildSimilarSummary(similarRows ?? [], peers ?? []);
    const sourceLikelihood = deriveSourceLikelihoodAssessment({
      lead,
      analyses: analyses ?? [],
      merged,
      similarSummary,
    });
    const intent = deriveIntentAssessment({
      lead,
      merged,
      intelligence,
      classification,
      signals: intentSignals,
      multi,
      sourceLikelihood,
    });
    const productFit = buildProductFitFlags(lead, merged, intelligence, classification, benchmarkSummary);
    const recommendations = buildRecommendationEngine({
      merged,
      intelligence,
      benchmarkSummary,
      similarSummary,
      productFit,
      intent,
      multi,
      alternativeBenchmarks: alternativeBenchmarks ?? [],
    });
    const learningSignals = buildLearningSignals({
      classification,
      lead,
      merged,
      intent,
      sourceLikelihood,
    });
    const opsCopilot = buildOpsCopilot(
      lead,
      merged,
      intelligence,
      classification,
      benchmarkSummary,
      similarSummary,
      productFit,
      intent,
      multi,
      recommendations,
      sourceLikelihood,
      brain.outcome_learning_summary_json ?? ops?.outcome_learning_summary_json ?? {},
    );

    await Promise.all([
      supabaseAdmin
        .from("lead_trip_brains")
        .update({
          lead_classification: classification,
          benchmark_summary_json: benchmarkSummary,
          similar_case_summary_json: similarSummary,
          product_fit_flags_json: productFit,
          intent_signals_json: intentSignals,
          intent_score: intent.intent_score,
          conversion_probability_band: intent.conversion_probability_band,
          decision_stage: intent.decision_stage,
          likely_customer_motive: intent.likely_customer_motive,
          recommended_pitch_angle: intent.recommended_pitch_angle,
          intent_explanation: intent.intent_explanation,
          intent_confidence: intent.intent_confidence,
          multi_itinerary_type: multi.multi_itinerary_type,
          multi_itinerary_summary_json: multi,
          recommendation_engine_json: recommendations,
          top_recommendations_json: recommendations.top_recommendations,
          suggested_alternative_destinations_json: recommendations.suggested_alternative_destinations,
          recommended_products_json: recommendations.recommended_products,
          suggested_pitch_sequence_json: recommendations.suggested_pitch_sequence,
          benchmark_price_position: recommendations.benchmark_price_position,
          source_likelihood_json: sourceLikelihood,
          source_profile_label: sourceLikelihood.likely_source_profile,
          source_profile_confidence: sourceLikelihood.confidence,
          intelligence_refreshed_at: new Date().toISOString(),
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("lead_ops_copilot")
        .upsert({
          lead_id: leadId,
          unified_case_id: brain.id,
          lead_classification: classification,
          recommendation_summary: opsCopilot.recommendation_summary,
          ops_summary: opsCopilot.ops_summary,
          what_looks_wrong_json: opsCopilot.what_looks_wrong_json,
          sankash_opportunity_json: opsCopilot.sankash_opportunity_json,
          call_talking_points_json: opsCopilot.call_talking_points_json,
          pitch_sequence_json: opsCopilot.pitch_sequence_json,
          whatsapp_follow_up: opsCopilot.whatsapp_follow_up,
          benchmark_summary_json: opsCopilot.benchmark_summary_json,
          similar_trip_summary_json: opsCopilot.similar_trip_summary_json,
          product_fit_flags_json: opsCopilot.product_fit_flags_json,
          next_best_action_json: opsCopilot.next_best_action_json,
          intent_summary_json: opsCopilot.intent_summary_json,
          multi_itinerary_read_json: opsCopilot.multi_itinerary_read_json,
          top_recommendations_json: opsCopilot.top_recommendations_json,
          suggested_alternative_destinations_json: opsCopilot.suggested_alternative_destinations_json,
          recommended_products_json: opsCopilot.recommended_products_json,
          suggested_pitch_sequence_json: opsCopilot.suggested_pitch_sequence_json,
          benchmark_price_position: opsCopilot.benchmark_price_position,
          conversion_probability_band: opsCopilot.conversion_probability_band,
          decision_stage: opsCopilot.decision_stage,
          likely_customer_motive: opsCopilot.likely_customer_motive,
          recommended_pitch_angle: opsCopilot.recommended_pitch_angle,
          intent_explanation: opsCopilot.intent_explanation,
          intent_confidence: opsCopilot.intent_confidence,
          source_likelihood_json: opsCopilot.source_likelihood_json,
          outcome_learning_summary_json: opsCopilot.outcome_learning_summary_json,
          best_pitch_angle: opsCopilot.best_pitch_angle,
          urgency_score: opsCopilot.urgency_score,
          intent_score: opsCopilot.intent_score,
          lead_quality_score: opsCopilot.lead_quality_score,
          traveler_trust_score: opsCopilot.traveler_trust_score,
          ops_copilot_version: OPS_COPILOT_VERSION,
          refreshed_at: new Date().toISOString(),
        }, { onConflict: "lead_id" }),
      supabaseAdmin
        .from("trip_market_memory")
        .update({
          lead_classification: classification,
          product_fit_flags_json: productFit,
          recommendation_summary: opsCopilot.recommendation_summary,
          learning_signal_class: learningSignals.learning_signal_class,
          learning_weight: learningSignals.learning_weight,
          benchmark_signal_weight: learningSignals.benchmark_signal_weight,
          benchmark_price_position: recommendations.benchmark_price_position,
          conversion_probability_band: intent.conversion_probability_band,
          decision_stage: intent.decision_stage,
          likely_customer_motive: intent.likely_customer_motive,
          recommended_pitch_angle: intent.recommended_pitch_angle,
          multi_itinerary_type: multi.multi_itinerary_type,
          recommendation_engine_json: recommendations,
          source_likelihood_json: sourceLikelihood,
          source_profile_label: sourceLikelihood.likely_source_profile,
          source_profile_confidence: sourceLikelihood.confidence,
          last_seen_at: new Date().toISOString(),
        })
        .eq("lead_id", leadId),
      supabaseAdmin
        .from("lead_trip_intent_signals")
        .upsert({
          lead_id: leadId,
          unified_case_id: brain.id,
          source_page: merged.source_page,
          audience_type: merged.audience_type,
          contact_present: merged.contact_present,
          first_upload_at: intentSignals.first_upload_at,
          latest_upload_at: intentSignals.latest_upload_at,
          contact_captured_at: intentSignals.contact_captured_at,
          session_count: intentSignals.session_count,
          return_visit_count: intentSignals.return_visit_count,
          total_public_page_views: intentSignals.pages_visited_before_upload.length,
          pages_visited_json: intentSignals.pages_visited_before_upload,
          page_types_json: intentSignals.page_types_before_upload,
          time_spent_before_upload_seconds: intentSignals.time_spent_before_upload_seconds,
          viewed_traveler_page: intentSignals.viewed_traveler_page,
          viewed_emi_page: intentSignals.viewed_emi_page,
          viewed_emi_section: intentSignals.viewed_emi_section,
          referrer: intentSignals.referrer,
          utm_source: intentSignals.utm_source,
          utm_medium: intentSignals.utm_medium,
          utm_campaign: intentSignals.utm_campaign,
          device_type: intentSignals.device_type,
          os_name: intentSignals.os_name,
          browser_name: intentSignals.browser_name,
          uploaded_multiple_itineraries: intentSignals.uploaded_multiple_itineraries,
          distinct_destination_count: intentSignals.distinct_destination_count,
          same_destination_repeat: intentSignals.same_destination_repeat,
          days_to_trip_start: intentSignals.days_to_trip_start,
          quote_size_band: intentSignals.quote_size_band,
          trip_size_band: intentSignals.trip_size_band,
          raw_signal_snapshot_json: intentSignals.raw_signal_snapshot_json,
          intent_score: intent.intent_score,
          conversion_probability_band: intent.conversion_probability_band,
          decision_stage: intent.decision_stage,
          likely_customer_motive: intent.likely_customer_motive,
          recommended_pitch_angle: intent.recommended_pitch_angle,
          intent_explanation: intent.intent_explanation,
          intent_confidence: intent.intent_confidence,
          refreshed_at: new Date().toISOString(),
        }, { onConflict: "lead_id" }),
      supabaseAdmin
        .from("trip_post_analysis_enrichment_queue")
        .update({
          status: "done",
          processed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("lead_id", leadId),
    ]);

    await supabaseAdmin.rpc("rebuild_trip_destination_benchmarks").catch(() => {});
    await supabaseAdmin.rpc("rebuild_trip_hotel_frequency").catch(() => {});
    await supabaseAdmin.rpc("rebuild_trip_similar_cases").catch(() => {});

    return {
      lead_id: leadId,
      source_profile_label: sourceLikelihood.likely_source_profile,
      intent_score: intent.intent_score,
      decision_stage: intent.decision_stage,
      recommended_pitch_angle: intent.recommended_pitch_angle,
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
