import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchLeadTripIntelligence,
  refreshLeadTripIntelligence,
  type LeadTripBrain,
  type LeadOpsCopilot,
} from "@/lib/lead-trip-intelligence-service";
import {
  Brain,
  Loader2,
  RefreshCw,
  TriangleAlert,
  Target,
  PhoneCall,
  MessageCircle,
  Sparkles,
  Copy,
  Plane,
  Hotel,
  Calendar,
  Users,
  Wallet,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";

function formatMoney(amount: number | null | undefined, currency = "INR") {
  if (amount == null) return "—";
  return `${currency.toUpperCase()} ${Number(amount).toLocaleString("en-IN")}`;
}

function scoreTone(score: number) {
  if (score >= 75) return "bg-emerald-100 text-emerald-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-muted text-muted-foreground";
}

function classificationTone(classification: string) {
  if (classification === "sales_lead") return "bg-emerald-100 text-emerald-700";
  if (classification === "research_lead") return "bg-blue-100 text-blue-700";
  return "bg-muted text-muted-foreground";
}

function packageLabel(packageMode: string | null | undefined) {
  return (packageMode ?? "unknown").replace(/_/g, " ");
}

function destinationLabel(brain: LeadTripBrain) {
  if (brain.destination_city && brain.destination_country) return `${brain.destination_city}, ${brain.destination_country}`;
  return brain.destination_city ?? brain.destination_country ?? "Destination not confirmed";
}

export default function LeadTripIntelligencePanel({ leadId }: { leadId: string }) {
  const [brain, setBrain] = useState<LeadTripBrain | null>(null);
  const [ops, setOps] = useState<LeadOpsCopilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLeadTripIntelligence(leadId);
      setBrain(data.brain);
      setOps(data.ops);
    } catch (error) {
      console.error("Failed to load lead trip intelligence:", error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLeadTripIntelligence(leadId, "ops_manual_refresh");
      await load();
      toast.success("Trip intelligence refreshed");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not refresh trip intelligence");
    } finally {
      setRefreshing(false);
    }
  };

  const topSimilarCases = useMemo(
    () => (ops?.similar_trip_summary_json?.top_matches as Array<Record<string, unknown>> | undefined) ?? [],
    [ops],
  );

  if (loading) {
    return (
      <div className="border rounded-xl bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-heading font-semibold">
          <Brain size={15} className="text-primary" />
          Ops Trip Intelligence
        </div>
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!brain || !ops) {
    return (
      <div className="border rounded-xl bg-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-heading font-semibold">
            <Brain size={15} className="text-primary" />
            Ops Trip Intelligence
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          No merged trip intelligence is available for this lead yet. Run or refresh itinerary analysis to build the lead-level trip brain.
        </p>
      </div>
    );
  }

  const wrongItems = ops.what_looks_wrong_json ?? [];
  const opportunities = ops.sankash_opportunity_json ?? [];
  const talkingPoints = ops.call_talking_points_json ?? [];
  const pitchSequence = ops.pitch_sequence_json ?? [];
  const benchmark = ops.benchmark_summary_json ?? {};
  const intent = ops.intent_summary_json ?? {};
  const multi = ops.multi_itinerary_read_json ?? {};
  const topRecommendations = ops.top_recommendations_json ?? [];
  const alternativeDestinations = ops.suggested_alternative_destinations_json ?? [];
  const recommendedProducts = ops.recommended_products_json ?? [];
  const sourceLikelihood = ops.source_likelihood_json ?? {};
  const outcomeLearning = ops.outcome_learning_summary_json ?? brain.outcome_learning_summary_json ?? {};
  const importantMissingItems = ops.important_missing_items_json ?? [];
  const whySystemThinksThis = ops.why_the_system_thinks_this_json ?? [];

  return (
    <div className="space-y-4">
      <div className="border rounded-xl bg-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain size={15} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">Ops Trip Intelligence</h2>
            </div>
            <p className="text-sm text-muted-foreground">{brain.unified_summary ?? "Merged trip summary unavailable."}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={classificationTone(brain.lead_classification)}>
              {brain.lead_classification.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline">
              {brain.parsing_confidence ?? "low"} confidence
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Plane size={12} /> Unified Trip Analysis</div>
            <p className="text-sm font-semibold">{destinationLabel(brain)}</p>
            <p className="text-xs text-muted-foreground capitalize">{packageLabel(brain.package_mode)} · {brain.domestic_or_international ?? "trip type unclear"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Calendar size={12} /> Dates & Duration</div>
            <p className="text-sm font-semibold">{brain.travel_start_date ?? "Date missing"}{brain.travel_end_date ? ` → ${brain.travel_end_date}` : ""}</p>
            <p className="text-xs text-muted-foreground">{brain.duration_days ? `${brain.duration_days} days` : "Duration not confirmed"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users size={12} /> Travelers</div>
            <p className="text-sm font-semibold">{brain.traveller_count_total ?? "Unknown"} {brain.traveller_count_total === 1 ? "traveler" : "travelers"}</p>
            <p className="text-xs text-muted-foreground">
              Adults {brain.adults_count ?? "—"} · Children {brain.children_count ?? "—"} · Infants {brain.infants_count ?? "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><IndianRupee size={12} /> Quote & Quality</div>
            <p className="text-sm font-semibold">{formatMoney(brain.total_price ?? brain.price_per_person, brain.currency ?? "INR")}</p>
            <p className="text-xs text-muted-foreground">{brain.extracted_completeness_score ?? 0}/100 completeness · {brain.analysis_count} analysis run{brain.analysis_count > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-3">
          <div className="rounded-xl border bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary" />
              <h3 className="text-sm font-heading font-semibold">Call Cockpit</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {ops.lead_mode && <Badge>{ops.lead_mode}</Badge>}
              {ops.best_pitch_angle && <Badge variant="outline" className="capitalize">{ops.best_pitch_angle.replace(/_/g, " ")}</Badge>}
            </div>
            <div className="space-y-2">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-[11px] text-muted-foreground">One thing to do first</p>
                <p className="text-sm font-semibold mt-1">{String(ops.immediate_next_action_json?.title ?? ops.next_best_action_json?.title ?? "Collect the strongest missing trip context")}</p>
                <p className="text-xs text-muted-foreground mt-1">{String(ops.immediate_next_action_json?.why_now ?? ops.next_best_action_json?.why_now ?? "Use the merged trip brain to close the next gap fast.")}</p>
              </div>
              {ops.first_question_to_ask && (
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-[11px] text-muted-foreground">Ask this first</p>
                  <p className="text-sm font-medium mt-1">{ops.first_question_to_ask}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-sm font-heading font-semibold">System Read</h3>
            </div>
            {ops.travel_read && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Travel read</p>
                <p className="text-sm mt-1">{ops.travel_read}</p>
              </div>
            )}
            {ops.sankash_read && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">SanKash read</p>
                <p className="text-sm mt-1">{ops.sankash_read}</p>
              </div>
            )}
            {whySystemThinksThis.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Why the system thinks this</p>
                {whySystemThinksThis.slice(0, 4).map((line) => (
                  <p key={line} className="text-xs text-muted-foreground">• {line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-primary" />
            <h2 className="text-sm font-heading font-semibold">Booking Intent</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Intent score</p>
              <p className={`text-sm font-semibold inline-flex px-2 py-0.5 rounded-full mt-1 ${scoreTone(ops.intent_score)}`}>{ops.intent_score}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Conversion band</p>
              <p className="text-sm font-semibold capitalize mt-1">{ops.conversion_probability_band?.replace(/_/g, " ") ?? "unknown"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Decision stage</p>
              <p className="text-sm font-semibold capitalize mt-1">{ops.decision_stage?.replace(/_/g, " ") ?? "unknown"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Best pitch angle</p>
              <p className="text-sm font-semibold capitalize mt-1">{ops.recommended_pitch_angle?.replace(/_/g, " ") ?? "unknown"}</p>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-sm font-medium capitalize">{ops.likely_customer_motive?.replace(/_/g, " ") ?? "Motive unclear"}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{ops.intent_explanation ?? "The system is still building intent context for this case."}</p>
            <p className="text-[11px] text-muted-foreground">Confidence: {ops.intent_confidence ?? "low"}</p>
          </div>
        </div>

        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <h2 className="text-sm font-heading font-semibold">Multi-Itinerary Read</h2>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="capitalize">
                {String(multi.multi_itinerary_type ?? brain.multi_itinerary_type ?? "single_itinerary").replace(/_/g, " ")}
              </Badge>
              {sourceLikelihood.likely_source_profile && (
                <Badge variant="outline" className="capitalize">
                  {String(sourceLikelihood.likely_source_profile).replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{String(multi.multi_itinerary_summary ?? "Single trip read")}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {String(multi.file_relationship_explanation ?? "The uploads are being treated as one trip summary for ops." )}
            </p>
            {sourceLikelihood.explanation && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Source read: {String(sourceLikelihood.explanation)}
              </p>
            )}
            {Array.isArray(sourceLikelihood.drivers) && sourceLikelihood.drivers.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Why the system thinks this</p>
                {(sourceLikelihood.drivers as string[]).slice(0, 4).map((driver) => (
                  <p key={driver} className="text-xs text-muted-foreground">• {driver}</p>
                ))}
              </div>
            )}
            {Array.isArray(multi.common_patterns) && multi.common_patterns.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {(multi.common_patterns as string[]).slice(0, 5).map((pattern) => (
                  <Badge key={pattern} variant="secondary">{pattern}</Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Buying state: <span className="font-medium text-foreground capitalize">{String(multi.buying_state_inference ?? "unknown").replace(/_/g, " ")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TriangleAlert size={14} className="text-amber-600" />
            <h2 className="text-sm font-heading font-semibold">What Looks Wrong / Missing</h2>
          </div>
          {wrongItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No major trip gaps were flagged.</p>
          ) : (
            <div className="space-y-2">
              {wrongItems.map((item) => (
                <div key={item.code} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{item.severity}</Badge>
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-primary" />
            <h2 className="text-sm font-heading font-semibold">SanKash Opportunity</h2>
          </div>
          <div className="rounded-lg border bg-primary/5 p-3 space-y-1">
            <p className="text-[11px] text-muted-foreground">Recommended next move</p>
            <p className="text-sm font-semibold">{String(ops.next_best_action_json?.title ?? "Collect the strongest missing trip context")}</p>
            <p className="text-xs text-muted-foreground">{String(ops.next_best_action_json?.why_now ?? "Use the merged trip brain to close the next gap fast.")}</p>
          </div>
          {importantMissingItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Important missing items</p>
              {importantMissingItems.slice(0, 3).map((item) => (
                <div key={String(item.code ?? item.label)} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{String(item.label ?? item.code ?? "Missing item")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{String(item.reason ?? "This missing detail is blocking a stronger trip read.")}</p>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Urgency", value: ops.urgency_score },
              { label: "Intent", value: ops.intent_score },
              { label: "Lead quality", value: ops.lead_quality_score },
            ].map((score) => (
              <div key={score.label} className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-[11px] text-muted-foreground">{score.label}</p>
                <p className={`text-sm font-semibold inline-flex px-2 py-0.5 rounded-full mt-1 ${scoreTone(score.value)}`}>{score.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {opportunities.map((item) => (
              <div key={item.code} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{item.priority}</Badge>
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
          {recommendedProducts.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Recommended products</p>
              {recommendedProducts.slice(0, 4).map((item) => (
                <div key={item.code} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.reasoning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="border rounded-xl bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <PhoneCall size={14} className="text-primary" />
            <h2 className="text-sm font-heading font-semibold">What To Say On Call</h2>
          </div>
          <div className="space-y-2">
            {talkingPoints.map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{index + 1}. {item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          {pitchSequence.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Pitch order</p>
              <div className="flex flex-wrap gap-2">
                {pitchSequence.map((item) => (
                  <Badge key={item.code} variant="secondary">{item.title}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">Recommendations</h2>
            </div>
            <div className="space-y-2">
              {topRecommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Recommendation engine is still building context.</p>
              ) : (
                topRecommendations.slice(0, 4).map((item) => (
                  <div key={item.code} className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{item.confidence}</Badge>
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.reasoning}</p>
                  </div>
                ))
              )}
            </div>
            {alternativeDestinations.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Alternative destinations</p>
                {alternativeDestinations.slice(0, 3).map((item) => (
                  <div key={item.destination} className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-sm font-medium">{item.destination}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.reason}
                      {item.avg_total_price != null ? ` Typical visible quote: ${formatMoney(item.avg_total_price, brain.currency ?? "INR")}.` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">What Converted In Similar Cases</h2>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-medium">{String(outcomeLearning.summary ?? "Outcome memory is still building for this trip shape.")}</p>
              <p className="text-xs text-muted-foreground">
                Conversion read: <span className="font-medium text-foreground capitalize">{String(outcomeLearning.conversion_rate_band ?? "unknown").replace(/_/g, " ")}</span>
                {typeof outcomeLearning.converted_similar_cases === "number" ? ` · Won cases ${outcomeLearning.converted_similar_cases}` : ""}
                {typeof outcomeLearning.lost_similar_cases === "number" ? ` · Lost cases ${outcomeLearning.lost_similar_cases}` : ""}
              </p>
              {outcomeLearning.best_pitch_angle && (
                <p className="text-xs text-muted-foreground">
                  Best historical pitch: <span className="font-medium text-foreground capitalize">{String(outcomeLearning.best_pitch_angle).replace(/_/g, " ")}</span>
                </p>
              )}
              {Array.isArray(outcomeLearning.top_products) && outcomeLearning.top_products.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Products that kept showing up in wins: {(outcomeLearning.top_products as string[]).join(", ")}
                </p>
              )}
              {outcomeLearning.anonymous_recovery_signal && (
                <p className="text-xs text-muted-foreground">{String(outcomeLearning.anonymous_recovery_signal)}</p>
              )}
              {Array.isArray(outcomeLearning.guidance_lines) && outcomeLearning.guidance_lines.length > 0 && (
                <div className="space-y-1 pt-1">
                  {(outcomeLearning.guidance_lines as string[]).slice(0, 3).map((line) => (
                    <p key={line} className="text-xs text-muted-foreground">• {line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-primary" />
                <h2 className="text-sm font-heading font-semibold">Suggested WhatsApp Follow-up</h2>
              </div>
              {ops.whatsapp_follow_up && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(ops.whatsapp_follow_up ?? "");
                    toast.success("WhatsApp follow-up copied");
                  }}
                >
                  <Copy size={12} /> Copy
                </Button>
              )}
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{ops.whatsapp_follow_up ?? "No follow-up drafted yet."}</p>
            </div>
          </div>

          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">What We Learned From Similar Trips</h2>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-medium">
                {typeof benchmark.sample_count === "number" && benchmark.sample_count > 0
                  ? `Seen ${benchmark.sample_count} comparable itineraries`
                  : "Benchmark memory still building"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {typeof benchmark.note === "string" ? benchmark.note : "We will keep learning from every itinerary uploaded here."}
              </p>
              {(brain.benchmark_price_position || ops.benchmark_price_position) && (
                <p className="text-xs text-muted-foreground">
                  Price read: <span className="font-medium text-foreground capitalize">{String(ops.benchmark_price_position ?? brain.benchmark_price_position).replace(/_/g, " ")}</span>
                </p>
              )}
              {(benchmark.min_total_price || benchmark.max_total_price) && (
                <p className="text-xs text-muted-foreground">
                  Typical visible range: {formatMoney(Number(benchmark.min_total_price ?? 0), brain.currency ?? "INR")} to {formatMoney(Number(benchmark.max_total_price ?? 0), brain.currency ?? "INR")}
                </p>
              )}
              {Array.isArray(benchmark.common_hotels) && benchmark.common_hotels.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <Hotel size={12} className="shrink-0 mt-0.5" />
                  Common hotels: {(benchmark.common_hotels as string[]).slice(0, 4).join(", ")}
                </p>
              )}
              {topSimilarCases.length > 0 && (
                <div className="space-y-1 pt-1">
                  {topSimilarCases.slice(0, 3).map((match) => (
                    <div key={String(match.unified_case_id)} className="text-xs text-muted-foreground border-t pt-2 first:border-t-0 first:pt-0">
                      <span className="font-medium text-foreground">{String(match.destination)}</span>
                      <span className="ml-2">· {String(match.package_mode ?? "trip")}</span>
                      {match.total_price != null && <span className="ml-2"><Wallet size={11} className="inline mr-1" />{formatMoney(Number(match.total_price), brain.currency ?? "INR")}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
