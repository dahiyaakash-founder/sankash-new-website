/**
 * Multi-file traveler quote uploader — supports up to 5 files (PDFs, screenshots, images).
 * All files are processed together as one itinerary session via the unified vision pipeline.
 */
import { useState, useCallback, useRef } from "react";
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
  X,
  Plus,
  ImageIcon,
} from "lucide-react";
import {
  validateFile,
  sampleAcceptedFiles,
  type ValidationErrorType,
} from "@/lib/upload-validation";
import { trackTravelerQuoteUpload, trackTravelerUnlockSubmit, trackQuoteAnalysisRequested } from "@/lib/analytics";
import { getInsuranceInsight, type InsuranceInsight } from "@/lib/insurance-rules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const MAX_FILES = 5;

type Stage = "upload" | "analyzing" | "results-medium" | "results-high" | "error";

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
      detail: "Pay digitally without extra online payment charges",
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

/** Simple file icon based on type */
function FileThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
  const isPdf = /\.pdf$/i.test(file.name);
  const [preview, setPreview] = useState<string | null>(null);

  // Generate image preview
  if (isImage && !preview) {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative group flex items-center gap-2 bg-muted rounded-lg px-2.5 py-1.5 pr-7 min-w-0">
      {preview ? (
        <img src={preview} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
      ) : isPdf ? (
        <FileText size={14} className="text-red-500 shrink-0" />
      ) : (
        <ImageIcon size={14} className="text-muted-foreground shrink-0" />
      )}
      <span className="text-[11px] text-foreground truncate max-w-[140px]">{file.name}</span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
        aria-label="Remove file"
      >
        <X size={10} className="text-muted-foreground" />
      </button>
    </div>
  );
}

const TravelerQuoteUploader = () => {
  const [stage, setStage] = useState<Stage>("upload");
  const [files, setFiles] = useState<File[]>([]);
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
  const [analysisProgress, setAnalysisProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const validated: File[] = [];
    for (const file of newFiles) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setErrorTitle(validation.errorTitle!);
        setErrorBody(validation.errorBody!);
        setErrorType(validation.errorType!);
        setStage("error");
        return;
      }
      validated.push(file);
    }
    setFiles(prev => {
      const combined = [...prev, ...validated].slice(0, MAX_FILES);
      return combined;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /** Start analysis — uploads all files and triggers the unified pipeline */
  const startAnalysis = useCallback(async () => {
    if (files.length === 0) return;
    setStage("analyzing");
    setAnalysisProgress("Uploading files…");
    trackTravelerQuoteUpload({ file_uploaded: true, file_count: files.length });
    trackQuoteAnalysisRequested({ audience_type: "traveler" });

    try {
      const { createLeadWithDedup, uploadQuoteFile } = await import("@/lib/leads-service");
      const { uploadLeadAttachment } = await import("@/lib/attachments-service");
      const { logLeadCreated } = await import("@/lib/activity-service");
      const { triggerItineraryAnalysis } = await import("@/lib/itinerary-analysis-service");

      // Upload first file as the quote file
      setAnalysisProgress("Uploading files…");
      const uploaded = await uploadQuoteFile(files[0]);

      // Create lead
      const { lead } = await createLeadWithDedup({
        full_name: "Traveler (anonymous)",
        lead_source_page: "for-travelers",
        lead_source_type: "itinerary_upload",
        audience_type: "traveler",
        quote_file_name: files.map(f => f.name).join(", "),
        quote_file_url: uploaded.url,
        metadata_json: { upload_only: true, file_count: files.length },
      });

      if (!lead?.id) throw new Error("Lead creation failed");

      // Upload all files as attachments and collect URLs
      setAnalysisProgress("Processing files…");
      const fileInputs: { file_url: string; file_name: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const attachment = await uploadLeadAttachment(file, lead.id, { sourceType: "itinerary_upload" });
          // Get the public URL for the attachment
          const { data: urlData } = await import("@/integrations/supabase/client").then(m =>
            m.supabase.storage.from("lead-attachments").getPublicUrl(attachment.storage_path)
          );
          fileInputs.push({ file_url: urlData.publicUrl, file_name: file.name });
        } catch (err) {
          console.warn(`Failed to upload file ${i + 1}:`, err);
          // If first file fails, use the quote URL
          if (i === 0) {
            fileInputs.push({ file_url: uploaded.url, file_name: file.name });
          }
        }
      }

      await logLeadCreated(lead.id, "for-travelers").catch(() => {});

      // Trigger unified AI analysis
      setAnalysisProgress("Analyzing your trip details…");
      const analysis = await triggerItineraryAnalysis({
        lead_id: lead.id,
        files: fileInputs,
        audience_type: "traveler",
      }).catch((err) => {
        console.warn("Analysis failed (non-blocking):", err);
        return null;
      });

      // Determine confidence from analysis result or default to medium
      const confidence = analysis?.parsing_confidence === "high" ? "high" : "medium";
      setInsuranceInsight(getInsuranceInsight(files[0].name));
      setStage(confidence === "high" ? "results-high" : "results-medium");
    } catch (err) {
      console.error("Upload/analysis error:", err);
      setErrorTitle("Something went wrong");
      setErrorBody("We couldn't process your files. Please try again.");
      setErrorType(null);
      setStage("error");
    }
  }, [files]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) addFiles(dropped);
    },
    [addFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) addFiles(selected);
      // Reset input so same file can be added again
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [addFiles]
  );

  const reset = () => {
    setStage("upload");
    setFiles([]);
    setErrorTitle("");
    setErrorBody("");
    setErrorType(null);
    setShowSamples(false);
    setInsuranceInsight(null);
    setAnalysisProgress("");
  };

  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validateIndianMobile = (raw: string): { valid: boolean; normalized: string; error?: string } => {
    const stripped = raw.replace(/[\s\-().]+/g, "");
    let digits = stripped.replace(/[^0-9]/g, "");
    if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
    if (digits.length !== 10) return { valid: false, normalized: digits, error: "Enter a valid 10-digit Indian mobile number" };
    if (!/^[6-9]/.test(digits)) return { valid: false, normalized: digits, error: "Indian mobile numbers start with 6, 7, 8, or 9" };
    return { valid: true, normalized: digits };
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;
    const phoneValidation = validateIndianMobile(leadPhone);
    if (!phoneValidation.valid) { setPhoneError(phoneValidation.error!); return; }
    setPhoneError(null);
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      const { createLeadWithDedup, uploadQuoteFile } = await import("@/lib/leads-service");
      const { uploadLeadAttachment } = await import("@/lib/attachments-service");
      const { logLeadCreated } = await import("@/lib/activity-service");

      let quoteFileUrl: string | null = null;
      if (files.length > 0) {
        const uploaded = await uploadQuoteFile(files[0]);
        quoteFileUrl = uploaded.url;
      }

      const { lead, isDuplicate } = await createLeadWithDedup({
        full_name: leadName.trim(),
        mobile_number: phoneValidation.normalized,
        email: leadEmail.trim() || null,
        lead_source_page: "for-travelers",
        lead_source_type: "traveler_quote_unlock",
        audience_type: "traveler",
        quote_file_name: files.map(f => f.name).join(", "),
        quote_file_url: quoteFileUrl,
        metadata_json: { confidence: stage === "results-high" ? "high" : "medium", file_count: files.length },
      });

      if (files.length > 0 && lead?.id) {
        for (const file of files) {
          await uploadLeadAttachment(file, lead.id, { sourceType: "traveler_quote_unlock" }).catch(() => {});
        }
        if (!isDuplicate) await logLeadCreated(lead.id, "for-travelers").catch(() => {});
      }

      trackTravelerUnlockSubmit({});
      setLeadSubmitted(true);
    } catch (err: any) {
      console.error("Lead creation failed:", err);
      setLeadError("Something went wrong. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const fileNames = files.map(f => f.name).join(", ");

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
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 ${
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
                    Drop quotes, itineraries, or screenshots
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload up to {MAX_FILES} files — we'll merge them into one review
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  multiple
                  onChange={handleInputChange}
                />
                <Button variant="outline" size="sm" className="mt-1 pointer-events-none">
                  Browse Files
                </Button>
              </label>

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {files.length} file{files.length > 1 ? "s" : ""} selected
                    </p>
                    {files.length < MAX_FILES && (
                      <button
                        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium"
                      >
                        <Plus size={11} /> Add more
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {files.map((file, i) => (
                      <FileThumb key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
                    ))}
                  </div>
                  <Button size="sm" className="w-full gap-1.5 mt-2" onClick={startAnalysis}>
                    <ArrowRight size={14} /> Analyze {files.length > 1 ? `${files.length} files` : "file"}
                  </Button>
                </div>
              )}

              <div className="flex items-start gap-2 mt-3 px-1">
                <Info size={11} className="text-muted-foreground/50 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                  PDF, JPG, PNG, DOC · Up to {MAX_FILES} files · Screenshots from WhatsApp or OTA apps work too · Max 10 MB each
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Analyzing ── */}
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
                Reviewing {files.length > 1 ? `${files.length} Files` : "Quote"}
              </div>
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <div className="text-center">
                  <p className="font-heading font-bold text-foreground">
                    {analysisProgress || "Processing…"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {files.length > 1
                      ? `Merging data from ${files.length} files into one review`
                      : files[0]?.name}
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
                  <p className="font-heading font-bold text-sm text-foreground mb-1.5">{errorTitle}</p>
                  <p className="text-xs text-muted-foreground max-w-[300px] leading-relaxed">{errorBody}</p>
                </div>
                {errorType === "not-travel" && (
                  <div className="flex items-start gap-2 bg-accent/50 rounded-lg px-3 py-2 max-w-[320px]">
                    <AlertCircle size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                      <span className="font-semibold">Why this failed:</span> We could not detect enough travel details.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <Button variant="outline" size="sm" onClick={reset}>
                    Try again
                  </Button>
                  <button
                    onClick={() => setShowSamples(!showSamples)}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <HelpCircle size={11} /> See accepted files
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
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Accepted examples</p>
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

          {/* ── Medium Confidence ── */}
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
                <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
                  Start over
                </button>
              </div>

              <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                <FileText size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground font-medium truncate">
                  {files.length > 1 ? `${files.length} files uploaded` : files[0]?.name}
                </span>
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
                    We found travel signals. A detailed review may need our team to verify.
                  </p>
                </div>
                <div className="space-y-2">
                  {mediumConfidenceBullets.map((bullet, i) => (
                    <motion.div key={bullet} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12, duration: 0.3 }} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-accent/40">
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
                  Upload different files
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 px-1">
                Verify your mobile number to see exact savings, EMI options, and next steps
              </p>
            </motion.div>
          )}

          {/* ── High Confidence ── */}
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
                <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
                  Upload different files
                </button>
              </div>

              <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                <FileText size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground font-medium truncate">
                  {files.length > 1 ? `${files.length} files analyzed` : files[0]?.name}
                </span>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto shrink-0">
                  Reviewed
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">What We Found</p>
                {buildTravelerInsights(insuranceInsight ?? { headline: "Travel protection can be added", detail: "Trip cancellation, medical and baggage cover available" }).map((insight, i) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div key={insight.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12, duration: 0.3 }} className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg bg-accent/40">
                      <Icon size={15} className="text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">{insight.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.detail}</p>
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
                  This is a first-pass review. Verify your number to unlock exact savings and EMI breakdown.
                </p>
              </div>

              {/* Gated section */}
              <div className="relative">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Unlock Full Review</p>
                  <div className="space-y-2 select-none" style={{ filter: "blur(4px)" }} aria-hidden>
                    {gatedInsights.map((item) => (
                      <div key={item.label} className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg bg-accent/40">
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
                    Unlock exact savings and EMI options
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-3 text-center max-w-[280px] leading-relaxed">
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
                ? "Your details have been submitted successfully. We will process your detailed review and share exact savings, EMI options, and next steps."
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
              <Button variant="outline" size="sm" onClick={() => { setShowLeadForm(false); setLeadSubmitted(false); }}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full name <span className="text-destructive">*</span></label>
                <Input placeholder="Your full name" value={leadName} onChange={(e) => setLeadName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mobile number <span className="text-destructive">*</span></label>
                <Input type="tel" placeholder="+91 98765 43210" value={leadPhone} onChange={(e) => { setLeadPhone(e.target.value); if (phoneError) setPhoneError(null); }} required maxLength={15} className={phoneError ? "border-destructive" : ""} />
                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email <span className="text-muted-foreground text-xs">(optional)</span></label>
                <Input type="email" placeholder="you@example.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} maxLength={255} />
              </div>
              {leadError && <p className="text-xs text-destructive font-medium">{leadError}</p>}
              <p className="text-[11px] text-muted-foreground">We will verify your details and share your detailed review.</p>
              <Button type="submit" className="w-full gap-2" disabled={leadSubmitting}>
                {leadSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Unlock detailed review <ArrowRight size={14} /></>}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TravelerQuoteUploader;
