import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Phone,
  XCircle,
} from "lucide-react";

type Stage = "upload" | "validating" | "analyzing" | "results" | "error";

const TRAVEL_KEYWORDS = [
  "itinerary", "booking", "quote", "travel", "flight", "hotel", "tour",
  "package", "trip", "holiday", "destination", "passenger", "traveller",
  "traveler", "resort", "cruise", "visa", "airport", "airline",
  "accommodation", "departure", "arrival", "pax", "nights", "days",
];

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_FILE_SIZE = 1024;

function hasLikelyTravelContent(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return TRAVEL_KEYWORDS.some((kw) => lower.includes(kw));
}

function validateFile(file: File): { valid: boolean; errorTitle?: string; errorBody?: string } {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|doc|docx)$/i)) {
    return {
      valid: false,
      errorTitle: "Unsupported file type",
      errorBody: "Upload a PDF, PNG, JPG, or DOC file containing your holiday quote or itinerary.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, errorTitle: "File is too large", errorBody: "Please upload a file under 10 MB." };
  }
  if (file.size < MIN_FILE_SIZE) {
    return {
      valid: false,
      errorTitle: "We could not read travel details from this file",
      errorBody: "Please upload a clearer document or image with destination, dates, traveller count, or package pricing.",
    };
  }
  return { valid: true };
}

const firstLayerInsights = [
  {
    label: "This quote may have room for optimisation",
    detail: "Based on trip type, dates, and destination signals",
  },
  {
    label: "EMI options are available for this trip value",
    detail: "Monthly outflow can be structured across 3–12 months",
  },
  {
    label: "Trip cost can be broken into monthly payments",
    detail: "No Cost EMI and low-cost EMI tenures may apply",
  },
  {
    label: "Our team can review for better-value options",
    detail: "A detailed review may uncover alternative structuring",
  },
];

const gatedInsights = [
  { label: "Detailed EMI tenure & lender options", detail: "3, 6, 9, 12-month plans · No Cost EMI eligibility" },
  { label: "Better-value itinerary suggestions", detail: "Alternative routing and package structuring" },
  { label: "Travel protection recommendations", detail: "Cancellation, medical & baggage coverage" },
  { label: "Pre-approval for trip financing", detail: "Check eligibility without impacting credit score" },
];

const TravelerQuoteUploader = () => {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorBody, setErrorBody] = useState("");

  const handleFile = useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setFileName(file.name);
      setErrorTitle(validation.errorTitle!);
      setErrorBody(validation.errorBody!);
      setStage("error");
      return;
    }

    setFileName(file.name);
    setStage("validating");

    setTimeout(() => {
      if (!hasLikelyTravelContent(file.name)) {
        setErrorTitle("This file does not look like a travel quote or itinerary");
        setErrorBody(
          "Upload a holiday quotation, itinerary, booking summary, or package PDF / image that includes travel details such as destination, dates, travellers, or pricing."
        );
        setStage("error");
        return;
      }
      setStage("analyzing");
      setTimeout(() => setStage("results"), 2400);
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
  };

  return (
    <div className="bg-card rounded-2xl border shadow-card overflow-hidden">
      <AnimatePresence mode="wait">
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
              Quote Review
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
                  Upload a quote, itinerary, screenshot, or PDF
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get a quick first review before you book
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  PDF, PNG, JPG, DOC supported · Max 10 MB
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
          </motion.div>
        )}

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
                  {stage === "validating" ? "Checking your document…" : "Reviewing your quote…"}
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
                    animate={{
                      backgroundColor: [
                        "hsl(189 99% 35% / 0.2)",
                        "hsl(189 99% 35% / 0.7)",
                        "hsl(189 99% 35% / 0.2)",
                      ],
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

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
            <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle size={22} className="text-destructive" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground mb-1">
                  {errorTitle}
                </p>
                <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                  {errorBody}
                </p>
              </div>
              {fileName && (
                <div className="bg-muted rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-full">
                  <FileText size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">{fileName}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={reset} className="mt-1">
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText size={14} className="text-primary" />
                Review Results
              </div>
              <button
                onClick={reset}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Upload another
              </button>
            </div>

            <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground font-medium truncate">{fileName}</span>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto shrink-0">
                Reviewed
              </span>
            </div>

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
            </div>

            <div className="relative">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Detailed Recommendations
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
                  Get your full review
                </p>
                <p className="text-[11px] text-muted-foreground mb-3 text-center max-w-[220px]">
                  Share your number to receive detailed recommendations and EMI options
                </p>
                <Button size="sm" className="gap-1.5">
                  <Phone size={14} /> Share My Number
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravelerQuoteUploader;
