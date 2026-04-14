/**
 * Multi-file traveler quote uploader — supports up to 5 files (PDFs, screenshots, images).
 * All files are processed together as one itinerary session via the unified vision pipeline.
 * Results are shown via TravelerAnalysisResults with partial extraction support.
 */
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Phone,
  XCircle,
  HelpCircle,
  Info,
  AlertCircle,
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
import { buildTravelerIntentSnapshot, markTravelerIntentSignal } from "@/lib/traveler-intent-session";
import { captureTravelerContact } from "@/lib/traveler-contact-service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ItineraryAnalysis } from "@/lib/itinerary-analysis-service";
import TravelerAnalysisResults from "./TravelerAnalysisResults";

const MAX_FILES = 5;

type Stage = "upload" | "analyzing" | "results" | "error";

function buildAnalysisMessages(files: File[]) {
  const isMultiFile = files.length > 1;
  const hasPdf = files.some((file) => /\.pdf$/i.test(file.name));
  const hasScreenshots = files.some((file) => /\.(png|jpg|jpeg|webp)$/i.test(file.name));
  const brochureLike = files.some((file) => /brochure|package|itinerary|quote/i.test(file.name));

  const messages = [
    {
      title: "Getting to know your holiday",
      detail: isMultiFile ? `Piecing together the full picture from ${files.length} parts of your trip plan.` : "Taking a close look at your travel plan to understand what's been offered.",
    },
    {
      title: "Mapping your destination and travel dates",
      detail: "Understanding where you're headed, when you plan to go, and who's travelling.",
    },
    {
      title: "Reviewing stays, flights, and what's included",
      detail: hasPdf || brochureLike
        ? "Going through the itinerary to check hotel quality, flight details, and what's covered in the price."
        : "Looking at the hotels, flights, meals, transfers, and everything else that shapes this trip.",
    },
    {
      title: "Looking for hidden costs and surprises",
      detail: "Checking for anything that might not be included — like visa fees, insurance, airport transfers, or taxes.",
    },
    {
      title: isMultiFile ? "Building one clear picture from all your trip details" : "Putting the full trip together",
      detail: isMultiFile
        ? "Connecting the dots across your itineraries to spot anything that doesn't line up."
        : "Making sure everything adds up before we share our thoughts.",
    },
    {
      title: "Shaping your personalised trip review",
      detail: hasScreenshots ? "Turning every detail into a clear, useful summary of your holiday plan." : "Preparing a clear review with insights, tips, and next steps for your trip.",
    },
  ];

  return messages;
}

function buildAnalysisContextBadges(files: File[]) {
  const badges: string[] = [];
  const hasPdf = files.some((file) => /\.pdf$/i.test(file.name));
  const imageCount = files.filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file.name)).length;
  const brochureLike = files.some((file) => /brochure|package|itinerary|quote/i.test(file.name));

  if (files.length > 1) badges.push(`${files.length} items`);
  if (hasPdf) badges.push("Itinerary PDF");
  if (imageCount > 0) badges.push(imageCount > 1 ? "Screenshots" : "Screenshot");
  if (brochureLike) badges.push("Travel package");

  return badges.slice(0, 4);
}




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
        aria-label="Remove"
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
  const [analysisResult, setAnalysisResult] = useState<ItineraryAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisMessages = useMemo(() => buildAnalysisMessages(files), [files]);
  const analysisContextBadges = useMemo(() => buildAnalysisContextBadges(files), [files]);

  useEffect(() => {
    if (stage !== "analyzing") {
      setAnalysisStepIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setAnalysisStepIndex((current) => (current + 1) % analysisMessages.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [stage, analysisMessages.length]);

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
    setAnalysisProgress("Preparing your trip details…");
    markTravelerIntentSignal("started_quote_upload");
    trackTravelerQuoteUpload({ file_uploaded: true });
    trackQuoteAnalysisRequested({ audience_type: "traveler" });

    try {
      const { createLeadWithDedup, uploadQuoteFile } = await import("@/lib/leads-service");
      const { uploadLeadAttachment } = await import("@/lib/attachments-service");
      const { logLeadCreated } = await import("@/lib/activity-service");
      const { triggerItineraryAnalysis } = await import("@/lib/itinerary-analysis-service");

      // Upload first file as the quote file
      setAnalysisProgress("Securing your trip details…");
      const uploaded = await uploadQuoteFile(files[0]);

      // Create lead
      const { lead } = await createLeadWithDedup({
        full_name: "Traveler (anonymous)",
        lead_source_page: "for-travelers",
        lead_source_type: "itinerary_upload",
        audience_type: "traveler",
        quote_file_name: files.map(f => f.name).join(", "),
        quote_file_url: uploaded.url,
        metadata_json: {
          upload_only: true,
          file_count: files.length,
          traveler_intent_session: buildTravelerIntentSnapshot({
            context: "initial_upload",
            file_count: files.length,
          }),
        },
      });

      if (!lead?.id) throw new Error("Lead creation failed");

      // Upload all files as attachments and collect URLs
      setAnalysisProgress("Organising your holiday details…");
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
      setAnalysisProgress("Reviewing your holiday plan…");
      const analysis = await triggerItineraryAnalysis({
        lead_id: lead.id,
        files: fileInputs,
        audience_type: "traveler",
      }).catch((err) => {
        console.warn("Analysis failed (non-blocking):", err);
        return null;
      });

      // Determine confidence from analysis result or default to medium
      setAnalysisResult(analysis);
      setCurrentLeadId(lead.id);
      setStage("results");
    } catch (err) {
      console.error("Upload/analysis error:", err);
      setErrorTitle("Something went wrong");
      setErrorBody("We couldn't review your trip details. Please try again.");
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
    setAnalysisResult(null);
    setAnalysisProgress("");
    setCurrentLeadId(null);
    setIsReanalyzing(false);
    sessionStorage.removeItem("traveler_quote_session");
  };

  /** Add more files to existing analysis and re-trigger */
  const handleAddMoreFiles = useCallback(async (newFiles: File[]) => {
    if (!currentLeadId) return;
    setIsReanalyzing(true);
    markTravelerIntentSignal("added_more_files");
    try {
      const { uploadLeadAttachment } = await import("@/lib/attachments-service");
      const { triggerItineraryAnalysis } = await import("@/lib/itinerary-analysis-service");
      const { supabase } = await import("@/integrations/supabase/client");

      const fileInputs: { file_url: string; file_name: string }[] = [];

      // Upload new files as attachments
      for (const file of newFiles) {
        try {
          const attachment = await uploadLeadAttachment(file, currentLeadId, { sourceType: "itinerary_upload" });
          const { data: urlData } = supabase.storage.from("lead-attachments").getPublicUrl(attachment.storage_path);
          fileInputs.push({ file_url: urlData.publicUrl, file_name: file.name });
        } catch (err) {
          console.warn("Failed to upload additional file:", err);
        }
      }

      if (fileInputs.length === 0) throw new Error("No files uploaded");

      // Merge with original file URLs if we have them
      // Re-trigger analysis with all files
      const result = await triggerItineraryAnalysis({
        lead_id: currentLeadId,
        files: fileInputs,
        audience_type: "traveler",
      });

      setAnalysisResult(result);
      setFiles(prev => [...prev, ...newFiles]);
    } catch (err) {
      console.error("Re-analysis failed:", err);
    } finally {
      setIsReanalyzing(false);
    }
  }, [currentLeadId]);

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
    markTravelerIntentSignal("submitted_contact_details");
    try {
      const { createLeadWithDedup, uploadQuoteFile } = await import("@/lib/leads-service");
      const { uploadLeadAttachment } = await import("@/lib/attachments-service");
      const { logLeadCreated } = await import("@/lib/activity-service");

      if (currentLeadId) {
        await captureTravelerContact({
          lead_id: currentLeadId,
          full_name: leadName.trim(),
          mobile_number: phoneValidation.normalized,
          email: leadEmail.trim() || null,
          intent_snapshot: buildTravelerIntentSnapshot({
            context: "contact_capture",
            current_lead_id: currentLeadId,
            file_count: files.length,
          }),
        });

        trackTravelerUnlockSubmit({});
        setLeadSubmitted(true);
        return;
      }

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
        metadata_json: {
          confidence: analysisResult?.parsing_confidence ?? "medium",
          file_count: files.length,
          traveler_intent_session: buildTravelerIntentSnapshot({
            context: "contact_capture",
            file_count: files.length,
          }),
        },
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

  const activeAnalysisMessage = analysisMessages[analysisStepIndex] ?? analysisMessages[0];

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
                Holiday Quote Review
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
                    Drop your travel quote, itinerary, or screenshots
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share up to {MAX_FILES} items — we'll build one clear review of your trip
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
                  Choose from device
                </Button>
              </label>

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {files.length} {files.length > 1 ? "items" : "item"} ready for review
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
                    <ArrowRight size={14} /> Review my trip
                  </Button>
                </div>
              )}

              <div className="flex items-start gap-2 mt-3 px-1">
                <Info size={11} className="text-muted-foreground/50 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                  PDF, JPG, PNG, DOC · Up to {MAX_FILES} items · Screenshots from WhatsApp or travel apps work too · Max 10 MB each
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
                Reviewing Your Holiday
              </div>
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <div className="text-center space-y-2 max-w-sm">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
                    {analysisContextBadges.length > 0 && analysisContextBadges.map((badge) => (
                      <span key={badge}>{badge}</span>
                    ))}
                    {analysisContextBadges.length === 0 && <span>Reviewing your trip plan</span>}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground">
                      {activeAnalysisMessage?.title || analysisProgress || "Getting to know your trip…"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {activeAnalysisMessage?.detail ?? (
                        files.length > 1
                          ? `Building one clear picture from your ${files.length} trip details`
                          : "Taking a close look at your holiday plan"
                      )}
                    </p>
                  </div>
                </div>
                {analysisContextBadges.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {analysisContextBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5 mt-2">
                  {analysisMessages.map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-7 h-1 rounded-full bg-primary/20"
                      animate={{
                        opacity: i === analysisStepIndex ? 1 : 0.35,
                        backgroundColor: i === analysisStepIndex
                          ? "hsl(189 99% 35% / 0.75)"
                          : "hsl(189 99% 35% / 0.2)",
                      }}
                      transition={{ duration: 0.3 }}
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
                We Hit a Snag
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
                      <span className="font-semibold">What happened:</span> We couldn't find enough trip information to work with.
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
                    <HelpCircle size={11} /> What can I share?
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

          {/* ── Results (partial extraction) ── */}
          {stage === "results" && (
            <TravelerAnalysisResults
              key="results"
              analysis={analysisResult}
              files={files}
              onUnlock={() => setShowLeadForm(true)}
              onAddMore={handleAddMoreFiles}
              onReanalyze={() => {}}
              onReset={reset}
              isReanalyzing={isReanalyzing}
            />
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
