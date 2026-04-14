/**
 * Advisory-style traveler analysis results — presents extraction as a
 * smart second opinion on a holiday quote, with a light customer-conversion layer.
 */
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin, Calendar, Users, CreditCard, Plane, Building2,
  AlertTriangle, Upload, ImageIcon, FileText, Phone, Lock,
  ArrowRight, Loader2, X, Shield, Wallet, Eye, MessageCircle,
  Lightbulb, ChevronRight, Sparkles, AlertCircle, Info,
} from "lucide-react";
import type {
  ItineraryAnalysis,
  AdvisoryInsight,
  NextInput,
  TravelerQuestion,
  TravelerOptionalPrompt,
  TravelerSignalCard,
  UnlockableModule,
} from "@/lib/itinerary-analysis-service";

interface Props {
  analysis: ItineraryAnalysis | null;
  files: File[];
  onUnlock: () => void;
  onAddMore: (newFiles: File[]) => void;
  onReanalyze: () => void;
  onReset: () => void;
  isReanalyzing?: boolean;
}

type CustomerConversionPayload = {
  hero_type?: string;
  hero_headline?: string;
  hero_subtext?: string;
  customer_proof_points?: string[];
  guided_action_blocks?: Array<{ code?: string; title?: string; detail?: string }>;
  comparison_table_data?: Record<string, unknown>;
  unlock_reason?: string;
  unlock_cta?: string;
  inspiration_capture_prompt?: string;
  inspiration_capture_help_text?: string;
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function fmt(n: number | null | undefined, currency?: string): string | null {
  if (n == null) return null;
  const c = currency ?? "INR";
  if (c === "INR") return `₹${Number(n).toLocaleString("en-IN")}`;
  return `${c} ${Number(n).toLocaleString("en-IN")}`;
}

function completenessLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Strong read", color: "text-emerald-600" };
  if (score >= 60) return { text: "Good read — some gaps", color: "text-primary" };
  if (score >= 30) return { text: "Partial read", color: "text-amber-600" };
  return { text: "Limited data", color: "text-muted-foreground" };
}

function severityStyles(severity: string) {
  if (severity === "critical") return { bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800/30", icon: "text-red-500" };
  if (severity === "warning") return { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800/30", icon: "text-amber-500" };
  return { bg: "bg-accent/50", border: "border-border", icon: "text-primary" };
}

function heroTone(heroType: string | undefined) {
  if (heroType === "no_cost_emi") return "bg-primary/5 border-primary/20";
  if (heroType === "savings") return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30";
  if (heroType === "risk") return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30";
  return "bg-accent/30 border-border";
}

const SectionHeader = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <Icon size={15} className="text-primary shrink-0" />
    <span className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</span>
    {badge}
  </div>
);

const Pill = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${className}`}>{children}</span>
);

function TripSnapshot({ a }: { a: ItineraryAnalysis }) {
  const destination = [a.destination_city, a.destination_country].filter(Boolean).join(", ");
  const dates = a.travel_start_date && a.travel_end_date
    ? `${a.travel_start_date} → ${a.travel_end_date}`
    : a.travel_start_date || a.travel_end_date || null;
  const duration = a.duration_nights ? `${a.duration_nights}N / ${a.duration_days ?? a.duration_nights + 1}D` : null;
  const pax = a.traveller_count_total
    ? `${a.traveller_count_total} traveller${a.traveller_count_total > 1 ? "s" : ""}${a.adults_count ? ` (${a.adults_count}A` : ""}${a.children_count ? ` ${a.children_count}C` : ""}${a.infants_count ? ` ${a.infants_count}I` : ""}${a.adults_count ? ")" : ""}`
    : null;
  const hotels = (a.hotel_names_json ?? []).length > 0 ? (a.hotel_names_json as string[]).join(", ") : null;
  const packageLabel = a.package_mode
    ? a.package_mode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const rows = [
    { icon: MapPin, label: "Destination", value: destination },
    { icon: Calendar, label: "Dates", value: dates },
    { icon: Calendar, label: "Duration", value: duration },
    { icon: Building2, label: "Hotels", value: hotels },
    { icon: CreditCard, label: "Total price", value: fmt(a.total_price, a.currency) },
    { icon: CreditCard, label: "Per person", value: fmt(a.price_per_person, a.currency) },
    { icon: Plane, label: "Package type", value: packageLabel },
    { icon: Users, label: "Travellers", value: pax },
  ].filter((row) => row.value);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      className="border rounded-xl p-3.5 space-y-1.5">
      <SectionHeader icon={MapPin} title="Trip Snapshot" />
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <row.icon size={12} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground">{row.label}</span>
          <span className="text-[11px] font-medium text-foreground ml-auto text-right max-w-[60%] truncate">{row.value}</span>
        </div>
      ))}
      {a.inclusions_text && a.inclusions_text.length > 5 && (
        <div className="pt-1.5 border-t mt-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">What's included</p>
          <p className="text-[11px] text-foreground leading-relaxed">{a.inclusions_text}</p>
        </div>
      )}
      {a.exclusions_text && a.exclusions_text.length > 5 && (
        <div className="pt-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Not included</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{a.exclusions_text}</p>
        </div>
      )}
    </motion.div>
  );
}

function HeroSummary({ customerConversion }: { customerConversion: CustomerConversionPayload }) {
  if (!customerConversion.hero_headline) return null;

  const comparisonData = asObject(customerConversion.comparison_table_data);
  const currentSeller = asObject(comparisonData.current_seller);
  const sankash = asObject(comparisonData.sankash);
  const proofPoints = asArray<string>(customerConversion.customer_proof_points).slice(0, 4);
  const actionBlocks = asArray<{ code?: string; title?: string }>(customerConversion.guided_action_blocks).slice(0, 4);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      className={`border rounded-xl p-3.5 space-y-3 ${heroTone(customerConversion.hero_type)}`}>
      <SectionHeader icon={customerConversion.hero_type === "risk" ? Shield : customerConversion.hero_type === "no_cost_emi" ? CreditCard : Sparkles} title="Quick Take" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{customerConversion.hero_headline}</p>
        {customerConversion.hero_subtext && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{customerConversion.hero_subtext}</p>
        )}
      </div>

      {proofPoints.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2">
          {proofPoints.map((point) => (
            <div key={point} className="rounded-lg border bg-background/80 px-3 py-2 text-[11px] text-foreground">{point}</div>
          ))}
        </div>
      )}

      {(Object.keys(currentSeller).length > 0 || Object.keys(sankash).length > 0) && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-background/80 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Current seller</p>
            {currentSeller.upfront_outflow && <p className="text-[11px] text-foreground">{String(currentSeller.upfront_outflow)}</p>}
            {currentSeller.quote_read && <p className="text-[10px] text-muted-foreground">{String(currentSeller.quote_read)}</p>}
            {currentSeller.flexibility && <p className="text-[10px] text-muted-foreground">{String(currentSeller.flexibility)}</p>}
          </div>
          <div className="rounded-lg border bg-background/80 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">SanKash route</p>
            {sankash.upfront_outflow && <p className="text-[11px] text-foreground">{String(sankash.upfront_outflow)}</p>}
            {sankash.quote_read && <p className="text-[10px] text-muted-foreground">{String(sankash.quote_read)}</p>}
            {sankash.flexibility && <p className="text-[10px] text-muted-foreground">{String(sankash.flexibility)}</p>}
          </div>
        </div>
      )}

      {actionBlocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actionBlocks.map((action) => (
            <div key={action.code ?? action.title} className="rounded-full border bg-background/80 px-2.5 py-1">
              <p className="text-[10px] font-medium text-foreground">{action.title}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function OurRead({ summary }: { summary: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="border rounded-xl p-3.5 bg-accent/30">
      <SectionHeader icon={Eye} title="Our Read" />
      <p className="text-[12px] text-foreground leading-relaxed">{summary}</p>
    </motion.div>
  );
}

function InsightCard({ insight }: { insight: AdvisoryInsight }) {
  const styles = severityStyles(insight.severity);
  const Icon = insight.severity === "critical" ? AlertCircle : insight.severity === "warning" ? AlertTriangle : Info;
  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg px-3 py-2.5`}>
      <div className="flex items-start gap-2">
        <Icon size={14} className={`${styles.icon} shrink-0 mt-0.5`} />
        <div>
          <p className="text-[11px] font-semibold text-foreground">{insight.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

function clipText(value: string, max = 72) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function buildManualReviewSignals(analysis: ItineraryAnalysis | null, files: File[]) {
  const signals: string[] = [];
  const destination = [analysis?.destination_city, analysis?.destination_country].filter(Boolean).join(", ");

  if (destination) signals.push(`Destination clue: ${destination}`);
  if (analysis?.duration_nights || analysis?.duration_days) {
    signals.push(`Duration clue: ${analysis.duration_nights ?? "?"}N / ${analysis.duration_days ?? "?"}D`);
  }
  if ((analysis?.hotel_names_json ?? []).length > 0) {
    signals.push(`Stay clue: ${(analysis?.hotel_names_json ?? []).slice(0, 2).join(", ")}`);
  }
  if ((analysis?.airline_names_json ?? []).length > 0 || (analysis?.sectors_json ?? []).length > 0) {
    const flightHint = [
      ...(analysis?.airline_names_json ?? []).slice(0, 1),
      ...(analysis?.sectors_json ?? []).slice(0, 1),
    ].filter(Boolean).join(" · ");
    if (flightHint) signals.push(`Flight clue: ${flightHint}`);
  }
  if (analysis?.total_price != null) {
    signals.push(`Price clue: ${analysis.currency ?? "INR"} ${Number(analysis.total_price).toLocaleString("en-IN")}`);
  } else if (analysis?.price_per_person != null) {
    signals.push(`Price clue: ${analysis.currency ?? "INR"} ${Number(analysis.price_per_person).toLocaleString("en-IN")} per person`);
  }
  if (analysis?.inclusions_text) {
    signals.push(`Visible in plan: ${clipText(analysis.inclusions_text)}`);
  } else if ((analysis?.extracted_snippets_json ?? []).length > 0) {
    const snippet = (analysis?.extracted_snippets_json ?? []).find((item) => typeof item === "string" && item.trim().length > 0);
    if (snippet) signals.push(`Visible in plan: ${clipText(String(snippet))}`);
  }

  if (signals.length === 0 && files.length > 0) {
    signals.push(files.length > 1 ? `${files.length} trip documents received` : "Trip document received");
  }

  return signals.slice(0, 4);
}

/** Small file thumbnail for add-more section */
function SmallFileThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="space-y-2">
      <SectionHeader icon={Lightbulb} title="Key Things to Check" />
      {sorted.map((insight, index) => <InsightCard key={index} insight={insight} />)}
    </motion.div>
  );
}

function SignalCards({ title, items, tone }: { title: string; items: TravelerSignalCard[]; tone: "good" | "check" }) {
  if (items.length === 0) return null;
  const toneClasses = tone === "good"
    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/30"
    : "bg-amber-50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/30";

  return (
    <div className="border rounded-xl p-3.5 space-y-2">
      <SectionHeader icon={tone === "good" ? Sparkles : Shield} title={title} />
      {items.map((item, index) => (
        <div key={item.code ?? index} className={`rounded-lg border px-3 py-2 ${toneClasses}`}>
          <p className="text-[11px] font-semibold text-foreground">{item.title}</p>
          {item.detail && <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>}
        </div>
      ))}
    </div>
  );
}

function TravelerQuestions({ questions }: { questions: TravelerQuestion[] }) {
  if (!questions || questions.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="border rounded-xl p-3.5 space-y-2">
      <SectionHeader icon={MessageCircle} title="Ask Before Booking" />
      <div className="space-y-1.5">
        {questions.map((question, index) => (
          <div key={question.code ?? index} className="flex items-start gap-2 py-0.5">
            <ChevronRight size={11} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-foreground leading-relaxed">{question.question}</p>
              {question.why && (
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{question.why}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OptionalPromptCard({ prompt, inspiration }: { prompt: TravelerOptionalPrompt | null; inspiration: Record<string, unknown> }) {
  if (!prompt && !inspiration.prompt) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
      className="border rounded-xl p-3.5 space-y-2 bg-accent/20">
      <SectionHeader icon={Upload} title="Improve This Review" />
      {prompt && (
        <div className="rounded-lg border bg-background/80 px-3 py-2">
          <p className="text-[11px] font-semibold text-foreground">{prompt.customer_prompt ?? "Add one more useful detail"}</p>
          {prompt.reason && <p className="text-[10px] text-muted-foreground mt-0.5">{prompt.reason}</p>}
          {prompt.suggested_upload && <p className="text-[10px] text-muted-foreground mt-1">Best upload: {prompt.suggested_upload}</p>}
        </div>
      )}
      {inspiration.prompt && (
        <div className="rounded-lg border bg-background/80 px-3 py-2">
          <p className="text-[11px] font-semibold text-foreground">{String(inspiration.prompt)}</p>
          {inspiration.help_text && <p className="text-[10px] text-muted-foreground mt-0.5">{String(inspiration.help_text)}</p>}
        </div>
      )}
    </motion.div>
  );
}

function MissingInputs({ inputs, addFileRef, additionalFiles, setAdditionalFiles, isReanalyzing, submitAdditional }: {
  inputs: NextInput[];
  addFileRef: React.RefObject<HTMLInputElement>;
  additionalFiles: File[];
  setAdditionalFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isReanalyzing?: boolean;
  submitAdditional: () => void;
}) {
  if (!inputs || inputs.length === 0) return null;
  const highPri = inputs.filter((input) => input.priority === "high");
  const rest = inputs.filter((input) => input.priority !== "high");
  const allInputs = [...highPri, ...rest];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="space-y-2">
      <SectionHeader icon={Upload} title="What's Missing" />
      {allInputs.map((input, index) => (
        <div key={index} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Upload size={12} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">{input.label}</p>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70 mt-0.5">{input.reason}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="border border-dashed rounded-lg p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Share More Trip Details</p>
        {additionalFiles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {additionalFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative flex items-center gap-1.5 bg-muted rounded px-2 py-1 pr-6 min-w-0">
                <FileText size={11} className="text-muted-foreground shrink-0" />
                <span className="text-[10px] text-foreground truncate max-w-[100px]">{file.name}</span>
                <button
                  onClick={(event) => { event.preventDefault(); setAdditionalFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index)); }}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full hover:bg-destructive/20 flex items-center justify-center"
                  aria-label="Remove"
                >
                  <X size={8} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs flex-1" onClick={() => addFileRef.current?.click()}>
            <ImageIcon size={12} /> Add screenshots, PDFs, or trip ideas
          </Button>
          {additionalFiles.length > 0 && (
            <Button size="sm" className="gap-1 text-xs" onClick={submitAdditional} disabled={isReanalyzing}>
              {isReanalyzing ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
              Re-analyze
            </Button>
          )}
        </div>
        <input
          ref={addFileRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          multiple
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            if (selected.length > 0) setAdditionalFiles((prev) => [...prev, ...selected].slice(0, 5));
            if (addFileRef.current) addFileRef.current.value = "";
          }}
        />
      </div>
    </motion.div>
  );
}

function UnlockableModules({ modules }: { modules: UnlockableModule[] }) {
  const relevant = (modules ?? []).filter((module) => module.available);
  if (relevant.length === 0) return null;

  const iconMap: Record<string, any> = {
    emi_estimate: CreditCard,
    trip_budgeting: Wallet,
    hotel_quality: Building2,
    compare_alternatives: Sparkles,
    insurance_check: Shield,
    visa_check: FileText,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="space-y-2">
      <SectionHeader icon={Sparkles} title="What We Can Unlock Next" />
      <div className="grid grid-cols-2 gap-2">
        {relevant.map((module, index) => {
          const ModIcon = iconMap[module.module_id] || Sparkles;
          return (
            <div key={index} className="border rounded-lg p-2.5 bg-accent/20 hover:bg-accent/40 transition-colors">
              <ModIcon size={14} className="text-primary mb-1" />
              <p className="text-[11px] font-semibold text-foreground">{module.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{module.description}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CompletenessBar({ score }: { score: number }) {
  const { text, color } = completenessLabel(score);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="border rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Review Completeness</span>
        <span className={`text-[11px] font-bold ${color}`}>{text}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">
        {score >= 70 ? "We have a good understanding of your trip to give you useful advice." : "Share more trip details to strengthen this review."}
      </p>
    </motion.div>
  );
}

export default function TravelerAnalysisResults({
  analysis: a,
  files,
  onUnlock,
  onAddMore,
  onReanalyze,
  onReset,
  isReanalyzing,
}: Props) {
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const addFileRef = useRef<HTMLInputElement>(null);

  const submitAdditional = () => {
    if (additionalFiles.length === 0) return;
    onAddMore(additionalFiles);
    setAdditionalFiles([]);
  };

  if (!a) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center py-10 space-y-3">
        <AlertTriangle size={28} className="mx-auto text-amber-500" />
        <p className="text-sm font-medium text-foreground">We couldn't read your trip details</p>
        <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
          Try sharing clearer screenshots or a PDF itinerary from your travel agent.
        </p>
        <Button variant="outline" size="sm" onClick={onReset}>Try with different details</Button>
      </motion.div>
    );
  }

  const score = a.extracted_completeness_score ?? 0;
  const insights = (a.advisory_insights_json ?? []) as AdvisoryInsight[];
  const questions = (a.traveler_questions_json ?? []) as TravelerQuestion[];
  const nextInputs = (a.next_inputs_needed_json ?? []) as NextInput[];
  const modules = (a.unlockable_modules_json ?? []) as UnlockableModule[];
  const hasAnyContent = !!(a.destination_city || a.total_price || a.travel_start_date);

  const priceStatus = sectionStatus([a?.total_price, a?.price_per_person]);
  const flightStatus = sectionStatus([a?.flight_departure_time, a?.flight_arrival_time, ...(a?.airline_names_json ?? []), ...(a?.sectors_json ?? [])]);
  const hotelStatus = sectionStatus([a?.hotel_check_in, a?.hotel_check_out, ...(a?.hotel_names_json ?? [])]);
  const tripStatus = sectionStatus([destination, a?.travel_start_date, a?.traveller_count_total, a?.duration_nights, a?.duration_days]);
  const confidence = a?.parsing_confidence ?? "low";
  const isLowConfidence = confidence === "low";
  const manualReviewSignals = buildManualReviewSignals(a, files);

  if (!hasAnyContent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center py-10 space-y-3">
        <AlertTriangle size={28} className="mx-auto text-amber-500" />
        <p className="text-sm font-medium text-foreground">We couldn't read your trip details</p>
        <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
          The items you shared may not contain recognisable travel information.
        </p>
        <Button variant="outline" size="sm" onClick={onReset}>Try with different details</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-5 space-y-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Quote Review</span>
          <Pill className={score >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}>
            {score >= 70 ? "Reviewed" : "Partial"}
          </Pill>
        </div>
        <button onClick={onReset} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
          Start over
        </button>
      </div>

      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
        <FileText size={13} className="text-muted-foreground shrink-0" />
        <span className="text-[11px] text-foreground font-medium truncate">
          {files.length > 1 ? `${files.length} trip details reviewed` : "Your travel quote reviewed"}
        </span>
      </div>

      <HeroSummary customerConversion={customerConversion} />
      <TripSnapshot a={a} />
      {a.advisory_summary && <OurRead summary={a.advisory_summary} />}
      <KeyInsights insights={insights} />

      {/* All missing / weakly-structured — graceful manual fallback */}
      {allMissing && (
        <div className="rounded-xl border bg-accent/20 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">We understood you're planning a trip</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our automatic review could not fully identify all the trip details from this file or format. Share your mobile number and our team will review it and continue with you on WhatsApp or call.
              </p>
            </div>
          </div>

          {manualReviewSignals.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">What we could still pick up</p>
              <div className="flex flex-wrap gap-1.5">
                {manualReviewSignals.map((signal) => (
                  <span key={signal} className="rounded-full border bg-background px-2.5 py-1 text-[10px] text-foreground">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TravelerQuestions questions={questions} />
      <OptionalPromptCard prompt={optionalPrompt} inspiration={inspirationCapture} />

      <MissingInputs
        inputs={nextInputs}
        addFileRef={addFileRef}
        additionalFiles={additionalFiles}
        setAdditionalFiles={setAdditionalFiles}
        isReanalyzing={isReanalyzing}
        submitAdditional={submitAdditional}
      />

      <UnlockableModules modules={modules} />
      <CompletenessBar score={score} />

      <div className="space-y-2 pt-1">
        <div className="relative rounded-xl overflow-hidden">
          <div className="space-y-1.5 select-none p-3" style={{ filter: "blur(4px)" }} aria-hidden>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
              <Shield size={13} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground">Personalised savings estimate and EMI breakdown</p>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
              <Wallet size={13} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground">Detailed trip budget with hidden cost analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Flights ── */}
      {flightStatus !== "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={flightStatus} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Flights</span>
          </div>
          <DataRow label="Departure" value={a?.flight_departure_time} icon={Plane} />
          <DataRow label="Arrival" value={a?.flight_arrival_time} icon={Plane} />
          {(a?.airline_names_json ?? []).length > 0 && (
            <DataRow label="Airlines" value={(a?.airline_names_json ?? []).join(", ")} icon={Plane} />
          )}
          {(a?.sectors_json ?? []).length > 0 && (
            <DataRow label="Sectors" value={(a?.sectors_json ?? []).join(", ")} icon={Plane} />
          )}
        </motion.div>
      )}

      {/* ── Section: Hotels ── */}
      {hotelStatus !== "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={hotelStatus} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hotels</span>
          </div>
          {(a?.hotel_names_json ?? []).length > 0 && (
            <DataRow label="Hotels" value={(a?.hotel_names_json ?? []).join(", ")} icon={Building2} />
          )}
          <DataRow label="Check-in" value={a?.hotel_check_in} icon={Calendar} />
          <DataRow label="Check-out" value={a?.hotel_check_out} icon={Calendar} />
        </motion.div>
      )}

      {/* ── Missing section prompts ── */}
      {priceStatus === "missing" && anyFound && (
        <MissingPrompt
          title="Price not detected"
          description="Upload a screenshot showing the trip price to unlock savings estimate and EMI options."
          uploadHint="Tip: A screenshot of the price summary page works best"
        />
      )}
      {flightStatus === "missing" && anyFound && (
        <MissingPrompt
          title="Flight details missing"
          description="Add a screenshot of your flight booking or itinerary to see departure/arrival times."
          uploadHint="Tip: Share the flight confirmation or booking screenshot"
        />
      )}
      {hotelStatus === "missing" && anyFound && (
        <MissingPrompt
          title="Hotel details missing"
          description="Upload hotel booking screenshots to complete your trip timeline."
          uploadHint="Tip: Share hotel confirmation emails or OTA booking screenshots"
        />
      )}

      {/* ── Add More Screenshots ── */}
      {anyFound && (
        <div className="border border-dashed rounded-lg p-3">
          {!addMoreExpanded ? (
            <button
              onClick={() => setAddMoreExpanded(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus size={13} /> Add more screenshots to improve results
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add More Files</p>
              {additionalFiles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {additionalFiles.map((f, i) => (
                    <SmallFileThumb
                      key={`${f.name}-${i}`}
                      file={f}
                      onRemove={() => setAdditionalFiles(prev => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs flex-1"
                  onClick={() => addFileRef.current?.click()}
                >
                  <ImageIcon size={12} /> Choose files
                </Button>
                {additionalFiles.length > 0 && (
                  <Button
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={submitAdditional}
                    disabled={isReanalyzing}
                  >
                    {isReanalyzing ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                    Re-analyze
                  </Button>
                )}
              </div>
              <input
                ref={addFileRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleAddFiles}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Unlock CTA ── */}
      <div className="space-y-2 pt-1">
        {anyFound && (
          <>
            <div className="relative rounded-xl overflow-hidden">
              <div className="space-y-1.5 select-none p-3" style={{ filter: "blur(4px)" }} aria-hidden>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
                  <Shield size={13} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground">Exact savings amount and EMI breakdown</p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
                  <Wallet size={13} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground">Recommended travel protection with pricing</p>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] px-4">
                <Lock size={16} className="text-primary mb-1.5" />
                <p className="font-heading font-bold text-xs text-foreground mb-0.5 text-center">
                  Unlock full review
                </p>
                <p className="text-[10px] text-muted-foreground mb-2 text-center max-w-[260px]">
                  Verify your mobile to see exact savings, EMI options, and trip recommendations
                </p>
                <Button size="sm" className="gap-1.5" onClick={onUnlock}>
                  <Phone size={13} /> Unlock full review
                </Button>
              </div>
            </div>
          </>
        )}

        {allMissing && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="sm" className="gap-1.5" onClick={onUnlock}>
              <Phone size={13} /> Continue with our team
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              Upload different files
            </Button>
          </div>
        )}
        </div>
      </div>

      {asArray<string>(a.extraction_warnings_json).length > 0 && (
        <div className="space-y-0.5 px-1 pt-1">
          {asArray<string>(a.extraction_warnings_json).map((warning, index) => (
            <p key={index} className="text-[10px] text-amber-600 italic">⚠️ {warning}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
