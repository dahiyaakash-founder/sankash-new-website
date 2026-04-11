/**
 * Advisory-style traveler analysis results — presents extraction as a
 * smart second opinion on a holiday quote.
 */
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin, Calendar, Users, CreditCard, Plane, Building2,
  CheckCircle2, AlertTriangle, Plus, Upload, ImageIcon,
  FileText, Phone, Lock, ArrowRight, Loader2, X,
  Shield, Wallet, Eye, HelpCircle, MessageCircle,
  Lightbulb, ChevronRight, Sparkles, AlertCircle, Info,
} from "lucide-react";
import type {
  ItineraryAnalysis,
  AdvisoryInsight,
  NextInput,
  UnlockableModule,
} from "@/lib/itinerary-analysis-service";

/* ── Props ── */

interface Props {
  analysis: ItineraryAnalysis | null;
  files: File[];
  onUnlock: () => void;
  onAddMore: (newFiles: File[]) => void;
  onReanalyze: () => void;
  onReset: () => void;
  isReanalyzing?: boolean;
}

/* ── Helpers ── */

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

/* ── Sub-components ── */

function TripSnapshot({ a }: { a: ItineraryAnalysis }) {
  const destination = [a.destination_city, a.destination_country].filter(Boolean).join(", ");
  const dates = a.travel_start_date && a.travel_end_date
    ? `${a.travel_start_date} → ${a.travel_end_date}`
    : a.travel_start_date || a.travel_end_date || null;
  const duration = a.duration_nights
    ? `${a.duration_nights}N / ${a.duration_days ?? a.duration_nights + 1}D`
    : null;
  const pax = a.traveller_count_total
    ? `${a.traveller_count_total} traveller${a.traveller_count_total > 1 ? "s" : ""}${a.adults_count ? ` (${a.adults_count}A` : ""}${a.children_count ? ` ${a.children_count}C` : ""}${a.infants_count ? ` ${a.infants_count}I` : ""}${a.adults_count ? ")" : ""}`
    : null;
  const hotels = (a.hotel_names_json ?? []).length > 0 ? (a.hotel_names_json as string[]).join(", ") : null;
  const packageLabel = a.package_mode
    ? a.package_mode.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
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
  ].filter(r => r.value);

  const hasInclusions = a.inclusions_text && a.inclusions_text.length > 5;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      className="border rounded-xl p-3.5 space-y-1.5">
      <SectionHeader icon={MapPin} title="Trip Snapshot" />
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <r.icon size={12} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground">{r.label}</span>
          <span className="text-[11px] font-medium text-foreground ml-auto text-right max-w-[60%] truncate">{r.value}</span>
        </div>
      ))}
      {hasInclusions && (
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

function KeyInsights({ insights }: { insights: AdvisoryInsight[] }) {
  if (!insights || insights.length === 0) return null;
  // Sort: critical first, then warning, then info
  const sorted = [...insights].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="space-y-2">
      <SectionHeader icon={Lightbulb} title="Key Things to Check" />
      {sorted.map((ins, i) => <InsightCard key={i} insight={ins} />)}
    </motion.div>
  );
}

function TravelerQuestions({ questions }: { questions: string[] }) {
  if (!questions || questions.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="border rounded-xl p-3.5 space-y-2">
      <SectionHeader icon={MessageCircle} title="Ask Before Booking" />
      <div className="space-y-1.5">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <ChevronRight size={11} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground leading-relaxed">{q}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MissingInputs({ inputs, onAddMore, addFileRef, additionalFiles, setAdditionalFiles, isReanalyzing, submitAdditional }: {
  inputs: NextInput[];
  onAddMore: (f: File[]) => void;
  addFileRef: React.RefObject<HTMLInputElement>;
  additionalFiles: File[];
  setAdditionalFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isReanalyzing?: boolean;
  submitAdditional: () => void;
}) {
  if (!inputs || inputs.length === 0) return null;
  const highPri = inputs.filter(i => i.priority === "high");
  const rest = inputs.filter(i => i.priority !== "high");
  const allInputs = [...highPri, ...rest];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="space-y-2">
      <SectionHeader icon={Upload} title="What's Missing" />
      {allInputs.map((inp, i) => (
        <div key={i} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Upload size={12} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">{inp.label}</p>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70 mt-0.5">{inp.reason}</p>
            </div>
          </div>
        </div>
      ))}
      {/* Add more files inline */}
      <div className="border border-dashed rounded-lg p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Share More Trip Details</p>
        {additionalFiles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {additionalFiles.map((f, i) => (
              <div key={`${f.name}-${i}`} className="relative flex items-center gap-1.5 bg-muted rounded px-2 py-1 pr-6 min-w-0">
                <FileText size={11} className="text-muted-foreground shrink-0" />
                <span className="text-[10px] text-foreground truncate max-w-[100px]">{f.name}</span>
                <button
                  onClick={(e) => { e.preventDefault(); setAdditionalFiles(prev => prev.filter((_, j) => j !== i)); }}
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
          <Button variant="outline" size="sm" className="gap-1 text-xs flex-1"
            onClick={() => addFileRef.current?.click()}>
            <ImageIcon size={12} /> Add trip details
          </Button>
          {additionalFiles.length > 0 && (
            <Button size="sm" className="gap-1 text-xs" onClick={submitAdditional} disabled={isReanalyzing}>
              {isReanalyzing ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
              Re-analyze
            </Button>
          )}
        </div>
        <input ref={addFileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" multiple
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? []);
            if (selected.length > 0) setAdditionalFiles(prev => [...prev, ...selected].slice(0, 5));
            if (addFileRef.current) addFileRef.current.value = "";
          }} />
      </div>
    </motion.div>
  );
}

function UnlockableModules({ modules }: { modules: UnlockableModule[] }) {
  const relevant = (modules ?? []).filter(m => m.available);
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
        {relevant.map((mod, i) => {
          const ModIcon = iconMap[mod.module_id] || Sparkles;
          return (
            <div key={i} className="border rounded-lg p-2.5 bg-accent/20 hover:bg-accent/40 transition-colors">
              <ModIcon size={14} className="text-primary mb-1" />
              <p className="text-[11px] font-semibold text-foreground">{mod.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{mod.description}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CompletenessBar({ score, confidence }: { score: number; confidence: string }) {
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
        {score >= 70
          ? "We have a good understanding of your trip to give you useful advice."
          : "Share more trip details to strengthen this review."}
      </p>
    </motion.div>
  );
}

/* ── Main Component ── */

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
  const hasAdvisory = !!a.advisory_summary;
  const insights = (a.advisory_insights_json ?? []) as AdvisoryInsight[];
  const questions = (a.traveler_questions_json ?? []) as string[];
  const nextInputs = (a.next_inputs_needed_json ?? []) as NextInput[];
  const modules = (a.unlockable_modules_json ?? []) as UnlockableModule[];
  const hasAnyContent = !!(a.destination_city || a.total_price || a.travel_start_date);

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
      {/* Header */}
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

      {/* Files analyzed summary */}
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
        <FileText size={13} className="text-muted-foreground shrink-0" />
        <span className="text-[11px] text-foreground font-medium truncate">
          {files.length > 1 ? `${files.length} trip details reviewed` : "Your travel quote reviewed"}
        </span>
      </div>

      {/* A. Trip Snapshot */}
      <TripSnapshot a={a} />

      {/* B. Our Read */}
      {hasAdvisory && <OurRead summary={a.advisory_summary!} />}

      {/* C. Key Things to Check */}
      <KeyInsights insights={insights} />

      {/* D. Questions to Ask Before Booking */}
      <TravelerQuestions questions={questions} />

      {/* E. What's Missing + Add More */}
      <MissingInputs
        inputs={nextInputs}
        onAddMore={onAddMore}
        addFileRef={addFileRef}
        additionalFiles={additionalFiles}
        setAdditionalFiles={setAdditionalFiles}
        isReanalyzing={isReanalyzing}
        submitAdditional={submitAdditional}
      />

      {/* F. What We Can Unlock */}
      <UnlockableModules modules={modules} />

      {/* G. Completeness */}
      <CompletenessBar score={score} confidence={a.parsing_confidence ?? "low"} />

      {/* Unlock CTA */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] px-4">
            <Lock size={16} className="text-primary mb-1.5" />
            <p className="font-heading font-bold text-xs text-foreground mb-0.5 text-center">
              Get your detailed review
            </p>
            <p className="text-[10px] text-muted-foreground mb-2 text-center max-w-[260px]">
              Verify your mobile to unlock savings estimate, EMI options, and personalised recommendations
            </p>
            <Button size="sm" className="gap-1.5" onClick={onUnlock}>
              <Phone size={13} /> Unlock full review
            </Button>
          </div>
        </div>
      </div>

      {/* Warnings footer */}
      {(a.extraction_warnings_json ?? []).length > 0 && (
        <div className="space-y-0.5 px-1 pt-1">
          {(a.extraction_warnings_json as string[]).map((w, i) => (
            <p key={i} className="text-[10px] text-amber-600 italic">⚠️ {w}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
