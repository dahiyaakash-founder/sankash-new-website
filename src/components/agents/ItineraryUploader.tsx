import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import {
  validateFile,
  assessTravelConfidence,
  sampleAcceptedFiles,
  type ValidationErrorType,
} from "@/lib/upload-validation";
import { getAgentInsuranceInsight, type InsuranceInsight } from "@/lib/insurance-rules";

type Stage = "upload" | "validating" | "analyzing" | "results-medium" | "results-high" | "error";

/** Build 4 agent insight cards — card 2 is now insurance-aware */
function buildAgentInsights(insurance: InsuranceInsight) {
  return [
    {
      label: "No Cost EMI opportunity detected",
      detail: "This quote may qualify for No Cost EMI at checkout",
    },
    {
      label: insurance.headline,
      detail: insurance.detail,
    },
    {
      label: "Payment collection can be streamlined",
      detail: "Settlement and reconciliation improvements available",
    },
    {
      label: "Itinerary may have room for optimisation",
      detail: "Pricing and sourcing signals identified for review",
    },
  ];
}

const mediumConfidenceBullets = [
  "Travel quote or itinerary detected",
  "EMI options may be available",
  "Our team can review this in more detail",
];

const gatedInsights = [
  { label: "No Cost EMI options & tenure breakdown", detail: "3 lender options · No Cost EMI eligible" },
  { label: "Recommended protection products", detail: "Cancellation + medical + baggage" },
  { label: "Competitiveness score vs. market", detail: "Partner-only benchmarking data" },
  { label: "Settlement & collection plan", detail: "T+1 payout with auto-reconciliation" },
];

const AGENT_LOGIN_URL = "https://app.sankash.in/agent/auth/login";

const ItineraryUploader = () => {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorBody, setErrorBody] = useState("");
  const [errorType, setErrorType] = useState<ValidationErrorType | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [insuranceInsight, setInsuranceInsight] = useState<InsuranceInsight | null>(null);

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
    setStage("validating");

    setTimeout(() => {
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

      setStage("analyzing");
      setTimeout(() => {
        setStage(result.confidence === "high" ? "results-high" : "results-medium");
      }, 2200);
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
    setErrorTitle("");
    setErrorBody("");
    setErrorType(null);
    setShowSamples(false);
  };

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
                  Get a first-pass review of financing, protection & collection opportunities
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
              {stage === "validating" ? "Checking Document" : "Reviewing Quote"}
            </div>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 size={32} className="text-primary animate-spin" />
              <div className="text-center">
                <p className="font-heading font-bold text-foreground">
                  {stage === "validating" ? "Checking your document…" : "Running first-pass review…"}
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

        {/* ── Medium Confidence Results ── */}
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
                Quote Detected
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
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto shrink-0">
                Detected
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-heading font-bold text-sm text-foreground mb-1">
                  This looks like a holiday quote or itinerary
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We found enough travel signals to continue, but a detailed review may need our team to verify the file.
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

            <div className="flex items-center gap-3 pt-1">
              <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5">
                  Agent Login <ArrowRight size={14} />
                </Button>
              </a>
              <Button variant="outline" size="sm" onClick={reset}>
                Upload another file
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── High Confidence Results ── */}
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
                Initial Review
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
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto shrink-0">
                Reviewed
              </span>
            </div>

            {/* What we found */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                What We Found
              </p>
              {firstLayerInsights.map((insight, i) => (
                <motion.div
                  key={insight.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.3 }}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-accent/40"
                >
                  <CheckCircle2 size={15} className="text-brand-green shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{insight.label}</p>
                    <p className="text-[11px] text-muted-foreground">{insight.detail}</p>
                  </div>
                </motion.div>
              ))}
              <p className="text-[10px] text-muted-foreground/60 italic px-1">
                This is a first-pass review. A detailed review can confirm pricing, financing fit, and specific recommendations.
              </p>
            </div>

            {/* Unlock detailed review */}
            <div className="relative">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Unlock Detailed Review
                </p>
                <div className="space-y-2 select-none" style={{ filter: "blur(4px)" }} aria-hidden>
                  {gatedInsights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-accent/40"
                    >
                      <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] rounded-xl">
                <Lock size={18} className="text-primary mb-2" />
                <p className="font-heading font-bold text-sm text-foreground mb-1">
                  Get your detailed review
                </p>
                <p className="text-[11px] text-muted-foreground mb-3 text-center max-w-[220px]">
                  Sign in to access full recommendations, EMI options, and coverage analysis
                </p>
                <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5">
                    Agent Login <ArrowRight size={14} />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryUploader;
