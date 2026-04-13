/**
 * Build My Trip — service layer for backend calls and response mapping.
 * 
 * This file owns the contract between the frontend and the analyze-itinerary
 * edge function when called from Build My Trip context.
 * 
 * Codex owns backend logic. This file is a pure consumer of backend fields.
 */
import { supabase } from "@/integrations/supabase/client";

/* ─── Rich result types ─── */

export interface TripVersion {
  label: string;
  tag?: string;
  headline: string;
  summary: string;
  highlights: string[];
  emiMonthly?: string;
  emiTenure?: string;
  emiStepUp?: string; // e.g. "+₹800/mo vs realistic"
  tagColor?: string;
}

export interface DestinationOption {
  name: string;
  whyItFits: string;
  bestFor?: string;
  estimatedBudget?: string;
}

export interface TripStructure {
  headline: string;
  nights: string;
  segments: string[];
  packageMode?: string;
}

export interface ClarifyingQuestion {
  question: string;
  whyItMatters: string;
  options?: string[];
}

export interface BudgetFit {
  headline: string;
  totalEstimate: string;
  perPerson?: string;
  currency: string;
  position: string; // e.g. "mid-range", "premium"
  insight: string;
}

export interface FinanceDirection {
  headline: string;
  emiSignal: string;
  nosCostAvailable: boolean;
  suggestedTenure?: string;
  monthlyEstimate?: string;
}

export interface BuildMyTripResult {
  // Top-level direction
  direction: string;
  whyItFits: string;
  nextStep: string;

  // Rich sections (any may be absent depending on backend confidence)
  destinationShortlist: DestinationOption[];
  tripStructure: TripStructure | null;
  clarifyingQuestions: ClarifyingQuestion[];
  budgetFit: BudgetFit | null;
  financeDirection: FinanceDirection | null;

  // Versions
  versions: TripVersion[];

  // Extras
  emiSignal?: string;
  deeperDetails: string[];

  // Strength indicator for the frontend to decide rendering depth
  resultStrength: "strong" | "medium" | "weak";
}

/* ─── Inspiration item type ─── */
export interface InspirationItem {
  type: "link" | "text" | "file";
  value: string;
  file?: File;
}

/* ─── Payload builder ─── */
export function buildPayload(
  mode: "destination" | "explore" | "inspiration",
  inputs: {
    destination?: string;
    mood?: string;
    inspirationItems?: InspirationItem[];
  },
  fileUrls?: { file_url: string; file_name: string }[]
): Record<string, any> {
  const payload: Record<string, any> = {
    mode,
    audience_type: "traveler",
    source: "build-my-trip",
  };

  if (mode === "destination") {
    payload.destination = inputs.destination?.trim();
  } else if (mode === "explore") {
    payload.mood = inputs.mood?.trim();
  } else if (mode === "inspiration") {
    payload.inspiration_items = (inputs.inspirationItems ?? []).map((item) => ({
      type: item.type,
      value: item.value,
    }));
  }

  if (fileUrls && fileUrls.length > 0) {
    payload.files = fileUrls;
  }

  return payload;
}

/* ─── File upload helper ─── */
export async function uploadInspirationFiles(
  items: InspirationItem[]
): Promise<{ file_url: string; file_name: string }[]> {
  const fileItems = items.filter((item) => item.file);
  const fileUrls: { file_url: string; file_name: string }[] = [];

  for (const item of fileItems) {
    if (!item.file) continue;
    const ext = item.file.name.split(".").pop() ?? "bin";
    const storagePath = `build-my-trip/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("lead-attachments")
      .upload(storagePath, item.file);

    if (uploadError) {
      console.warn("File upload failed:", uploadError.message);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from("lead-attachments")
      .getPublicUrl(storagePath);

    fileUrls.push({ file_url: urlData.publicUrl, file_name: item.file.name });
  }

  return fileUrls;
}

/* ─── Backend invocation ─── */
export async function invokeBuildMyTrip(
  payload: Record<string, any>
): Promise<{ raw: any; mapped: BuildMyTripResult | null }> {
  const { data, error } = await supabase.functions.invoke("analyze-itinerary", {
    body: payload,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  const mapped = mapBackendResponse(data, payload);
  return { raw: data, mapped };
}

/* ─── Response mapper ─── */
function mapBackendResponse(
  data: any,
  payload: Record<string, any>
): BuildMyTripResult | null {
  const travelerOutput = data?.traveler_output;
  const analysis = data?.analysis;

  // If backend returned nothing meaningful, return null (triggers fallback)
  if (!travelerOutput && !analysis) return null;

  const mode = payload.mode;
  const destination = payload.destination;

  // Determine result strength
  const hasVersions = !!(travelerOutput?.realistic_version || travelerOutput?.upgraded_version);
  const hasBudget = !!(travelerOutput?.budget_fit || analysis?.total_price);
  const hasStructure = !!(travelerOutput?.trip_structure || analysis?.duration_nights);
  const strength: "strong" | "medium" | "weak" =
    hasVersions && hasBudget ? "strong" :
    hasStructure || hasBudget || hasVersions ? "medium" : "weak";

  // Map destination shortlist
  const destinationShortlist: DestinationOption[] = [];
  if (Array.isArray(travelerOutput?.destination_shortlist)) {
    for (const d of travelerOutput.destination_shortlist) {
      destinationShortlist.push({
        name: d.name || d.destination || "",
        whyItFits: d.why_it_fits || d.reason || "",
        bestFor: d.best_for,
        estimatedBudget: d.estimated_budget,
      });
    }
  }

  // Map trip structure
  let tripStructure: TripStructure | null = null;
  if (travelerOutput?.trip_structure) {
    const ts = travelerOutput.trip_structure;
    tripStructure = {
      headline: ts.headline || "",
      nights: ts.nights || (analysis?.duration_nights ? `${analysis.duration_nights}N` : ""),
      segments: Array.isArray(ts.segments) ? ts.segments : [],
      packageMode: ts.package_mode || analysis?.package_mode,
    };
  } else if (analysis?.duration_nights) {
    tripStructure = {
      headline: `${analysis.duration_nights}N trip${analysis.destination_city ? ` to ${analysis.destination_city}` : ""}`,
      nights: `${analysis.duration_nights}N`,
      segments: [],
      packageMode: analysis.package_mode,
    };
  }

  // Map clarifying questions
  const clarifyingQuestions: ClarifyingQuestion[] = [];
  if (Array.isArray(travelerOutput?.clarifying_questions)) {
    for (const q of travelerOutput.clarifying_questions) {
      clarifyingQuestions.push({
        question: typeof q === "string" ? q : q.question || "",
        whyItMatters: typeof q === "string" ? "" : q.why_it_matters || "",
        options: Array.isArray(q?.options) ? q.options : undefined,
      });
    }
  } else if (Array.isArray(analysis?.traveler_questions_json)) {
    for (const q of analysis.traveler_questions_json) {
      clarifyingQuestions.push({
        question: typeof q === "string" ? q : String(q),
        whyItMatters: "",
      });
    }
  }

  // Map budget fit
  let budgetFit: BudgetFit | null = null;
  if (travelerOutput?.budget_fit) {
    const bf = travelerOutput.budget_fit;
    budgetFit = {
      headline: bf.headline || "Budget estimate",
      totalEstimate: bf.total_estimate || "",
      perPerson: bf.per_person,
      currency: bf.currency || analysis?.currency || "INR",
      position: bf.position || "mid-range",
      insight: bf.insight || "",
    };
  } else if (analysis?.total_price) {
    budgetFit = {
      headline: "Estimated budget",
      totalEstimate: `₹${analysis.total_price.toLocaleString("en-IN")}`,
      perPerson: analysis.price_per_person ? `₹${analysis.price_per_person.toLocaleString("en-IN")}/person` : undefined,
      currency: analysis.currency || "INR",
      position: "estimated",
      insight: "",
    };
  }

  // Map finance direction
  let financeDirection: FinanceDirection | null = null;
  if (travelerOutput?.finance_direction) {
    const fd = travelerOutput.finance_direction;
    financeDirection = {
      headline: fd.headline || "EMI options",
      emiSignal: fd.emi_signal || "",
      nosCostAvailable: fd.no_cost_available ?? false,
      suggestedTenure: fd.suggested_tenure,
      monthlyEstimate: fd.monthly_estimate,
    };
  }

  // Map versions
  const versions: TripVersion[] = [];

  if (travelerOutput?.realistic_version) {
    const rv = travelerOutput.realistic_version;
    versions.push({
      label: "Realistic Version",
      tag: "Best fit",
      headline: rv.headline || "Your trip",
      summary: rv.summary || "",
      highlights: Array.isArray(rv.highlights) ? rv.highlights : [],
      emiMonthly: rv.emi_monthly,
      emiTenure: rv.emi_tenure,
    });
  }

  if (travelerOutput?.upgraded_version) {
    const uv = travelerOutput.upgraded_version;
    versions.push({
      label: "Upgraded Version",
      headline: uv.headline || "Premium option",
      summary: uv.summary || "",
      highlights: Array.isArray(uv.highlights) ? uv.highlights : [],
      emiMonthly: uv.emi_monthly,
      emiTenure: uv.emi_tenure,
      emiStepUp: uv.emi_step_up,
      tagColor: "bg-brand-coral/10 text-brand-coral",
    });
  }

  if (travelerOutput?.rebalance_version) {
    const rb = travelerOutput.rebalance_version;
    versions.push({
      label: "Rebalanced",
      tag: "Smart trade-off",
      headline: rb.headline || "Rebalanced option",
      summary: rb.summary || "",
      highlights: Array.isArray(rb.highlights) ? rb.highlights : [],
      emiMonthly: rb.emi_monthly,
      emiTenure: rb.emi_tenure,
      emiStepUp: rb.emi_step_up,
      tagColor: "bg-brand-green/10 text-brand-green",
    });
  }

  return {
    direction:
      travelerOutput?.headline_takeaway ||
      analysis?.advisory_summary ||
      `Your ${mode === "destination" ? destination : "trip"} direction`,
    whyItFits:
      travelerOutput?.concise_explanation ||
      analysis?.advisory_summary ||
      "Based on what you shared, here's what we found.",
    nextStep:
      travelerOutput?.next_step ||
      "Share your mobile number to receive a detailed trip plan with real pricing and EMI options.",
    destinationShortlist,
    tripStructure,
    clarifyingQuestions,
    budgetFit,
    financeDirection,
    versions,
    emiSignal: travelerOutput?.emi_signal || undefined,
    deeperDetails: Array.isArray(travelerOutput?.deeper_details)
      ? travelerOutput.deeper_details
      : [],
    resultStrength: strength,
  };
}
