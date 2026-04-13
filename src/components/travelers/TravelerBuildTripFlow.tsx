import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Loader2,
  Sparkles,
  Wallet,
  MapPin,
  Link2,
  ImagePlus,
  Lightbulb,
  PlaneTakeoff,
  RotateCcw,
  MessageCircle,
  Star,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { createLeadWithDedup } from "@/lib/leads-service";
import { uploadLeadAttachment } from "@/lib/attachments-service";
import { refreshLeadTripIntelligence } from "@/lib/lead-trip-intelligence-service";
import { buildTravelerIntentSnapshot, markTravelerIntentSignal } from "@/lib/traveler-intent-session";
import type {
  TravelerInspirationInput,
  TravelerPreferences,
} from "@/lib/traveler-trip-context";
import {
  BUILD_TRIP_DEFAULTS,
  buildInspirationInputsFromText,
  buildTripEngine,
  type BuildTripBrief,
  type BuildTripConfidence,
  type BuildTripStartMode,
  type BuildTripVersionOutput,
} from "@/lib/build-my-trip";

const START_MODES: Array<{ value: BuildTripStartMode; label: string; icon: typeof Compass; help: string }> = [
  { value: "known_destination", label: "I know where", icon: MapPin, help: "You already know your destination. We'll shape the trip around it." },
  { value: "destination_discovery", label: "Help me choose", icon: Compass, help: "Tell us the vibe. We'll suggest where to go." },
  { value: "inspiration_dump", label: "Inspiration dump", icon: Sparkles, help: "Paste links, screenshots, hotel names — we'll read the pattern." },
];

const HOLIDAY_STYLES = [
  "beach", "mountains", "spiritual", "adventure", "family_holiday",
  "romantic_couple", "celebration", "city_break", "international_first_trip", "short_escape",
];

const TRAVELER_TYPES = ["couple", "family", "friends", "solo", "special_occasion"];

const BUDGET_OPTIONS = ["under_50k", "50k_1l", "1l_2l", "2l_5l", "above_5l"];

const PRIORITY_OPTIONS = [
  "lower_cost", "better_hotel", "better_experience", "easy_payment",
  "comfort", "luxury", "sightseeing", "family_time", "relaxation", "adventure",
];

const REFINEMENT_QUESTIONS = [
  {
    code: "hotel_vs_cost",
    question: "Better hotel or lower cost?",
    options: [
      { value: "better_hotel", label: "Better hotel" },
      { value: "lower_cost", label: "Lower cost" },
      { value: "balanced", label: "Balanced" },
    ],
  },
  {
    code: "comfort_vs_activities",
    question: "Family comfort or more activities?",
    options: [
      { value: "comfort", label: "More comfort" },
      { value: "activities", label: "More activities" },
      { value: "mix", label: "Good mix" },
    ],
  },
  {
    code: "emi_vs_stay",
    question: "Easier EMI or stronger stay?",
    options: [
      { value: "easy_payment", label: "Easier EMI" },
      { value: "better_hotel", label: "Stronger stay" },
      { value: "balanced", label: "Balanced" },
    ],
  },
];

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

function confidenceColor(confidence: BuildTripConfidence) {
  if (confidence === "high") return "text-brand-green";
  if (confidence === "medium") return "text-primary";
  return "text-muted-foreground";
}

function confidenceLabel(confidence: BuildTripConfidence) {
  if (confidence === "high") return "Strong signal";
  if (confidence === "medium") return "Likely";
  return "Early read";
}

function OurReadSection({
  engine,
}: {
  engine: ReturnType<typeof buildTripEngine>;
}) {
  const read = engine.synthesis.our_read;
  if (!engine.render_contract.show_our_read) return null;
  if (read.items.length === 0 && read.source_traces.length === 0) return null;

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{read.headline}</p>
        <p className="text-sm text-foreground">{read.summary}</p>
      </div>

      {read.items.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2">
          {read.items.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-lg border bg-accent/20 p-3 space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
              <p className={`text-[11px] font-medium ${confidenceColor(item.confidence)}`}>{confidenceLabel(item.confidence)}</p>
            </div>
          ))}
        </div>
      )}

      {read.source_traces.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Picked up from your shared details</p>
          <div className="flex flex-wrap gap-2">
            {read.source_traces.map((trace) => (
              <Badge key={trace} variant="outline">{trace}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function mapStartModeToLegacyEntryMode(mode: BuildTripStartMode) {
  if (mode === "known_destination") return "yes" as const;
  if (mode === "destination_discovery") return "no" as const;
  return "shortlisting_a_few_places" as const;
}

function versionTag(title: string): { label: string; color: string } {
  const lower = title.toLowerCase();
  if (lower.includes("realistic")) return { label: "Best fit", color: "bg-primary/10 text-primary border-primary/20" };
  if (lower.includes("upgraded")) return { label: "Premium pick", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700" };
  if (lower.includes("rebalance")) return { label: "Smart value", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700" };
  return { label: "Option", color: "bg-muted text-muted-foreground border-border" };
}

function VersionCard({
  version,
  isRecommended,
  whyFits,
}: {
  version: BuildTripVersionOutput;
  isRecommended?: boolean;
  whyFits?: string;
}) {
  const tag = versionTag(version.title);
  return (
    <div className={`relative rounded-2xl border p-4 sm:p-5 space-y-3 transition-shadow hover:shadow-card-hover ${isRecommended ? "border-primary/40 shadow-card ring-1 ring-primary/10" : "border-border"}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tag.color}`}>
          {isRecommended && <Star size={11} className="mr-1" />}
          {isRecommended ? "Recommended" : tag.label}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{version.price_summary}</p>
        {version.monthly_summary && (
          <p className="text-xs text-primary font-medium mt-0.5">{version.monthly_summary}</p>
        )}
      </div>
      {whyFits && (
        <p className="text-xs text-muted-foreground italic">"{whyFits}"</p>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed">{version.summary}</p>
    </div>
  );
}

function buildSaveNote(engine: ReturnType<typeof buildTripEngine>, isDuplicate: boolean) {
  const prefix = isDuplicate
    ? "We found an earlier trip shape from you and updated it."
    : "We saved this trip direction.";

  if (engine.signals.input_strength === "strong") {
    return `${prefix} You already have enough signal for a realistic version, a stronger version, and a clearer EMI direction.`;
  }

  if (engine.synthesis.next_clarification_prompt) {
    return `${prefix} The next useful detail is: ${engine.synthesis.next_clarification_prompt}`;
  }

  return `${prefix} We can now use this as the base for pricing, EMI, or a cleaner quote review.`;
}

export default function TravelerBuildTripFlow({
  onGoToQuoteReview,
  onGoToEmi,
}: {
  onGoToQuoteReview: () => void;
  onGoToEmi: () => void;
}) {
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState<BuildTripBrief>(BUILD_TRIP_DEFAULTS);
  const [preferences, setPreferences] = useState<TravelerPreferences>({});
  const [inspirationFiles, setInspirationFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedEngine, setSavedEngine] = useState<ReturnType<typeof buildTripEngine> | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [refining, setRefining] = useState(false);
  const [refinementAnswers, setRefinementAnswers] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const derivedInspirationInputs = useMemo<TravelerInspirationInput[]>(() => {
    const dumpInputs = buildInspirationInputsFromText(brief.inspiration_dump_text);
    const fileInputs = inspirationFiles.map((file) => ({
      type: "screenshot" as const,
      value: file.name,
      label: file.name,
    }));
    return [...dumpInputs, ...fileInputs];
  }, [brief.inspiration_dump_text, inspirationFiles]);

  const engine = useMemo(() => buildTripEngine({
    brief,
    preferences,
    inspirationInputs: derivedInspirationInputs,
  }), [brief, preferences, derivedInspirationInputs]);

  const canContinueStep1 = Boolean(brief.start_mode);
  const canContinueStep2 = brief.start_mode === "known_destination"
    ? Boolean(brief.destination_in_mind.trim())
    : brief.start_mode === "destination_discovery"
      ? Boolean(brief.holiday_style || brief.shortlisted_destinations.length > 0)
      : Boolean(brief.inspiration_dump_text.trim() || inspirationFiles.length > 0);
  const canContinueStep3 = canContinueStep2;
  const canSubmit = !saving && engine.render_contract.allow_save;
  const step3ContinueLabel = engine.render_contract.state === "structured_recommendation"
    ? "See trip versions"
    : engine.render_contract.state === "trip_direction"
      ? "See trip direction"
      : "See next useful question";

  const continueStep = () => {
    if (step === 1 && canContinueStep1) setStep(2);
    if (step === 2 && canContinueStep2) setStep(3);
    if (step === 3 && canContinueStep3) setStep(4);
  };

  const resetFlow = () => {
    setSubmitted(false);
    setSavedEngine(null);
    setSaveNote(null);
    setRefining(false);
    setRefinementAnswers({});
    setStep(1);
    setBrief(BUILD_TRIP_DEFAULTS);
    setPreferences({});
    setInspirationFiles([]);
  };

  const togglePriority = (value: string) => {
    setBrief((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(value)
        ? prev.priorities.filter((item) => item !== value)
        : [...prev.priorities, value].slice(0, 3),
    }));
  };

  const applyQuestionAnswer = (question: ReturnType<typeof buildTripEngine>["clarifying_questions"][number], value: string) => {
    if (question.target === "brief") {
      setBrief((prev) => ({
        ...prev,
        [question.field]: value,
        ...(question.field === "traveler_mix" ? { trip_type: value } : {}),
      }));
      return;
    }

    setPreferences((prev) => ({
      ...prev,
      [question.field]: value,
    }));
  };

  const handleInspirationFiles = (files: FileList | null) => {
    const nextFiles = Array.from(files ?? []).slice(0, 4);
    setInspirationFiles(nextFiles);
  };

  const handleTighten = () => {
    setRefining(true);
  };

  const applyRefinement = () => {
    const newPriorities = [...brief.priorities];
    Object.values(refinementAnswers).forEach((val) => {
      if (val && !newPriorities.includes(val) && val !== "balanced" && val !== "mix") {
        newPriorities.push(val);
      }
    });
    setBrief((prev) => ({ ...prev, priorities: newPriorities.slice(0, 5) }));
    setRefining(false);
    setSubmitted(false);
    setSavedEngine(null);
    setStep(4);
    toast.success("Trip direction updated with your preferences");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setSaveNote(null);
    markTravelerIntentSignal("submitted_build_trip_brief");

    try {
      const { lead, isDuplicate } = await createLeadWithDedup({
        full_name: "Build My Trip Traveler",
        audience_type: "traveler",
        lead_source_page: "for-travelers",
        lead_source_type: "traveler_emi_enquiry" as any,
        destination_type: brief.destination_in_mind || engine.synthesis.destination_shortlist[0] || humanize(brief.holiday_style || ""),
        detected_trip_type: brief.trip_type || brief.traveler_mix || "unknown",
        emi_flag: engine.synthesis.finance_read.no_cost_emi_relevant,
        message: `${engine.synthesis.trip_direction} ${engine.synthesis.bookable_read.summary}`.trim(),
        metadata_json: {
          public_entry_path: "build_my_trip",
          build_trip_brief: brief as unknown as Record<string, unknown>,
          build_trip_engine_snapshot: engine as unknown as Record<string, unknown>,
          build_trip_render_contract: engine.render_contract as unknown as Record<string, unknown>,
          traveler_trip_context: {
            preferences: engine.traveler_context,
            optional_note: brief.notes || null,
            inspiration_inputs: derivedInspirationInputs,
          },
          traveler_intent_session: buildTravelerIntentSnapshot({
            context: "build_trip_brief",
            file_count: inspirationFiles.length,
          }),
        } as any,
      });

      if (inspirationFiles.length > 0) {
        await Promise.all(
          inspirationFiles.map((file) => uploadLeadAttachment(file, lead.id, { sourceType: "trip_inspiration" })),
        );
      }

      void refreshLeadTripIntelligence(lead.id, "build_trip_created").catch(() => {});

      setSavedEngine(engine);
      setSubmitted(true);
      setSaveNote(buildSaveNote(engine, isDuplicate));
      toast.success(isDuplicate ? "Trip direction updated" : "Trip direction saved");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not save your trip direction");
    } finally {
      setSaving(false);
    }
  };

  const result = savedEngine ?? engine;

  // ── SUBMITTED / RESULTS STATE ──
  if (submitted) {
    // Refinement sub-state
    if (refining) {
      return (
        <div className="rounded-2xl border bg-card shadow-card p-5 space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Tighten trip direction</p>
            <h3 className="font-heading font-bold text-foreground text-base sm:text-lg">
              What should we optimise for?
            </h3>
            <p className="text-xs text-muted-foreground">Pick what matters. We'll reshape the versions.</p>
          </div>

          <div className="space-y-4">
            {REFINEMENT_QUESTIONS.map((rq) => (
              <div key={rq.code} className="space-y-2">
                <p className="text-sm font-medium text-foreground">{rq.question}</p>
                <div className="flex flex-wrap gap-2">
                  {rq.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRefinementAnswers((prev) => ({ ...prev, [rq.code]: opt.value }))}
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                        refinementAnswers[rq.code] === opt.value
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:border-primary/40 text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRefining(false)}>Back</Button>
            <Button className="gap-2" onClick={applyRefinement}>
              <Sparkles size={15} />
              Reshape trip
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border bg-card shadow-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Trip direction saved</p>
            <h3 className="font-heading font-bold text-foreground text-lg mt-1">{result.synthesis.headline}</h3>
            <p className="text-sm text-muted-foreground mt-1">{result.synthesis.subtext}</p>
            {saveNote && <p className="text-xs text-muted-foreground mt-2 italic">{saveNote}</p>}
          </div>
        </div>

        {/* Trip Direction + Bookable Read */}
        <div className="grid gap-3">
          {result.render_contract.show_trip_direction && (
            <div className="rounded-xl border bg-accent/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-primary" />
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Trip direction</p>
              </div>
              <p className="text-sm font-medium text-foreground">{result.synthesis.trip_direction}</p>
              <p className="text-xs text-muted-foreground">{result.synthesis.trip_structure}</p>
            </div>
          )}

          {result.render_contract.show_bookable_read && (
            <div className="rounded-xl border bg-accent/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <PlaneTakeoff size={14} className="text-primary" />
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">How bookable is this?</p>
              </div>
              <p className="text-sm text-foreground">{result.synthesis.bookable_read.summary}</p>
              <p className={`text-xs font-medium ${confidenceColor(result.synthesis.bookable_read.pricing_confidence)}`}>
                {result.synthesis.bookable_read.price_summary}
              </p>
            </div>
          )}
        </div>

        {/* Destination Shortlist */}
        {result.render_contract.show_destination_shortlist && result.synthesis.destination_shortlist.length > 0 && (
          <div className="rounded-xl border p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Destination shortlist</p>
            </div>
            <div className="space-y-2">
              {result.synthesis.destination_shortlist.map((destination, idx) => (
                <div key={destination} className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{destination}</span>
                  {idx === 0 && <Badge variant="outline" className="text-[10px] py-0">Strongest fit</Badge>}
                </div>
              ))}
            </div>
            {result.synthesis.destination_shortlist.length > 1 && (
              <p className="text-[11px] text-muted-foreground">Adding your travel month or budget will help us narrow this down further.</p>
            )}
          </div>
        )}

        <OurReadSection engine={result} />

        {result.render_contract.show_next_question && result.synthesis.next_clarification_prompt && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Next useful detail</p>
            <p className="text-sm text-foreground">{result.synthesis.next_clarification_prompt}</p>
          </div>
        )}

        {/* Version Cards */}
        {result.render_contract.show_versions && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Your trip versions</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.synthesis.realistic_version && (
                <VersionCard
                  version={result.synthesis.realistic_version}
                  isRecommended
                  whyFits="Closest to what you described, in a realistic budget range."
                />
              )}
              {result.synthesis.upgraded_version && (
                <VersionCard
                  version={result.synthesis.upgraded_version}
                  whyFits="Same vibe, but the hotel and key experiences are noticeably better."
                />
              )}
              {result.synthesis.rebalance_version && (
                <VersionCard
                  version={result.synthesis.rebalance_version}
                  whyFits="Shifts more value into the part of the trip that matters most to you."
                />
              )}
            </div>
          </div>
        )}

        {/* Payment / EMI */}
        {result.render_contract.show_finance_read && (
          <div className="rounded-xl border bg-accent/20 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-primary" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">EMI comfort</p>
            </div>
            <p className="text-sm text-foreground">{result.synthesis.finance_read.headline}</p>
            <div className="grid grid-cols-2 gap-2">
              {result.synthesis.finance_read.realistic_monthly && (
                <div className="rounded-lg bg-card border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Realistic version</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{result.synthesis.finance_read.realistic_monthly}</p>
                </div>
              )}
              {result.synthesis.finance_read.upgraded_monthly && (
                <div className="rounded-lg bg-card border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Upgraded version</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{result.synthesis.finance_read.upgraded_monthly}</p>
                </div>
              )}
            </div>
            {result.synthesis.finance_read.monthly_upgrade_delta && (
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <TrendingUp size={12} />
                Upgrade step-up: {result.synthesis.finance_read.monthly_upgrade_delta}
              </p>
            )}
          </div>
        )}

        {/* Budget + Aspiration summary */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Budget fit</p>
          <p className="text-sm text-foreground">{result.synthesis.budget_fit_summary}</p>
          {result.synthesis.aspiration_summary && (
            <p className="text-xs text-muted-foreground">{result.synthesis.aspiration_summary}</p>
          )}
        </div>

        {/* Future-ready: booking readiness placeholder */}
        <div className="rounded-xl border border-dashed border-primary/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Ready when you are</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <PlaneTakeoff size={16} className="mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Flights from —</p>
            </div>
            <div className="space-y-1">
              <Shield size={16} className="mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Hotels from —</p>
            </div>
            <div className="space-y-1">
              <Zap size={16} className="mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">EMI from —</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">Live pricing will appear here once supplier matching is active.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="gap-2" onClick={handleTighten}>
            <Sparkles size={15} /> Tighten this trip direction
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={result.synthesis.recommended_path === "check_your_emi" ? onGoToEmi : onGoToQuoteReview}
          >
            {result.synthesis.recommended_path === "check_your_emi" ? <Wallet size={15} /> : <ArrowRight size={15} />}
            {result.synthesis.next_step_label}
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => {/* future: open contact */}}>
            <MessageCircle size={15} /> Talk to us
          </Button>
          <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={resetFlow}>
            <RotateCcw size={15} /> Build another trip
          </Button>
        </div>
      </div>
    );
  }

  // ── INPUT FLOW ──
  return (
    <div className="rounded-2xl border bg-card shadow-card p-5 space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Build my trip</p>
        <h3 className="font-heading font-bold text-foreground text-base sm:text-lg leading-snug">
          {step === 1 ? "How do you want to start?"
            : step === 2 ? "Tell us a bit more"
            : step === 3 ? "Optional details that sharpen the plan"
            : "Your trip is taking shape"}
        </h3>
        {step === 1 && (
          <p className="text-xs text-muted-foreground">
            Pick whichever feels natural — destination, vibe, or just a saved link.
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`h-1 flex-1 rounded-full transition-colors ${item <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* STEP 1: Start mode */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-2">
            {START_MODES.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBrief((prev) => ({
                    ...prev,
                    start_mode: option.value,
                    entry_mode: mapStartModeToLegacyEntryMode(option.value),
                  }))}
                  className={`rounded-xl border p-3.5 text-left transition-all flex items-start gap-3 ${
                    brief.start_mode === option.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${brief.start_mode === option.value ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon size={16} className={brief.start_mode === option.value ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.help}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <Button className="gap-2" disabled={!canContinueStep1} onClick={continueStep}>
            Next <ArrowRight size={15} />
          </Button>
        </div>
      )}

      {/* STEP 2: Core input */}
      {step === 2 && (
        <div className="space-y-4">
          {brief.start_mode === "known_destination" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Where are you going?</label>
                <Input
                  placeholder="e.g. Bali, Vietnam, Kashmir"
                  value={brief.destination_in_mind}
                  onChange={(event) => setBrief((prev) => ({ ...prev, destination_in_mind: event.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Who is travelling?</p>
                <div className="flex flex-wrap gap-2">
                  {TRAVELER_TYPES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBrief((prev) => ({ ...prev, traveler_mix: option, trip_type: option }))}
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                        brief.traveler_mix === option ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {humanize(option)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {brief.start_mode === "destination_discovery" && (
            <>
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">What kind of holiday are you leaning toward?</p>
                <div className="flex flex-wrap gap-2">
                  {HOLIDAY_STYLES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBrief((prev) => ({ ...prev, holiday_style: option }))}
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                        brief.holiday_style === option ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {humanize(option)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Who is travelling?</p>
                <div className="flex flex-wrap gap-2">
                  {TRAVELER_TYPES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBrief((prev) => ({ ...prev, traveler_mix: option, trip_type: option }))}
                      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                        brief.traveler_mix === option ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {humanize(option)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {brief.start_mode === "inspiration_dump" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Paste your travel ideas</label>
                <Textarea
                  placeholder={"One line each works best:\nhttps://instagram.com/...\nmy friend suggested Phi Phi\nwant honeymoon vibe but manageable budget\nbeach resort with sunset view"}
                  value={brief.inspiration_dump_text}
                  onChange={(event) => setBrief((prev) => ({ ...prev, inspiration_dump_text: event.target.value }))}
                  rows={5}
                  className="text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Links, hotel names, place ideas, free text — anything goes. We'll read the pattern.
                </p>
              </div>

              <div className="rounded-xl border border-dashed p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-foreground">Screenshots or PDFs</p>
                  <p className="text-[11px] text-muted-foreground">Optional — add reels, saves, or trip notes.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={14} />
                  Add
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={(event) => handleInspirationFiles(event.target.files)}
                />
              </div>
              {inspirationFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {inspirationFiles.map((file) => (
                    <Badge key={file.name} variant="outline" className="text-[11px]">{file.name}</Badge>
                  ))}
                </div>
              )}

              {derivedInspirationInputs.length > 0 && (
                <div className="rounded-xl border bg-accent/20 p-3 space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">What we're picking up</p>
                  <div className="flex flex-wrap gap-1.5">
                    {derivedInspirationInputs.slice(0, 8).map((item, index) => (
                      <Badge key={`${item.type}-${item.value}-${index}`} variant="outline" className="text-[11px]">
                        {item.label ?? `${humanize(item.type)}: ${item.value}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button className="gap-2" disabled={!canContinueStep2} onClick={continueStep}>
              Next <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Optional details — conversational layout */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-3">
            <p className="text-xs text-primary font-medium">
              These are optional. You can skip and see your first trip direction now.
            </p>
          </div>

          {/* Budget — standalone */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">What's the rough budget?</p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBrief((prev) => ({ ...prev, approximate_budget_band: option }))}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                    brief.approximate_budget_band === option ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                  }`}
                >
                  {humanize(option)}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped: timing + logistics */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timing & logistics</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                placeholder="When? e.g. June, Diwali week"
                value={brief.tentative_month_or_dates}
                onChange={(event) => setBrief((prev) => ({ ...prev, tentative_month_or_dates: event.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="From where? e.g. Delhi, Mumbai"
                value={brief.departure_city}
                onChange={(event) => setBrief((prev) => ({ ...prev, departure_city: event.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="How long? e.g. 4N/5D, long weekend"
                value={brief.trip_duration}
                onChange={(event) => setBrief((prev) => ({ ...prev, trip_duration: event.target.value }))}
                className="text-sm"
              />
              <Input
                inputMode="numeric"
                placeholder="Budget is for how many people?"
                value={brief.budget_for_count}
                onChange={(event) => setBrief((prev) => ({ ...prev, budget_for_count: event.target.value.replace(/[^0-9]/g, "").slice(0, 2) }))}
                className="text-sm"
              />
            </div>
          </div>

          {/* Domestic/international */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Domestic or international?</p>
            <div className="flex flex-wrap gap-2">
              {["domestic", "international", "open"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBrief((prev) => ({ ...prev, domestic_or_international: option }))}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                    brief.domestic_or_international === option ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                  }`}
                >
                  {humanize(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button className="gap-2" disabled={!canContinueStep3} onClick={continueStep}>
              {step3ContinueLabel} <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Preview + shape */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Live preview */}
          <div className="rounded-xl border bg-accent/30 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Compass size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">{engine.synthesis.headline}</p>
                <p className="text-xs text-muted-foreground mt-1">{engine.synthesis.subtext}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {engine.signals.likely_destinations.slice(0, 4).map((destination) => (
                <Badge key={destination.destination} variant="outline" className="text-[11px]">{destination.destination}</Badge>
              ))}
              {engine.signals.vibe_signals.slice(0, 3).map((signal) => (
                <Badge key={signal} variant="outline" className="text-[11px]">{humanize(signal)}</Badge>
              ))}
            </div>
          </div>

          <OurReadSection engine={engine} />

          {engine.render_contract.show_next_question && engine.synthesis.next_clarification_prompt && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Next useful detail</p>
              <p className="text-sm text-foreground">{engine.synthesis.next_clarification_prompt}</p>
            </div>
          )}

          {/* Clarifying questions — conversational */}
          {engine.clarifying_questions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick questions to sharpen your plan</p>
              {engine.clarifying_questions.map((question) => {
                const selected = question.target === "brief"
                  ? String((brief as unknown as Record<string, unknown>)[question.field] ?? "")
                  : String((preferences as Record<string, unknown>)[question.field] ?? "");

                return (
                  <div key={question.code} className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{question.question}</p>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => applyQuestionAnswer(question, option.value)}
                          className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                            selected === option.value ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* What matters most */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">What matters most?</p>
            <p className="text-[11px] text-muted-foreground">Pick up to 3 — this shapes whether we lead with fit, pricing, or payment.</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => togglePriority(option)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                    brief.priorities.includes(option) ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:border-primary/40"
                  }`}
                >
                  {humanize(option)}
                </button>
              ))}
            </div>
          </div>

          {/* Anything else */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground">Anything we should keep in mind?</p>
            <Textarea
              placeholder="e.g. sunset hotel, easy travel with parents, or one great beach stay over a packed schedule"
              value={brief.notes}
              onChange={(event) => setBrief((prev) => ({ ...prev, notes: event.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Inline previews */}
          <div className="grid md:grid-cols-2 gap-3">
            {engine.render_contract.show_trip_direction && (
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Trip direction</p>
                </div>
                <p className="text-sm text-foreground">{engine.synthesis.trip_direction}</p>
                <p className="text-xs text-muted-foreground">{engine.synthesis.trip_structure}</p>
              </div>
            )}

            {engine.render_contract.show_bookable_read && (
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <PlaneTakeoff size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Bookable read</p>
                </div>
                <p className="text-sm text-foreground">{engine.synthesis.bookable_read.summary}</p>
                <p className={`text-xs font-medium ${confidenceColor(engine.synthesis.bookable_read.pricing_confidence)}`}>
                  {engine.synthesis.bookable_read.price_summary}
                </p>
              </div>
            )}

            {engine.render_contract.show_destination_shortlist && (
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Shortlist</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {engine.synthesis.destination_shortlist.length > 0 ? engine.synthesis.destination_shortlist.map((destination) => (
                    <Badge key={destination} variant="outline" className="text-[11px]">{destination}</Badge>
                  )) : <p className="text-xs text-muted-foreground">We still need one destination anchor.</p>}
                </div>
              </div>
            )}

            {engine.render_contract.show_finance_read && (
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">EMI comfort</p>
                </div>
                <p className="text-sm text-foreground">{engine.synthesis.finance_read.summary}</p>
                {engine.synthesis.finance_read.monthly_upgrade_delta && (
                  <p className="text-xs text-primary font-medium">Step-up: {engine.synthesis.finance_read.monthly_upgrade_delta}</p>
                )}
              </div>
            )}
          </div>

          {/* Version cards inline */}
          {engine.render_contract.show_versions && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {engine.synthesis.realistic_version && (
                <VersionCard version={engine.synthesis.realistic_version} isRecommended whyFits="Closest to what you described." />
              )}
              {engine.synthesis.upgraded_version && (
                <VersionCard version={engine.synthesis.upgraded_version} whyFits="Better hotel and key experiences." />
              )}
              {engine.synthesis.rebalance_version && (
                <VersionCard version={engine.synthesis.rebalance_version} whyFits="More value where it matters most." />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button className="gap-2" disabled={!canSubmit} onClick={handleSubmit}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Shape this trip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
