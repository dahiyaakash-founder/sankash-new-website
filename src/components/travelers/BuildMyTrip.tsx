/**
 * Build My Trip — traveler trip-shaping tool with 3 start modes:
 * 1. I know where I want to go (destination-first)
 * 2. I'm not sure where to go (open exploration)
 * 3. I've saved lots of trip ideas (inspiration dump)
 *
 * UI shell only — backend logic is handled by Codex via edge functions.
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin, Compass, ArrowRight, ArrowLeft,
  Upload, Link2, Image, FileText, X, Plus, CheckCircle2,
  Loader2, Globe, Heart,
  MessageCircle, CreditCard, Star,
} from "lucide-react";
import { validateFile } from "@/lib/upload-validation";
import { toast } from "sonner";

/* ─── Types ─── */
type StartMode = "destination" | "explore" | "inspiration";
type FlowStep = "mode-select" | "input" | "questions" | "results";

interface TripQuestion {
  id: string;
  question: string;
  options?: string[];
  type: "choice" | "text" | "multi";
}

interface TripResultVersion {
  label: string;
  tag?: string;
  headline: string;
  summary: string;
  highlights: string[];
  emiMonthly?: string;
  emiTenure?: string;
  tagColor?: string;
}

interface TripResult {
  direction: string;
  whyItFits: string;
  nextStep: string;
  versions: TripResultVersion[];
  emiSignal?: string;
  deeperDetails?: string[];
}

/* ─── Sub-components ─── */

function ModeCard({
  icon: Icon,
  title,
  desc,
  iconBg,
  iconColor,
  onClick,
}: {
  icon: any;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3.5 text-left p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/30 hover:shadow-card transition-all w-full"
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={17} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-heading font-bold text-foreground mb-0.5">{title}</h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-muted-foreground/50 group-hover:text-primary shrink-0 mt-1 transition-colors" />
    </button>
  );
}

function InspirationItem({
  item,
  onRemove,
}: {
  item: { type: "link" | "text" | "file"; value: string; file?: File };
  onRemove: () => void;
}) {
  const icon =
    item.type === "link" ? <Link2 size={11} className="text-primary shrink-0" />
    : item.type === "file" ? <FileText size={11} className="text-brand-coral shrink-0" />
    : <MessageCircle size={11} className="text-muted-foreground shrink-0" />;

  return (
    <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-2.5 py-1.5 pr-7 relative group min-w-0">
      {icon}
      <span className="text-[11px] text-foreground truncate">{item.value}</span>
      <button
        onClick={onRemove}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-destructive/20 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity"
        aria-label="Remove"
      >
        <X size={10} />
      </button>
    </div>
  );
}

function QuestionStep({
  question,
  answer,
  onAnswer,
  current,
  total,
}: {
  question: TripQuestion;
  answer: string;
  onAnswer: (val: string) => void;
  current: number;
  total: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-3.5"
    >
      {/* Progress dots */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= current ? "w-5 bg-primary" : "w-3 bg-border"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{current + 1} of {total}</span>
      </div>
      <p className="font-heading font-bold text-foreground text-[14px] leading-snug">
        {question.question}
      </p>
      {question.options ? (
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onAnswer(opt)}
              className={`text-left px-3 py-2.5 rounded-lg border text-[12px] transition-all ${
                answer === opt
                  ? "border-primary bg-primary/5 text-foreground font-medium"
                  : "border-border hover:border-primary/30 text-muted-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <Input
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          className="text-sm"
        />
      )}
    </motion.div>
  );
}

function ResultVersionCard({
  version,
  isPrimary,
}: {
  version: TripResultVersion;
  isPrimary: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 space-y-2.5 transition-shadow ${
        isPrimary
          ? "border-primary/25 bg-primary/[0.02] shadow-card"
          : "border-border hover:shadow-card"
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            version.tagColor ?? (isPrimary ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground")
          }`}
        >
          {version.label}
        </span>
        {version.tag && (
          <span className="text-[10px] font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
            {version.tag}
          </span>
        )}
      </div>
      <h4 className="font-heading font-bold text-foreground text-[15px] leading-snug">
        {version.headline}
      </h4>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{version.summary}</p>
      <div className="space-y-1">
        {version.highlights.map((h) => (
          <div key={h} className="flex items-start gap-2">
            <CheckCircle2 size={11} className="text-brand-green shrink-0 mt-0.5" />
            <span className="text-[11px] text-foreground leading-relaxed">{h}</span>
          </div>
        ))}
      </div>
      {version.emiMonthly && (
        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-border/60">
          <CreditCard size={13} className="text-primary shrink-0" />
          <span className="text-sm font-heading font-bold text-foreground">{version.emiMonthly}</span>
          <span className="text-[11px] text-muted-foreground">/month · {version.emiTenure}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Placeholder questions (will come from backend) ─── */
const PLACEHOLDER_QUESTIONS: TripQuestion[] = [
  {
    id: "travel_style",
    question: "What kind of holiday experience are you imagining?",
    options: ["Relaxation & leisure", "Adventure & exploration", "Culture & sightseeing", "Mix of everything"],
    type: "choice",
  },
  {
    id: "budget_range",
    question: "What's a comfortable budget range for this trip?",
    options: ["Under ₹50,000", "₹50K – ₹1 Lakh", "₹1L – ₹3 Lakhs", "₹3 Lakhs+"],
    type: "choice",
  },
  {
    id: "travel_month",
    question: "When are you thinking of travelling?",
    options: ["Next month", "2–3 months", "3–6 months", "Still flexible"],
    type: "choice",
  },
  {
    id: "group_size",
    question: "Who's travelling?",
    options: ["Just me", "Couple", "Family with kids", "Group of friends"],
    type: "choice",
  },
];

/* ─── Main component ─── */
const BuildMyTrip = () => {
  const [step, setStep] = useState<FlowStep>("mode-select");
  const [mode, setMode] = useState<StartMode | null>(null);

  // Destination mode
  const [destination, setDestination] = useState("");

  // Inspiration dump
  const [inspirationItems, setInspirationItems] = useState<
    { type: "link" | "text" | "file"; value: string; file?: File }[]
  >([]);
  const [linkInput, setLinkInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Questions
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Results (placeholder)
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TripResult | null>(null);

  const selectMode = (m: StartMode) => {
    setMode(m);
    setStep("input");
  };

  const addLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    setInspirationItems((prev) => [...prev, { type: "link", value: trimmed }]);
    setLinkInput("");
  };

  const addNote = () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;
    setInspirationItems((prev) => [...prev, { type: "text", value: trimmed }]);
    setTextInput("");
  };

  const addFiles = useCallback((fileList: File[]) => {
    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.errorTitle || "This item couldn't be added");
        continue;
      }
      setInspirationItems((prev) => [...prev, { type: "file", value: file.name, file }]);
    }
  }, []);

  const removeItem = (index: number) => {
    setInspirationItems((prev) => prev.filter((_, i) => i !== index));
  };

  const proceedToQuestions = () => {
    setStep("questions");
    setQuestionIndex(0);
  };

  const handleAnswer = (val: string) => {
    const q = PLACEHOLDER_QUESTIONS[questionIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
    // Auto-advance for choice questions
    if (q.type === "choice") {
      if (questionIndex < PLACEHOLDER_QUESTIONS.length - 1) {
        setTimeout(() => setQuestionIndex((i) => i + 1), 300);
      } else {
        setTimeout(() => processTrip(), 300);
      }
    }
  };

  const processTrip = async () => {
    setStep("results");
    setIsProcessing(true);
    // Simulate processing — in production, this calls a backend function
    await new Promise((r) => setTimeout(r, 3000));
    setResult({
      direction: "Southeast Asia Beach & Culture",
      whyItFits: "Based on your preferences for relaxation with cultural elements, a 7-night Bali trip balances both beautifully within your budget range.",
      nextStep: "Share your mobile number to receive a detailed trip plan with real pricing and EMI options.",
      versions: [
        {
          label: "Realistic Version",
          tag: "Best fit",
          headline: "7N Bali · Beach + Temple Trail",
          summary: "A well-balanced itinerary covering Ubud's culture and Seminyak's beaches, with quality 4-star stays.",
          highlights: [
            "4-star stays in Ubud & Seminyak",
            "Includes transfers & breakfast",
            "Temple tours + rice terrace visit",
            "Beach club access included",
          ],
          emiMonthly: "₹8,500",
          emiTenure: "6 months No Cost EMI",
        },
        {
          label: "Upgraded Version",
          headline: "7N Bali · Premium Beach & Wellness",
          summary: "Same destinations, elevated stays with pool villas, spa credits, and a sunset dinner cruise.",
          highlights: [
            "5-star pool villa stays",
            "Spa & wellness credits included",
            "Private transfers throughout",
            "Sunset dinner cruise experience",
          ],
          emiMonthly: "₹12,800",
          emiTenure: "6 months No Cost EMI",
          tagColor: "bg-brand-coral/10 text-brand-coral",
        },
      ],
      emiSignal: "Both versions are eligible for No Cost EMI — the upgrade is just ₹4,300/month more.",
      deeperDetails: [
        "Flight options: Direct from major metros, 6-7hr",
        "Best months: April–October (dry season)",
        "Visa: Free on arrival for Indian passport holders",
      ],
    });
    setIsProcessing(false);
  };

  const reset = () => {
    setStep("mode-select");
    setMode(null);
    setDestination("");
    setInspirationItems([]);
    setLinkInput("");
    setTextInput("");
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="bg-card rounded-xl border shadow-card overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ── Mode Select ── */}
        {step === "mode-select" && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-3.5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <Compass size={13} className="text-brand-green" />
                Build My Trip
              </div>
              <h3 className="font-heading font-bold text-foreground text-[15px] leading-snug">
                How would you like to start?
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Tell us what you have — we'll help shape it into a trip you can plan and price.
              </p>
            </div>
            <div className="space-y-2">
              <ModeCard
                icon={MapPin}
                title="I know where I want to go"
                desc="Share your destination and we'll shape the right trip."
                iconBg="bg-primary/10"
                iconColor="text-primary"
                onClick={() => selectMode("destination")}
              />
              <ModeCard
                icon={Globe}
                title="I'm not sure where to go"
                desc="Tell us what you're in the mood for — we'll suggest places that fit."
                iconBg="bg-accent"
                iconColor="text-primary"
                onClick={() => selectMode("explore")}
              />
              <ModeCard
                icon={Heart}
                title="I've saved lots of trip ideas"
                desc="Bring your Instagram saves, YouTube links, screenshots, and notes. We'll make sense of it all."
                iconBg="bg-brand-coral/10"
                iconColor="text-brand-coral"
                onClick={() => selectMode("inspiration")}
              />
            </div>
          </motion.div>
        )}

        {/* ── Input Step ── */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-3.5"
          >
            <button
              onClick={() => setStep("mode-select")}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={11} /> Back
            </button>

            {/* Destination Mode */}
            {mode === "destination" && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <MapPin size={13} className="text-primary" />
                    Destination in Mind
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-[14px] leading-snug">
                    Where are you thinking of going?
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    A city, country, or region — whatever you have in mind.
                  </p>
                </div>
                <Input
                  placeholder="e.g. Bali, Switzerland, Kerala, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-sm"
                  maxLength={100}
                />
                <Button
                  className="w-full gap-2"
                  disabled={!destination.trim()}
                  onClick={proceedToQuestions}
                >
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            )}

            {/* Explore Mode */}
            {mode === "explore" && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <Globe size={13} className="text-primary" />
                    Open Exploration
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-[14px] leading-snug">
                    Let's find the right destination for you
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    We'll ask a few quick questions about what you're looking for — and suggest places that fit.
                  </p>
                </div>
                <Button className="w-full gap-2" onClick={proceedToQuestions}>
                  Let's go <ArrowRight size={14} />
                </Button>
              </div>
            )}

            {/* Inspiration Dump Mode */}
            {mode === "inspiration" && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <Heart size={13} className="text-brand-coral" />
                    Your Travel Inspiration
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-[14px] leading-snug">
                    Put all your saved travel ideas here
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Instagram reels, YouTube videos, blog links, screenshots, hotel names, friend recommendations — anything you've saved. We'll make sense of it all.
                  </p>
                </div>

                {/* Inspiration items */}
                {inspirationItems.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {inspirationItems.map((item, i) => (
                      <InspirationItem key={`${item.value}-${i}`} item={item} onRemove={() => removeItem(i)} />
                    ))}
                  </div>
                )}

                {/* Empty state hint */}
                {inspirationItems.length === 0 && (
                  <div className="bg-accent/30 rounded-lg p-3 space-y-1.5">
                    <p className="text-[11px] font-medium text-foreground/80">What works well here:</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      {[
                        "Instagram reels & posts",
                        "YouTube travel videos",
                        "Blog or article links",
                        "Klook / Viator links",
                        "Hotel or resort names",
                        "Screenshots from apps",
                        "Friend recommendations",
                        "Place names & ideas",
                      ].map((hint) => (
                        <div key={hint} className="flex items-center gap-1.5">
                          <CheckCircle2 size={8} className="text-brand-green shrink-0" />
                          <span className="text-[10px] text-muted-foreground">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Link2 size={10} className="text-primary" /> Add a link
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Paste an Instagram, YouTube, blog, or hotel link"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="text-[12px] flex-1"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                    />
                    <Button variant="outline" size="sm" onClick={addLink} disabled={!linkInput.trim()} className="px-2.5">
                      <Plus size={13} />
                    </Button>
                  </div>
                </div>

                {/* Add note / recommendation */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <MessageCircle size={10} className="text-primary" /> Add a note or recommendation
                  </label>
                  <Textarea
                    placeholder="e.g. My friend said Santorini in October is amazing, or: I want a hotel with an infinity pool"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="text-[12px] min-h-[52px]"
                    rows={2}
                  />
                  <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={addNote} disabled={!textInput.trim()}>
                    <Plus size={11} /> Add note
                  </Button>
                </div>

                {/* Add screenshots / files */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Image size={10} className="text-primary" /> Add screenshots or saved images
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full text-[11px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={11} /> Choose from device
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    multiple
                    onChange={(e) => {
                      const selected = Array.from(e.target.files ?? []);
                      if (selected.length > 0) addFiles(selected);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={inspirationItems.length === 0}
                  onClick={proceedToQuestions}
                >
                  Shape my trip <ArrowRight size={14} />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Questions Flow ── */}
        {step === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-3.5"
          >
            <button
              onClick={() => {
                if (questionIndex > 0) setQuestionIndex((i) => i - 1);
                else setStep("input");
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={11} /> Back
            </button>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Compass size={13} className="text-primary" />
              Shaping Your Trip
            </div>

            <AnimatePresence mode="wait">
              <QuestionStep
                key={PLACEHOLDER_QUESTIONS[questionIndex].id}
                question={PLACEHOLDER_QUESTIONS[questionIndex]}
                answer={answers[PLACEHOLDER_QUESTIONS[questionIndex].id] || ""}
                onAnswer={handleAnswer}
                current={questionIndex}
                total={PLACEHOLDER_QUESTIONS.length}
              />
            </AnimatePresence>

            {PLACEHOLDER_QUESTIONS[questionIndex].type !== "choice" && (
              <Button
                className="w-full gap-2"
                disabled={!answers[PLACEHOLDER_QUESTIONS[questionIndex].id]}
                onClick={() => {
                  if (questionIndex < PLACEHOLDER_QUESTIONS.length - 1) {
                    setQuestionIndex((i) => i + 1);
                  } else {
                    processTrip();
                  }
                }}
              >
                {questionIndex < PLACEHOLDER_QUESTIONS.length - 1 ? "Next" : "Build my trip"}{" "}
                <ArrowRight size={14} />
              </Button>
            )}
          </motion.div>
        )}

        {/* ── Results ── */}
        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-3.5"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 size={28} className="text-primary animate-spin" />
                <div className="text-center space-y-1">
                  <p className="font-heading font-bold text-foreground text-[14px]">
                    Shaping your trip
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    Matching destinations, stays, and pricing to what you're looking for…
                  </p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-5 h-0.5 rounded-full bg-primary/20"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            ) : result ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-primary" />
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                      Your Trip Direction
                    </span>
                  </div>
                  <button
                    onClick={reset}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                  >
                    Start over
                  </button>
                </div>

                {/* Direction headline */}
                <div className="bg-accent/30 rounded-xl p-3.5 space-y-1.5">
                  <h3 className="font-heading font-bold text-foreground text-base leading-snug">
                    {result.direction}
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {result.whyItFits}
                  </p>
                  <div className="flex items-start gap-2 pt-0.5">
                    <ArrowRight size={11} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground font-medium">{result.nextStep}</p>
                  </div>
                </div>

                {/* Version cards */}
                <div className="space-y-2.5">
                  {result.versions.map((version, i) => (
                    <ResultVersionCard key={version.label} version={version} isPrimary={i === 0} />
                  ))}
                </div>

                {/* EMI signal */}
                {result.emiSignal && (
                  <div className="flex items-start gap-2 bg-primary/[0.04] rounded-lg border border-primary/15 p-3">
                    <CreditCard size={13} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{result.emiSignal}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        No Cost EMI is subject to customer eligibility and lender approval. T&C apply.
                      </p>
                    </div>
                  </div>
                )}

                {/* Deeper details */}
                {result.deeperDetails && result.deeperDetails.length > 0 && (
                  <div className="border rounded-lg p-3 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Good to Know
                    </p>
                    {result.deeperDetails.map((d) => (
                      <div key={d} className="flex items-start gap-2">
                        <CheckCircle2 size={10} className="text-brand-green shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground">{d}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <Button className="w-full gap-2">
                  Get detailed pricing & EMI options <ArrowRight size={14} />
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  We'll ask for your mobile to share a detailed trip plan with real pricing.
                </p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuildMyTrip;
