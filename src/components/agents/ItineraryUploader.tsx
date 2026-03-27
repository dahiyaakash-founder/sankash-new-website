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
} from "lucide-react";

type Stage = "upload" | "analyzing" | "results";

const firstLayerInsights = [
  {
    icon: AlertCircle,
    label: "Financing opportunity detected",
    detail: "This quote value qualifies for customer EMI options",
    color: "text-primary",
  },
  {
    icon: AlertCircle,
    label: "Protection products may be relevant",
    detail: "Trip type and duration suggest coverage add-ons",
    color: "text-primary",
  },
  {
    icon: AlertCircle,
    label: "Payment collection can be streamlined",
    detail: "Settlement and reconciliation improvements available",
    color: "text-primary",
  },
  {
    icon: AlertCircle,
    label: "Itinerary has room for optimisation",
    detail: "Pricing and sourcing signals identified",
    color: "text-primary",
  },
];

const gatedInsights = [
  { label: "Detailed EMI options & tenure breakdown", detail: "3 lender options · No Cost EMI eligible" },
  { label: "Recommended protection products", detail: "Cancellation + medical + baggage" },
  { label: "Competitiveness score vs. market", detail: "Partner-only benchmarking data" },
  { label: "Settlement & collection plan", detail: "T+1 payout with auto-reconciliation" },
];

const ItineraryUploader = () => {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((name: string) => {
    setFileName(name);
    setStage("analyzing");
    setTimeout(() => setStage("results"), 2200);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file.name);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file.name);
    },
    [handleFile]
  );

  const reset = () => {
    setStage("upload");
    setFileName("");
  };

  return (
    <div className="bg-card rounded-2xl border shadow-card overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Upload Stage */}
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
                  Get a quick review of financing, protection & collection opportunities
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  PDF, PNG, JPG, DOC · Max 10 MB
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

        {/* Analyzing Stage */}
        {stage === "analyzing" && (
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
              Reviewing Quote
            </div>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 size={32} className="text-primary animate-spin" />
              <div className="text-center">
                <p className="font-heading font-bold text-foreground">
                  Analyzing your itinerary…
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

        {/* Results Stage */}
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

            {/* File info */}
            <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground font-medium truncate">{fileName}</span>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto shrink-0">
                Reviewed
              </span>
            </div>

            {/* First layer — visible insights */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Initial Observations
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

            {/* Second layer — gated / blurred */}
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

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] rounded-xl">
                <Lock size={18} className="text-primary mb-2" />
                <p className="font-heading font-bold text-sm text-foreground mb-1">
                  Unlock full review
                </p>
                <p className="text-[11px] text-muted-foreground mb-3 text-center max-w-[220px]">
                  Sign in or register to access detailed recommendations
                </p>
                <Button size="sm" className="gap-1.5">
                  Agent Login <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryUploader;
