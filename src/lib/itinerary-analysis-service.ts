/**
 * Itinerary analysis service — triggers AI extraction + advisory and fetches results.
 * Traveler-side UI should consume the normalized output from this boundary layer
 * instead of trying to interpret mixed backend JSON shapes directly.
 */
import { supabase } from "@/integrations/supabase/client";

export interface AdvisoryInsight {
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  category: "pricing" | "logistics" | "coverage" | "inclusions" | "timing" | "quality";
}

export interface TravelerQuestion {
  code?: string;
  question: string;
  why?: string;
  priority?: string;
}

export interface NextInput {
  label: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface UnlockableModule {
  module_id: string;
  label: string;
  description: string;
  available: boolean;
}

export interface TravelerSignalCard {
  code?: string;
  title?: string;
  detail?: string;
  strength?: string;
}

export interface TravelerOptionalPrompt {
  customer_prompt?: string;
  reason?: string;
  suggested_upload?: string;
}

export interface DecisionFlags {
  transport_missing?: boolean;
  meals_incomplete?: boolean;
  insurance_missing?: boolean;
  visa_unclear?: boolean;
  per_person_unclear?: boolean;
  dates_incomplete?: boolean;
  price_unclear?: boolean;
}

export interface ItineraryAnalysis {
  id: string;
  lead_id: string;
  attachment_id: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by_audience: string | null;
  raw_text: string | null;
  parsing_confidence: string;
  domestic_or_international: string | null;
  destination_country: string | null;
  destination_city: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  duration_nights: number | null;
  duration_days: number | null;
  total_price: number | null;
  price_per_person: number | null;
  currency: string;
  traveller_count_total: number | null;
  adults_count: number | null;
  children_count: number | null;
  infants_count: number | null;
  travel_agent_name: string | null;
  customer_name: string | null;
  hotel_names_json: string[];
  airline_names_json: string[];
  sectors_json: string[];
  additional_destinations_json: string[];
  inclusions_text: string | null;
  exclusions_text: string | null;
  visa_mentioned: boolean | null;
  insurance_mentioned: boolean | null;
  emi_candidate: boolean;
  insurance_candidate: boolean;
  pg_candidate: boolean;
  missing_fields_json: string[];
  extracted_snippets_json: string[];
  extracted_fields_json: Record<string, unknown>;
  file_count: number;
  file_names_json: string[];
  extraction_warnings_json: string[];
  flight_departure_time: string | null;
  flight_arrival_time: string | null;
  hotel_check_in: string | null;
  hotel_check_out: string | null;
  confidence_notes: string | null;
  package_mode: string | null;
  extracted_completeness_score: number;
  advisory_summary: string | null;
  advisory_insights_json: AdvisoryInsight[];
  traveler_questions_json: TravelerQuestion[];
  seller_questions_json: TravelerQuestion[];
  next_inputs_needed_json: NextInput[];
  unlockable_modules_json: UnlockableModule[];
  enrichment_status_json: Record<string, string>;
  decision_flags_json: DecisionFlags;
  traveler_output_json?: Record<string, unknown>;
  pain_signals_json?: TravelerSignalCard[];
  pleasure_signals_json?: TravelerSignalCard[];
  customer_conversion_json?: Record<string, unknown>;
  optional_missing_prompts_json?: TravelerOptionalPrompt[];
  inspiration_capture_json?: Record<string, unknown>;
}

function coerceArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [];
  return [value as T];
}

function castObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    for (const key of ["question", "label", "title", "detail", "description", "reason", "message", "value"]) {
      const normalized = normalizeString(objectValue[key]);
      if (normalized) return normalized;
    }
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of coerceArray(value)) {
    const stringValue = normalizeString(item);
    if (!stringValue) continue;
    const key = stringValue.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(stringValue);
  }

  return normalized;
}

function normalizePriority(value: unknown): "high" | "medium" | "low" {
  return value === "high" || value === "medium" || value === "low"
    ? value
    : "medium";
}

function normalizeAdvisorySeverity(value: unknown): "info" | "warning" | "critical" {
  return value === "info" || value === "warning" || value === "critical"
    ? value
    : "info";
}

function normalizeAdvisoryCategory(value: unknown): AdvisoryInsight["category"] {
  return value === "pricing"
    || value === "logistics"
    || value === "coverage"
    || value === "inclusions"
    || value === "timing"
    || value === "quality"
    ? value
    : "quality";
}

function normalizeQuestionArray(value: unknown): TravelerQuestion[] {
  return coerceArray(value)
    .map((item, index) => {
      if (typeof item === "string") {
        const question = normalizeString(item);
        return question ? { code: `question-${index}`, question } : null;
      }

      const objectValue = castObject(item);
      const question = normalizeString(objectValue.question ?? objectValue.label ?? objectValue.title);
      if (!question) return null;

      return {
        code: normalizeString(objectValue.code) ?? `question-${index}`,
        question,
        why: normalizeString(objectValue.why ?? objectValue.reason) ?? undefined,
        priority: normalizeString(objectValue.priority) ?? undefined,
      } satisfies TravelerQuestion;
    })
    .filter(Boolean) as TravelerQuestion[];
}

function normalizeAdvisoryInsights(value: unknown): AdvisoryInsight[] {
  return coerceArray(value)
    .map((item) => {
      if (typeof item === "string") {
        const title = normalizeString(item);
        return title
          ? {
              title,
              description: "",
              severity: "info",
              category: "quality",
            } satisfies AdvisoryInsight
          : null;
      }

      const objectValue = castObject(item);
      const title = normalizeString(objectValue.title ?? objectValue.label);
      if (!title) return null;

      return {
        title,
        description: normalizeString(objectValue.description ?? objectValue.detail) ?? "",
        severity: normalizeAdvisorySeverity(objectValue.severity),
        category: normalizeAdvisoryCategory(objectValue.category),
      } satisfies AdvisoryInsight;
    })
    .filter((item): item is AdvisoryInsight => Boolean(item));
}

function normalizeNextInputs(value: unknown): NextInput[] {
  return coerceArray(value)
    .map((item) => {
      if (typeof item === "string") {
        const label = normalizeString(item);
        return label
          ? {
              label,
              reason: "",
              priority: "medium",
            } satisfies NextInput
          : null;
      }

      const objectValue = castObject(item);
      const label = normalizeString(objectValue.label ?? objectValue.question ?? objectValue.title);
      if (!label) return null;

      return {
        label,
        reason: normalizeString(objectValue.reason ?? objectValue.detail) ?? "",
        priority: normalizePriority(objectValue.priority),
      } satisfies NextInput;
    })
    .filter((item): item is NextInput => Boolean(item));
}

function normalizeUnlockableModules(value: unknown): UnlockableModule[] {
  return coerceArray(value)
    .map((item, index) => {
      if (typeof item === "string") {
        const label = normalizeString(item);
        return label
          ? {
              module_id: `module-${index}`,
              label,
              description: "",
              available: false,
            } satisfies UnlockableModule
          : null;
      }

      const objectValue = castObject(item);
      const label = normalizeString(objectValue.label ?? objectValue.title);
      if (!label) return null;

      return {
        module_id: normalizeString(objectValue.module_id ?? objectValue.code) ?? `module-${index}`,
        label,
        description: normalizeString(objectValue.description ?? objectValue.reason) ?? "",
        available: typeof objectValue.available === "boolean"
          ? objectValue.available
          : normalizeString(objectValue.status) === "ready",
      } satisfies UnlockableModule;
    })
    .filter((item): item is UnlockableModule => Boolean(item));
}

function normalizeSignalCards(value: unknown): TravelerSignalCard[] {
  return coerceArray(value)
    .map((item, index) => {
      if (typeof item === "string") {
        const title = normalizeString(item);
        return title ? { code: `signal-${index}`, title } satisfies TravelerSignalCard : null;
      }

      const objectValue = castObject(item);
      const title = normalizeString(objectValue.title ?? objectValue.label);
      const detail = normalizeString(objectValue.detail ?? objectValue.description ?? objectValue.reason);
      if (!title && !detail) return null;

      return {
        code: normalizeString(objectValue.code) ?? `signal-${index}`,
        title: title ?? undefined,
        detail: detail ?? undefined,
        strength: normalizeString(objectValue.strength ?? objectValue.severity) ?? undefined,
      } satisfies TravelerSignalCard;
    })
    .filter(Boolean) as TravelerSignalCard[];
}

function normalizeOptionalPrompts(value: unknown): TravelerOptionalPrompt[] {
  return coerceArray(value)
    .map((item) => {
      if (typeof item === "string") {
        const prompt = normalizeString(item);
        return prompt ? { customer_prompt: prompt } satisfies TravelerOptionalPrompt : null;
      }

      const objectValue = castObject(item);
      const customerPrompt = normalizeString(objectValue.customer_prompt ?? objectValue.prompt ?? objectValue.question ?? objectValue.title);
      const reason = normalizeString(objectValue.reason ?? objectValue.detail);
      const suggestedUpload = normalizeString(objectValue.suggested_upload ?? objectValue.suggested_input);
      if (!customerPrompt && !reason && !suggestedUpload) return null;

      return {
        customer_prompt: customerPrompt ?? undefined,
        reason: reason ?? undefined,
        suggested_upload: suggestedUpload ?? undefined,
      } satisfies TravelerOptionalPrompt;
    })
    .filter(Boolean) as TravelerOptionalPrompt[];
}

function normalizeInspirationCapture(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    return { prompt: value };
  }

  return castObject(value);
}

export function normalizeItineraryAnalysis(input: {
  analysis: unknown;
  traveler_output?: unknown;
}): ItineraryAnalysis {
  const analysis = castObject(input.analysis);
  const travelerOutput = castObject(input.traveler_output ?? analysis.traveler_output_json);

  const customerConversion = {
    ...castObject(analysis.customer_conversion_json),
    ...castObject(travelerOutput.customer_conversion),
  };
  const inspirationCapture = {
    ...normalizeInspirationCapture(analysis.inspiration_capture_json),
    ...normalizeInspirationCapture(travelerOutput.inspiration_capture),
  };

  const painSignalsFromAnalysis = normalizeSignalCards(analysis.pain_signals_json);
  const pleasureSignalsFromAnalysis = normalizeSignalCards(analysis.pleasure_signals_json);
  const optionalPromptsFromAnalysis = normalizeOptionalPrompts(analysis.optional_missing_prompts_json);

  return {
    ...(analysis as unknown as ItineraryAnalysis),
    hotel_names_json: normalizeStringArray(analysis.hotel_names_json),
    airline_names_json: normalizeStringArray(analysis.airline_names_json),
    sectors_json: normalizeStringArray(analysis.sectors_json),
    additional_destinations_json: normalizeStringArray(analysis.additional_destinations_json),
    missing_fields_json: normalizeStringArray(analysis.missing_fields_json),
    extracted_snippets_json: normalizeStringArray(analysis.extracted_snippets_json),
    file_names_json: normalizeStringArray(analysis.file_names_json),
    extraction_warnings_json: normalizeStringArray(analysis.extraction_warnings_json),
    extracted_fields_json: castObject(analysis.extracted_fields_json),
    advisory_insights_json: normalizeAdvisoryInsights(analysis.advisory_insights_json),
    traveler_questions_json: normalizeQuestionArray(analysis.traveler_questions_json),
    seller_questions_json: normalizeQuestionArray(analysis.seller_questions_json),
    next_inputs_needed_json: normalizeNextInputs(analysis.next_inputs_needed_json),
    unlockable_modules_json: normalizeUnlockableModules(analysis.unlockable_modules_json),
    enrichment_status_json: castObject(analysis.enrichment_status_json) as Record<string, string>,
    decision_flags_json: castObject(analysis.decision_flags_json) as DecisionFlags,
    traveler_output_json: travelerOutput,
    customer_conversion_json: customerConversion,
    pain_signals_json: painSignalsFromAnalysis.length > 0
      ? painSignalsFromAnalysis
      : normalizeSignalCards(travelerOutput.pain_signals),
    pleasure_signals_json: pleasureSignalsFromAnalysis.length > 0
      ? pleasureSignalsFromAnalysis
      : normalizeSignalCards(travelerOutput.pleasure_signals),
    optional_missing_prompts_json: optionalPromptsFromAnalysis.length > 0
      ? optionalPromptsFromAnalysis
      : normalizeOptionalPrompts(travelerOutput.optional_missing_prompts),
    inspiration_capture_json: inspirationCapture,
  };
}

/** Fetch existing analysis for a lead */
export async function fetchItineraryAnalysis(leadId: string): Promise<ItineraryAnalysis | null> {
  const { data, error } = await supabase
    .from("itinerary_analysis" as any)
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeItineraryAnalysis({ analysis: data }) : null;
}

export interface FileInput {
  file_url: string;
  file_name: string;
}

/** Trigger analysis via the edge function — supports multi-file */
export async function triggerItineraryAnalysis(params: {
  lead_id: string;
  attachment_id?: string;
  file_url?: string;
  file_name?: string;
  files?: FileInput[];
  audience_type?: string;
}): Promise<ItineraryAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-itinerary", {
    body: params,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return normalizeItineraryAnalysis({
    analysis: data.analysis,
    traveler_output: data.traveler_output,
  });
}
