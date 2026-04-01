/**
 * Audience-specific review logic.
 * Traveler outputs can reveal consumer savings after OTP.
 * Agent outputs must remain sales-enabling and must not weaken the quote.
 */
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
  HelpCircle,
  Info,
  AlertCircle,
  Shield,
  CreditCard,
  Wallet,
  TrendingDown,
} from "lucide-react";
import {
  validateFile,
  assessTravelConfidence,
  sampleAcceptedFiles,
  type ValidationErrorType,
} from "@/lib/upload-validation";
import { trackTravelerQuoteUpload, trackTravelerUnlockSubmit } from "@/lib/analytics";
import { getInsuranceInsight, type InsuranceInsight } from "@/lib/insurance-rules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Stage = "upload" | "validating" | "analyzing" | "results-medium" | "results-high" | "error";

/** Traveler-specific insight cards — confident, value-led */
function buildTravelerInsights(insurance: InsuranceInsight) {
  return [
    {
      icon: TrendingDown,
      label: "This holiday quote can be optimised",
      detail: "We have identified potential room for savings of up to 5%",
      hasBlurredValue: true,
    },
    {
      icon: CreditCard,
      label: "This itinerary is eligible for No Cost EMI",
      detail: "6-month No Cost EMI available, subject to credit approval",
      hasBlurredValue: false,
    },
    {
      icon: Shield,
      label: insurance.headline,
      detail: insurance.detail,
      hasBlurredValue: false,
    },
    {
      icon: Wallet,
      label: "This booking may qualify for zero online payment charges",
      detail: "Pay digitally without extra online payment charges, subject to payment mode and offer terms",
      hasBlurredValue: false,
    },
  ];
}

const mediumConfidenceBullets = [
  "Travel quote or itinerary detected",
  "EMI options may be available",
  "Our team can review this in more detail",
];

const gatedInsights = [
  { label: "Exact savings amount on this quote", detail: "Up to 5% optimisation · revealed after verification" },
  { label: "EMI breakdown with lender options", detail: "3, 6, 9, 12-month No Cost EMI plans" },
  { label: "Recommended travel protection", detail: "Cancellation, medical & baggage cover with pricing" },
  { label: "Pre-approval for trip financing", detail: "Check eligibility without impacting credit score" },
];

const TravelerQuoteUploader = () => {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorBody, setErrorBody] = useState("");
  const [errorType, setErrorType] = useState<ValidationErrorType | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [insuranceInsight, setInsuranceInsight] = useState<InsuranceInsight | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

      setInsuranceInsight(getInsuranceInsight(file.name));
      setStage("analyzing");
      setTimeout(() => {
        setStage(result.confidence === "high" ? "results-high" : "results-medium");
      }, 2400);
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
    setInsuranceInsight(null);
  };

  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      const { createLeadWithDedup } = await import("@/lib/leads-service");
      const { uploadLeadAttachment } = await import("@/lib/attachments-service");
      const { logLeadCreated } = await import("@/lib/activity-service");

      // Upload file to storage first if available
      let quoteFileUrl: string | null = null;
      if (uploadedFile) {
        const { uploadQuoteFile } = await import("@/lib/leads-service");
        const uploaded = await uploadQuoteFile(uploadedFile);
        quoteFileUrl = uploaded.url;
      }

      const { lead } = await createLeadWithDedup({
        full_name: leadName.trim(),
        mobile_number: leadPhone.trim(),
        email: leadEmail.trim() || null,
        lead_source_page: "for-travelers",
        lead_source_type: "traveler_quote_unlock",
        audience_type: "traveler",
        quote_file_name: fileName,
        quote_file_url: quoteFileUrl,
        metadata_json: { confidence: stage === "results-high" ? "high" : "medium" },
      });

      // Attach file to lead record
      if (uploadedFile && lead?.id) {
        await uploadLeadAttachment(uploadedFile, lead.id, { sourceType: "traveler_quote_unlock" }).catch(() => {});
        await logLeadCreated(lead.id, "for-travelers").catch(() => {});
      }

      // Only show success after confirmed DB write
      setLeadSubmitted(true);
    } catch (err: any) {
      console.error("Lead creation failed:", err);
      setLeadError("Something went wrong. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <>
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
                    Get a first-pass review before you book
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

          {/* ── Medium Confidence Results (Traveler) ── */}
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
                  Initial Review
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
                    We found travel signals to continue, but a detailed review may need our team to verify the file.
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
                <Button size="sm" className="gap-1.5" onClick={() => setShowLeadForm(true)}>
                  <Phone size={14} /> Unlock full review
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  Upload another file
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 px-1">
                Verify your mobile number to see exact savings, EMI options, and next steps
              </p>
            </motion.div>
          )}

          {/* ── High Confidence Results (Traveler) ── */}
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
                  First-Pass Review
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

              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  What We Found
                </p>
                {buildTravelerInsights(insuranceInsight ?? { headline: "Travel protection can be added", detail: "Trip cancellation, medical and baggage cover available" }).map((insight, i) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div
                      key={insight.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.3 }}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-accent/40"
                    >
                      <Icon size={15} className="text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{insight.label}</p>
                        <p className="text-[11px] text-muted-foreground">{insight.detail}</p>
                        {insight.hasBlurredValue && (
                          <span className="inline-block mt-1 text-sm font-bold text-primary select-none" style={{ filter: "blur(5px)" }} aria-hidden>
                            Possible savings: ₹2,450
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <p className="text-[10px] text-muted-foreground/60 italic px-1">
                  This is a first-pass review. Verify your number to unlock exact savings, EMI breakdown, and detailed recommendations.
                </p>
              </div>

              {/* Unlock detailed review */}
              <div className="relative">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Unlock Full Review
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
                   Unlock exact savings and EMI options
                  </p>
                   <p className="text-[11px] text-muted-foreground mb-3 text-center max-w-[240px]">
                     Verify your mobile number to access exact savings, EMI options, and detailed trip recommendations
                   </p>
                  <Button size="sm" className="gap-1.5" onClick={() => setShowLeadForm(true)}>
                    <Phone size={14} /> Unlock full review
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lead capture modal */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
               {leadSubmitted ? "Review request received" : "Unlock your full review"}
             </DialogTitle>
             <DialogDescription>
               {leadSubmitted
                 ? "Your details have been submitted successfully. We will now process your detailed review and share exact savings, EMI options, and next steps."
                 : "Enter your details to unlock exact savings, EMI options, and a more detailed review of this holiday quote."}
             </DialogDescription>
          </DialogHeader>

          {leadSubmitted ? (
            <div className="flex flex-col items-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-brand-green" />
              </div>
              <p className="text-sm text-foreground font-medium text-center">
                 Your detailed review request has been recorded.
               </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLeadForm(false);
                  setLeadSubmitted(false);
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Your full name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mobile number <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  required
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  maxLength={255}
                />
              </div>
               {leadError && (
                 <p className="text-xs text-destructive font-medium">{leadError}</p>
               )}
               <p className="text-[11px] text-muted-foreground">
                 We will verify your details and share your detailed review.
               </p>
               <Button type="submit" className="w-full gap-2" disabled={leadSubmitting}>
                 {leadSubmitting ? (
                   <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                 ) : (
                   <>Unlock detailed review <ArrowRight size={14} /></>
                 )}
               </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TravelerQuoteUploader;
