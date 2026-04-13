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
} from "@/lib/build-my-trip";

const START_MODES: Array<{ value: BuildTripStartMode; label: string; help: string }> = [
  { value: "known_destination", label: "Known destination", help: "You already know where you want to go." },
  { value: "destination_discovery", label: "Destination discovery", help: "You need help choosing the right place." },
  { value: "inspiration_dump", label: "Inspiration dump", help: "You have links, screenshots, hotel ideas, and scattered travel notes." },
];

const HOLIDAY_STYLES = [
  "beach",
  "mountains",
  "spiritual",
  "adventure",
  "family_holiday",
  "romantic_couple",
  "celebration",
  "city_break",
  "international_first_trip",
  "short_escape",
];

const TRAVELER_TYPES = [
  "couple",
  "family",
  "friends",
  "solo",
  "special_occasion",
];

const BUDGET_OPTIONS = [
  "under_50k",
  "50k_1l",
  "1l_2l",
  "2l_5l",
  "above_5l",
];

const PRIORITY_OPTIONS = [
  "lower_cost",
  "better_hotel",
  "better_experience",
  "easy_payment",
  "comfort",
  "luxury",
  "sightseeing",
  "family_time",
  "relaxation",
  "adventure",
];

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

function confidenceTone(confidence: BuildTripConfidence) {
  if (confidence === "high") return "text-emerald-600";
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
              <p className={`text-[11px] font-medium ${confidenceTone(item.confidence)}`}>{confidenceLabel(item.confidence)}</p>
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
          build_trip_brief: brief,
          build_trip_engine_snapshot: engine,
          build_trip_render_contract: engine.render_contract,
          traveler_trip_context: {
            preferences: engine.traveler_context,
            optional_note: brief.notes || null,
            inspiration_inputs: derivedInspirationInputs,
          },
          traveler_intent_session: buildTravelerIntentSnapshot({
            context: "build_trip_brief",
            file_count: inspirationFiles.length,
          }),
        },
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

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Trip direction saved</p>
            <h3 className="font-heading font-bold text-foreground text-lg mt-1">{result.synthesis.headline}</h3>
            <p className="text-sm text-muted-foreground mt-1">{result.synthesis.subtext}</p>
            {saveNote && <p className="text-xs text-muted-foreground mt-2">{saveNote}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {result.render_contract.show_trip_direction && (
          <div className="rounded-xl border bg-accent/20 p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Trip direction</p>
            <p className="text-sm font-semibold text-foreground">{result.synthesis.trip_direction}</p>
            <p className="text-sm text-muted-foreground">{result.synthesis.trip_structure}</p>
          </div>
          )}
          {result.render_contract.show_bookable_read && (
          <div className="rounded-xl border bg-accent/20 p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Bookable read</p>
            <p className="text-sm font-semibold text-foreground">{result.synthesis.bookable_read.summary}</p>
            <p className={`text-xs font-medium ${confidenceTone(result.synthesis.bookable_read.pricing_confidence)}`}>
              {humanize(result.synthesis.bookable_read.pricing_type)} pricing · {result.synthesis.bookable_read.price_summary}
            </p>
          </div>
          )}
          <div className="rounded-xl border bg-accent/20 p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Budget fit</p>
            <p className="text-sm text-foreground">{result.synthesis.budget_fit_summary}</p>
            <p className="text-xs text-muted-foreground">{result.synthesis.aspiration_summary}</p>
          </div>
          {result.render_contract.show_finance_read && (
          <div className="rounded-xl border bg-accent/20 p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Payment stitch</p>
            <p className="text-sm text-foreground">{result.synthesis.finance_read.summary}</p>
            {result.synthesis.finance_read.monthly_upgrade_delta && (
              <p className="text-xs text-muted-foreground">
                Upgrade delta: {result.synthesis.finance_read.monthly_upgrade_delta}
              </p>
            )}
          </div>
          )}
        </div>

        <OurReadSection engine={result} />

        {result.render_contract.show_next_question && result.synthesis.next_clarification_prompt && (
          <div className="rounded-xl border p-4 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Most useful next detail</p>
            <p className="text-sm text-foreground">{result.synthesis.next_clarification_prompt}</p>
          </div>
        )}

        {result.render_contract.show_destination_shortlist && result.synthesis.destination_shortlist.length > 0 && (
          <div className="rounded-xl border p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Destination shortlist</p>
            <div className="flex flex-wrap gap-2">
              {result.synthesis.destination_shortlist.map((destination) => (
                <Badge key={destination} variant="outline">{destination}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3">
          {result.render_contract.show_versions && result.synthesis.realistic_version && (
            <div className="rounded-xl border p-4 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{result.synthesis.realistic_version.title}</p>
              <p className="text-sm font-semibold text-foreground">{result.synthesis.realistic_version.price_summary}</p>
              {result.synthesis.realistic_version.monthly_summary && <p className="text-xs text-muted-foreground">{result.synthesis.realistic_version.monthly_summary}</p>}
              <p className="text-xs text-muted-foreground">{result.synthesis.realistic_version.summary}</p>
            </div>
          )}
          {result.render_contract.show_versions && result.synthesis.upgraded_version && (
            <div className="rounded-xl border p-4 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{result.synthesis.upgraded_version.title}</p>
              <p className="text-sm font-semibold text-foreground">{result.synthesis.upgraded_version.price_summary}</p>
              {result.synthesis.upgraded_version.monthly_summary && <p className="text-xs text-muted-foreground">{result.synthesis.upgraded_version.monthly_summary}</p>}
              <p className="text-xs text-muted-foreground">{result.synthesis.upgraded_version.summary}</p>
            </div>
          )}
          {result.render_contract.show_versions && result.synthesis.rebalance_version && (
            <div className="rounded-xl border p-4 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{result.synthesis.rebalance_version.title}</p>
              <p className="text-sm font-semibold text-foreground">{result.synthesis.rebalance_version.price_summary}</p>
              {result.synthesis.rebalance_version.monthly_summary && <p className="text-xs text-muted-foreground">{result.synthesis.rebalance_version.monthly_summary}</p>}
              <p className="text-xs text-muted-foreground">{result.synthesis.rebalance_version.summary}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="gap-2"
            onClick={result.synthesis.recommended_path === "check_your_emi" ? onGoToEmi : onGoToQuoteReview}
          >
            {result.synthesis.next_step_label} <ArrowRight size={15} />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setSavedEngine(null);
              setStep(1);
              setBrief(BUILD_TRIP_DEFAULTS);
              setPreferences({});
              setInspirationFiles([]);
            }}
          >
            Build another trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card shadow-card p-5 space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Build my trip</p>
        <h3 className="font-heading font-bold text-foreground text-base sm:text-lg leading-snug">
          Start with a destination, start with a vibe, or just dump your saved ideas.
        </h3>
        <p className="text-xs text-muted-foreground">
          We’ll read the travel inspiration, ask only the next useful questions, and shape it toward a cleaner, more bookable, more payment-aware trip direction.
        </p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">How do you want to start?</p>
            <p className="text-xs text-muted-foreground mt-1">Choose the version of help that fits where you are right now.</p>
          </div>
          <div className="grid gap-2">
            {START_MODES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBrief((prev) => ({
                  ...prev,
                  start_mode: option.value,
                  entry_mode: mapStartModeToLegacyEntryMode(option.value),
                }))}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  brief.start_mode === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.help}</p>
              </button>
            ))}
          </div>
          <Button className="gap-2" disabled={!canContinueStep1} onClick={continueStep}>
            Next <ArrowRight size={15} />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {brief.start_mode === "known_destination" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Destination in mind</label>
                <Input
                  placeholder="e.g. Bali, Vietnam, Kashmir"
                  value={brief.destination_in_mind}
                  onChange={(event) => setBrief((prev) => ({ ...prev, destination_in_mind: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">What kind of trip is this?</p>
                <div className="flex flex-wrap gap-2">
                  {TRAVELER_TYPES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBrief((prev) => ({ ...prev, traveler_mix: option, trip_type: option }))}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        brief.traveler_mix === option ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
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
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        brief.holiday_style === option ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
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
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        brief.traveler_mix === option ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
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
                <label className="text-xs font-medium text-foreground">Paste the travel ideas you have saved</label>
                <Textarea
                  placeholder={"One line each works best:\nhttps://instagram.com/...\nmy friend suggested Phi Phi\nwant honeymoon vibe but manageable budget\nbeach resort with sunset view"}
                  value={brief.inspiration_dump_text}
                  onChange={(event) => setBrief((prev) => ({ ...prev, inspiration_dump_text: event.target.value }))}
                  rows={6}
                />
                <p className="text-[11px] text-muted-foreground">
                  Paste Instagram, YouTube, Klook, blogs, hotel names, place ideas, or free text. We do not need perfect formatting.
                </p>
              </div>

              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">Optional screenshots or PDFs</p>
                    <p className="text-[11px] text-muted-foreground">Add reels, screenshot saves, or trip notes if you want them stored with the trip idea.</p>
                  </div>
                  <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus size={15} />
                    Add files
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
                      <Badge key={file.name} variant="outline">{file.name}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {derivedInspirationInputs.length > 0 && (
                <div className="rounded-xl border bg-accent/20 p-3 space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">What we are already picking up</p>
                  <div className="flex flex-wrap gap-2">
                    {derivedInspirationInputs.slice(0, 8).map((item, index) => (
                      <Badge key={`${item.type}-${item.value}-${index}`} variant="outline">
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

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-accent/20 p-3">
            <p className="text-sm font-semibold text-foreground">These details sharpen the plan, but they are optional for the first read.</p>
            <p className="text-xs text-muted-foreground mt-1">
              If you already want to see the first trip direction, continue with what you have. You can still add timing, budget, and departure details after.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Approximate budget</label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBrief((prev) => ({ ...prev, approximate_budget_band: option }))}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      brief.approximate_budget_band === option ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {humanize(option)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Budget is for how many people?</label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 2"
                value={brief.budget_for_count}
                onChange={(event) => setBrief((prev) => ({ ...prev, budget_for_count: event.target.value.replace(/[^0-9]/g, "").slice(0, 2) }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Domestic or international?</label>
              <div className="flex flex-wrap gap-2">
                {["domestic", "international", "open"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBrief((prev) => ({ ...prev, domestic_or_international: option }))}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      brief.domestic_or_international === option ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {humanize(option)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tentative month or dates</label>
              <Input
                placeholder="e.g. June, Diwali week, 15–20 May"
                value={brief.tentative_month_or_dates}
                onChange={(event) => setBrief((prev) => ({ ...prev, tentative_month_or_dates: event.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Departure city</label>
              <Input
                placeholder="e.g. Delhi, Mumbai, Bengaluru"
                value={brief.departure_city}
                onChange={(event) => setBrief((prev) => ({ ...prev, departure_city: event.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Trip duration</label>
              <Input
                placeholder="e.g. 4N/5D, long weekend, 7 days"
                value={brief.trip_duration}
                onChange={(event) => setBrief((prev) => ({ ...prev, trip_duration: event.target.value }))}
              />
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

      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-accent/20 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Compass size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{engine.synthesis.headline}</p>
                <p className="text-xs text-muted-foreground mt-1">{engine.synthesis.subtext}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {engine.signals.likely_destinations.slice(0, 4).map((destination) => (
                <Badge key={destination.destination} variant="outline">{destination.destination}</Badge>
              ))}
              {engine.signals.vibe_signals.slice(0, 4).map((signal) => (
                <Badge key={signal} variant="outline">{humanize(signal)}</Badge>
              ))}
            </div>
          </div>

          <OurReadSection engine={engine} />

          {engine.render_contract.show_next_question && engine.synthesis.next_clarification_prompt && (
            <div className="rounded-xl border p-4 space-y-1.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Most useful next detail</p>
              <p className="text-sm text-foreground">{engine.synthesis.next_clarification_prompt}</p>
            </div>
          )}

          {engine.clarifying_questions.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">A couple of smart questions before we shape this properly</p>
                <p className="text-xs text-muted-foreground mt-1">These are optional, but they make the next version much sharper.</p>
              </div>
              {engine.clarifying_questions.map((question) => {
                const selected = question.target === "brief"
                  ? String((brief as Record<string, unknown>)[question.field] ?? "")
                  : String((preferences as Record<string, unknown>)[question.field] ?? "");

                return (
                  <div key={question.code} className="rounded-xl border p-3 space-y-2">
                    <p className="text-sm font-semibold text-foreground">{question.question}</p>
                    <p className="text-[11px] text-muted-foreground">{question.why}</p>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => applyQuestionAnswer(question, option.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            selected === option.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
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

          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">What matters most?</p>
            <p className="text-xs text-muted-foreground">Pick up to 3. This helps us decide whether to lead with better fit, bookable direction, or smarter payment.</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => togglePriority(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    brief.priorities.includes(option) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  {humanize(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Anything else we should keep in mind?</label>
            <Textarea
              placeholder="Example: want a sunset hotel, easy travel with parents, or one strong beach stay over a packed schedule"
              value={brief.notes}
              onChange={(event) => setBrief((prev) => ({ ...prev, notes: event.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {engine.render_contract.show_trip_direction && (
            <div className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={15} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Trip direction</p>
              </div>
              <p className="text-sm text-foreground">{engine.synthesis.trip_direction}</p>
              <p className="text-xs text-muted-foreground">{engine.synthesis.trip_structure}</p>
            </div>
            )}

            {engine.render_contract.show_bookable_read && (
            <div className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <PlaneTakeoff size={15} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Bookable read</p>
              </div>
              <p className="text-sm text-foreground">{engine.synthesis.bookable_read.summary}</p>
              <p className={`text-xs font-medium ${confidenceTone(engine.synthesis.bookable_read.pricing_confidence)}`}>
                {humanize(engine.synthesis.bookable_read.pricing_type)} pricing · {engine.synthesis.bookable_read.price_summary}
              </p>
            </div>
            )}

            {engine.render_contract.show_destination_shortlist && (
            <div className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Destination shortlist</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {engine.synthesis.destination_shortlist.length > 0 ? engine.synthesis.destination_shortlist.map((destination) => (
                  <Badge key={destination} variant="outline">{destination}</Badge>
                )) : <p className="text-xs text-muted-foreground">We still need one destination anchor.</p>}
              </div>
            </div>
            )}

            {engine.render_contract.show_finance_read && (
            <div className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Payment stitch</p>
              </div>
              <p className="text-sm text-foreground">{engine.synthesis.finance_read.summary}</p>
              {engine.synthesis.finance_read.monthly_upgrade_delta && (
                <p className="text-xs text-muted-foreground">Upgrade step-up: {engine.synthesis.finance_read.monthly_upgrade_delta}</p>
              )}
            </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {engine.render_contract.show_versions && engine.synthesis.realistic_version && (
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{engine.synthesis.realistic_version.title}</p>
                <p className="text-sm font-semibold text-foreground">{engine.synthesis.realistic_version.price_summary}</p>
                {engine.synthesis.realistic_version.monthly_summary && <p className="text-xs text-muted-foreground">{engine.synthesis.realistic_version.monthly_summary}</p>}
                <p className="text-xs text-muted-foreground">{engine.synthesis.realistic_version.summary}</p>
              </div>
            )}
            {engine.render_contract.show_versions && engine.synthesis.upgraded_version && (
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{engine.synthesis.upgraded_version.title}</p>
                <p className="text-sm font-semibold text-foreground">{engine.synthesis.upgraded_version.price_summary}</p>
                {engine.synthesis.upgraded_version.monthly_summary && <p className="text-xs text-muted-foreground">{engine.synthesis.upgraded_version.monthly_summary}</p>}
                <p className="text-xs text-muted-foreground">{engine.synthesis.upgraded_version.summary}</p>
              </div>
            )}
            {engine.render_contract.show_versions && engine.synthesis.rebalance_version && (
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{engine.synthesis.rebalance_version.title}</p>
                <p className="text-sm font-semibold text-foreground">{engine.synthesis.rebalance_version.price_summary}</p>
                {engine.synthesis.rebalance_version.monthly_summary && <p className="text-xs text-muted-foreground">{engine.synthesis.rebalance_version.monthly_summary}</p>}
                <p className="text-xs text-muted-foreground">{engine.synthesis.rebalance_version.summary}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button className="gap-2" disabled={!canSubmit} onClick={handleSubmit}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Shape this trip
            </Button>
            <Button
              variant="ghost"
              onClick={engine.synthesis.recommended_path === "check_your_emi" ? onGoToEmi : onGoToQuoteReview}
              className="gap-2"
            >
              {engine.synthesis.recommended_path === "check_your_emi" ? <Wallet size={15} /> : <Link2 size={15} />}
              {engine.synthesis.next_step_label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
