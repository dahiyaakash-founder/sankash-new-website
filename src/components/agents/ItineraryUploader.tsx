/**
 * Audience-specific review logic.
 * Agent outputs must remain sales-enabling and must not weaken the quote.
 * Never say "your quote has room for reduction" or suggest lower pricing.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileText,
  CheckCircle2,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
  XCircle,
  HelpCircle,
  Info,
  CreditCard,
  Shield,
  Wallet,
  ClipboardCheck,
} from "lucide-react";
import {
  validateFile,
  assessTravelConfidence,
  sampleAcceptedFiles,
  type ValidationErrorType,
} from "@/lib/upload-validation";
import { getAgentInsuranceInsight, type InsuranceInsight } from "@/lib/insurance-rules";
import { trackAgentQuoteUpload, trackQuoteAnalysisRequested } from "@/lib/analytics";
import { saveAgentQuoteReviewLead, type AgentQuoteReviewConfidence } from "@/lib/agent-quote-review-service";

type Stage = "upload" | "validating" | "analyzing" | "results-medium" | "results-high" | "error";

/** Agent-specific insight cards — sales-led, commercial, never quote-weakening */
function buildAgentInsights(insurance: InsuranceInsight) {
  return [
    {
      icon: CreditCard,
      label: "No Cost EMI can be offered on this itinerary",
      detail: "6-month No Cost EMI can increase conversion and ticket size",
    },
    {
      icon: Shield,
      label: insurance.headline,
      detail: insurance.detail,
    },
    {
      icon: Wallet,
      label: "1.5% payment gateway charges can be waived on this itinerary",
      detail: "Collect digitally with direct settlement to the agent",
    },
    {
      icon: ClipboardCheck,
      label: "This itinerary is ready for commercial activation",
      detail: "Login to unlock EMI fit, protection fit, and payment activation",
    },
  ];
}

const mediumConfidenceBullets = [
  "Travel quote or itinerary detected",
  "No Cost EMI and protection options available",
  "Login to unlock full commercial review",
];

const gatedInsights = [
  { label: "No Cost EMI options & tenure breakdown", detail: "3 lender options · 6-month No Cost EMI" },
  { label: "Protection products with revenue share", detail: "Cancellation + medical + baggage cover" },
  { label: "Settlement & collection plan", detail: "T+1 payout · 1.5% PG waiver · auto-reconciliation" },
  { label: "Full commercial activation plan", detail: "Finance fit, protection fit, and payment activation" },
];

const AGENT_LOGIN_URL = "https://app.sankash.in/agent/auth/login";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ItineraryUploader = () => {
  const [stage, setStage] = useState<Stage>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reviewConfidence, setReviewConfidence] = useState<AgentQuoteReviewConfidence | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorBody, setErrorBody] = useState("");
  const [errorType, setErrorType] = useState<ValidationErrorType | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [insuranceInsight, setInsuranceInsight] = useState<InsuranceInsight | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [leadError, setLeadError] = useState<string | null>(null);

  const openLeadCapture = useCallback(() => {
    setLeadError(null);
    setLeadSubmitted(false);
    setShowLeadForm(true);
  }, []);

  const handleFile = useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setFileName(file.name);
      setErrorTitle(validation.errorTitle!);
      setErrorBody(validation.errorBody!);
      setErrorType(validation.errorType!);
      setStage("error");
      return;
    }

    setFileName(file.name);
    setUploadedFile(file);
    trackAgentQuoteUpload({ file_uploaded: true });
    setStage("validating");

    setTimeout(async () => {
      const result = assessTravelConfidence(file.name);

      if (result.confidence === "invalid") {
        setErrorTitle("This file does not look like a holiday quote or itinerary");
        setErrorBody(
          "Upload a holiday quotation, itinerary, booking summary, or package PDF / image that includes destination, travel dates, travellers, or pricing."
        );
        setErrorType("not-travel");
        setStage("error");
        return;
      }

      setInsuranceInsight(getAgentInsuranceInsight(file.name));
      setStage("analyzing");
      trackQuoteAnalysisRequested({ audience_type: "agent" });
      const normalizedConfidence = result.confidence === "high" ? "high" : "medium";
      setReviewConfidence(normalizedConfidence);
      try {
        await wait(2200);

        const finalStage = result.confidence === "high" ? "results-high" : "results-medium";
        setStage(finalStage);
      } catch (error) {
        console.error("Agent itinerary save failed:", error);
        setErrorTitle("We couldn't save this itinerary");
        setErrorBody("The quote did not reach our review system. Please upload it again.");
        setErrorType(null);
        setStage("error");
      }
    }, 800);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const reset = () => {
    setStage("upload");
    setFileName("");
    setUploadedFile(null);
    setReviewConfidence(null);
    setErrorTitle("");
    setErrorBody("");
    setErrorType(null);
    setShowSamples(false);
    setInsuranceInsight(null);
    setShowLeadForm(false);
    setLeadSubmitted(false);
    setLeadSubmitting(false);
    setLeadName("");
    setLeadPhone("");
    setLeadEmail("");
    setCompanyName("");
    setLeadError(null);
  };

  const handleLeadSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadedFile || !reviewConfidence) {
      setLeadError("Please upload the quote again before continuing.");
      return;
    }

    const fullName = leadName.trim();
    const phone = leadPhone.trim();
    const email = leadEmail.trim();
    const company = companyName.trim();

    if (!fullName) {
      setLeadError("Please share your full name.");
      return;
    }

    if (!phone && !email) {
      setLeadError("Share a mobile number or email so we can treat this as a real review request.");
      return;
    }

    setLeadSubmitting(true);
    setLeadError(null);

    try {
      await saveAgentQuoteReviewLead(uploadedFile, reviewConfidence, {
        full_name: fullName,
        mobile_number: phone || null,
        email: email || null,
        company_name: company || null,
      });
      setLeadSubmitted(true);
    } catch (error) {
      console.error("Agent itinerary save failed:", error);
      setLeadError(error instanceof Error ? error.message : "We couldn't save this review request. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  }, [companyName, leadEmail, leadName, leadPhone, reviewConfidence, uploadedFile]);

  return (
    <div className="bg-card rounded-2xl border shadow-card overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ── Upload ── */}
        {stage === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              <FileText size={14} className="text-primary" />
              Itinerary Review Tool
            </div>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-primary bg-accent/60"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Upload size={22} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-sm text-foreground">
                  Drop an itinerary, quote, or screenshot
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  See EMI, protection, and collection opportunities for this booking
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleInputChange}
              />
              <Button variant="outline" size="sm" className="mt-1 pointer-events-none">
                Browse Files
              </Button>
            </label>
            <div className="flex items-start gap-2 mt-3 px-1">
              <Info size={11} className="text-muted-foreground/50 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Accepted: PDF, JPG, PNG, DOC · Best results with itinerary, holiday quote, package summary, or booking confirmation · Max 10 MB
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Validating / Analyzing ── */}
        {(stage === "validating" || stage === "analyzing") && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              <FileText size={14} className="text-primary" />
              {stage === "validating" ? "Checking Document" : "Reviewing Itinerary"}
            </div>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 size={32} className="text-primary animate-spin" />
              <div className="text-center">
                <p className="font-heading font-bold text-foreground">
                  {stage === "validating" ? "Checking your document…" : "Running commercial review…"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[240px]">
                  {fileName}
                </p>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-8 h-1 rounded-full bg-primary/20"
                    animate={{ backgroundColor: ["hsl(189 99% 35% / 0.2)", "hsl(189 99% 35% / 0.7)", "hsl(189 99% 35% / 0.2)"] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {stage === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              <FileText size={14} className="text-primary" />
              Upload Issue
            </div>
            <div className="flex flex-col items-center justify-center py-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle size={22} className="text-destructive" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground mb-1.5">
                  {errorTitle}
                </p>
                <p className="text-xs text-muted-foreground max-w-[300px] leading-relaxed">
                  {errorBody}
                </p>
              </div>
              {errorType === "not-travel" && (
                <div className="flex items-start gap-2 bg-accent/50 rounded-lg px-3 py-2 max-w-[320px]">
                  <AlertCircle size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                    <span className="font-semibold">Why this failed:</span> We could not detect enough travel details such as destination, dates, itinerary, travellers, or package pricing.
                  </p>
                </div>
              )}
              {fileName && (
                <div className="bg-muted rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-full">
                  <FileText size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">{fileName}</span>
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <Button variant="outline" size="sm" onClick={reset}>
                  Upload another file
                </Button>
                <button
                  onClick={() => setShowSamples(!showSamples)}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <HelpCircle size={11} />
                  {errorType === "unreadable" ? "View upload tips" : "See accepted files"}
                </button>
              </div>

              <AnimatePresence>
                {showSamples && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="bg-accent/50 rounded-lg p-3 text-left space-y-1.5 mt-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Accepted examples
                      </p>
                      {sampleAcceptedFiles.map((sample) => (
                        <div key={sample} className="flex items-center gap-2">
                          <CheckCircle2 size={10} className="text-primary shrink-0" />
                          <span className="text-[11px] text-muted-foreground">{sample}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Medium Confidence Results (Agent) ── */}
        {stage === "results-medium" && (
          <motion.div
            key="results-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText size={14} className="text-primary" />
                Commercial Review Preview
              </div>
              <button
                onClick={reset}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Upload another file
              </button>
            </div>

            <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground font-medium truncate">{fileName}</span>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full ml-auto shrink-0">
                Preview
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-heading font-bold text-sm text-foreground mb-1">
                  This looks like a travel itinerary
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We've spotted travel signals worth reviewing. Add your details to unlock the full commercial review for this itinerary.
                </p>
              </div>

              <div className="space-y-2">
                {mediumConfidenceBullets.map((bullet, i) => (
                  <motion.div
                    key={bullet}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.3 }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-accent/40"
                  >
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    <p className="text-sm text-foreground">{bullet}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2.5">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Next step — required
              </p>
              <p className="text-xs text-foreground leading-relaxed">
                Share your name and contact so this quote becomes a real review request you can act on.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" className="gap-1.5" onClick={openLeadCapture}>
                  Unlock full review <ArrowRight size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Upload another file
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── High Confidence Results (Agent) ── */}
        {stage === "results-high" && (
          <motion.div
            key="results-high"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText size={14} className="text-primary" />
                Commercial Review Preview
              </div>
              <button
                onClick={reset}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Upload another quote
              </button>
            </div>

            <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground font-medium truncate">{fileName}</span>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full ml-auto shrink-0">
                Preview
              </span>
            </div>

            {/* What we found — agent commercial cards, mobile-friendly */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Opportunities Identified
              </p>
              {buildAgentInsights(insuranceInsight ?? { headline: "Protection products may be relevant", detail: "Attach travel protection to increase ancillary revenue on this itinerary" }).map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.3 }}
                    className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg bg-accent/40"
                  >
                    <Icon size={15} className="text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">{insight.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
               <p className="text-[10px] text-muted-foreground/60 italic px-1">
                Preview only. Login to access detailed EMI, insurance, and payment activation.
              </p>
            </div>

            {/* Unlock detailed review — behind agent login */}
            <div className="relative">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Commercial Review
                </p>
                <div className="space-y-2 select-none" style={{ filter: "blur(4px)" }} aria-hidden>
                  {gatedInsights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg bg-accent/40"
                    >
                      <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] rounded-xl px-4">
                <Lock size={18} className="text-primary mb-2" />
                 <p className="font-heading font-bold text-xs sm:text-sm text-foreground mb-1 text-center">
                   Unlock detailed commercial review
                 </p>
                 <p className="text-[11px] text-muted-foreground mb-3 text-center max-w-[280px] leading-relaxed">
                   Login to access EMI fit, protection fit, and payment activation for this itinerary
                </p>
                <Button size="sm" className="gap-1.5" onClick={openLeadCapture}>
                  Share details to unlock <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {leadSubmitted ? (
            <div className="p-6">
              <div className="flex flex-col items-center py-4 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-brand-green" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="font-heading text-base">Review request saved</DialogTitle>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    This itinerary is now attached to a real contact. Continue to the agent portal to access the full commercial review.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                  <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full gap-1.5">
                      Continue to Agent Login <ArrowRight size={14} />
                    </Button>
                  </a>
                  <Button variant="outline" onClick={() => setShowLeadForm(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-b from-primary/5 to-transparent px-6 pt-6 pb-4 border-b">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock size={12} className="text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Required to unlock
                  </p>
                </div>
                <DialogTitle className="font-heading text-lg leading-tight">
                  Unlock the full commercial review
                </DialogTitle>
                <DialogDescription className="text-xs mt-1.5 leading-relaxed">
                  Add your details so this quote becomes a real review request linked to your agent workflow — not anonymous intent.
                </DialogDescription>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-start gap-2 text-[12px] text-foreground">
                    <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>EMI fit, protection fit, and PG activation for this itinerary</span>
                  </li>
                  <li className="flex items-start gap-2 text-[12px] text-foreground">
                    <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>Saved to your agent workflow for follow-up</span>
                  </li>
                  <li className="flex items-start gap-2 text-[12px] text-foreground">
                    <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>Reviewed by a SanKash commercial advisor</span>
                  </li>
                </ul>
              </div>
              <form onSubmit={handleLeadSubmit} className="px-6 py-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="a-lead-name" className="text-xs font-semibold text-foreground">
                    Full name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="a-lead-name"
                    placeholder="Your full name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    required
                    maxLength={100}
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="a-lead-phone" className="text-xs font-semibold text-foreground">
                      Mobile <span className="text-muted-foreground font-normal">(or email)</span>
                    </label>
                    <Input
                      id="a-lead-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit mobile"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      maxLength={20}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="a-lead-email" className="text-xs font-semibold text-foreground">
                      Work email
                    </label>
                    <Input
                      id="a-lead-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@agency.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      maxLength={255}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="a-lead-company" className="text-xs font-semibold text-foreground">
                    Agency name <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    id="a-lead-company"
                    placeholder="Your travel agency"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={150}
                    autoComplete="organization"
                    className="h-11"
                  />
                </div>
                {leadError && <p className="text-xs text-destructive font-medium">{leadError}</p>}
                <p className="text-[11px] text-muted-foreground">
                  Mobile or email required. We use it to attach this review to your workflow — not for marketing.
                </p>
                <Button type="submit" size="lg" className="w-full gap-2 h-12" disabled={leadSubmitting}>
                  {leadSubmitting ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  ) : (
                    <>Unlock full review <ArrowRight size={14} /></>
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItineraryUploader;
