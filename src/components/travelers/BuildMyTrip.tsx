/**
 * Build My Trip — traveler trip-shaping tool with 3 start modes:
 * 1. I know where I want to go (destination-first)
 * 2. I'm not sure where to go (open exploration)
 * 3. I've saved lots of trip ideas (inspiration dump)
 *
 * Uses build-my-trip.ts service layer for backend calls and response mapping.
 * Rich results rendered via TravelerBuildTripFlow.
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
  MessageCircle, CreditCard, Star, Phone,
} from "lucide-react";
import { validateFile } from "@/lib/upload-validation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  type BuildMyTripResult,
  type InspirationItem,
  buildPayload,
  uploadInspirationFiles,
  invokeBuildMyTrip,
} from "@/lib/build-my-trip";
import { saveTripSession, clearTripSession } from "@/lib/traveler-trip-context";
import TravelerBuildTripFlow from "@/components/travelers/TravelerBuildTripFlow";

/* ─── Types ─── */
type StartMode = "destination" | "explore" | "inspiration";
type FlowStep = "mode-select" | "input" | "processing" | "results" | "contact-capture";

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

function InspirationItemRow({
  item,
  onRemove,
}: {
  item: InspirationItem;
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

/* ─── Main component ─── */
const BuildMyTrip = () => {
  const [step, setStep] = useState<FlowStep>("mode-select");
  const [mode, setMode] = useState<StartMode | null>(null);

  // Destination mode
  const [destination, setDestination] = useState("");

  // Explore mode
  const [exploreMood, setExploreMood] = useState("");

  // Inspiration dump
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing & results
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [result, setResult] = useState<BuildMyTripResult | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Contact capture
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const selectMode = (m: StartMode) => {
    setMode(m);
    setStep("input");
    saveTripSession({ mode: m, step: "input" });
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

  /** Check if inspiration mode has at least one valid item (link, note, or file) */
  const hasValidInspirationInput = inspirationItems.length > 0;

  /** Submit to backend for trip shaping */
  const processTrip = async () => {
    setStep("processing");
    setIsProcessing(true);
    setBackendError(null);
    setResult(null);
    setProcessingMessage("Analysing your inputs and matching trip options…");
    saveTripSession({ mode, step: "processing" });

    try {
      // Upload any files first
      let fileUrls: { file_url: string; file_name: string }[] = [];
      if (inspirationItems.some((item) => item.file)) {
        setProcessingMessage("Uploading your files…");
        fileUrls = await uploadInspirationFiles(inspirationItems);
      }

      setProcessingMessage("Shaping your trip — matching destinations, stays, and pricing…");

      const payload = buildPayload(
        mode!,
        {
          destination,
          mood: exploreMood,
          inspirationItems,
        },
        fileUrls
      );

      const { mapped } = await invokeBuildMyTrip(payload);

      if (mapped) {
        // Decide rendering based on result strength
        if (mapped.resultStrength === "weak" && mapped.versions.length === 0 && mapped.destinationShortlist.length === 0) {
          // Weak result with nothing to show — contact capture
          setResult(mapped);
          setStep("contact-capture");
          saveTripSession({ step: "contact-capture", resultStrength: "weak" });
        } else {
          // Medium or strong result — show rich flow
          setResult(mapped);
          setStep("results");
          saveTripSession({ step: "results", resultStrength: mapped.resultStrength });
        }
      } else {
        // Backend processed but returned nothing structured — contact capture fallback
        setStep("contact-capture");
        saveTripSession({ step: "contact-capture" });
      }
    } catch (err: any) {
      console.error("Build My Trip processing error:", err);
      setBackendError(err?.message || "Processing is temporarily unavailable");
      setStep("contact-capture");
      saveTripSession({ step: "contact-capture" });
    } finally {
      setIsProcessing(false);
    }
  };

  /** Submit contact for follow-up */
  const submitContact = async () => {
    if (!contactPhone.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    try {
      const payload = buildPayload(mode!, {
        destination,
        mood: exploreMood,
        inspirationItems,
      });

      await supabase.functions.invoke("capture-traveler-contact", {
        body: {
          full_name: contactName.trim() || "Traveler",
          mobile_number: contactPhone.trim(),
          source: "build-my-trip",
          mode,
          destination: mode === "destination" ? destination : undefined,
          inspiration_count: mode === "inspiration" ? inspirationItems.length : undefined,
          ...payload,
        },
      });

      setContactSubmitted(true);
      toast.success("We'll get back to you with a detailed trip plan!");
    } catch (err) {
      console.error("Contact capture error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const reset = () => {
    setStep("mode-select");
    setMode(null);
    setDestination("");
    setExploreMood("");
    setInspirationItems([]);
    setLinkInput("");
    setTextInput("");
    setResult(null);
    setIsProcessing(false);
    setBackendError(null);
    setContactPhone("");
    setContactName("");
    setContactSubmitted(false);
    clearTripSession();
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
              onClick={() => { setStep("mode-select"); saveTripSession({ step: "mode-select" }); }}
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
                  onClick={processTrip}
                >
                  Shape my trip <ArrowRight size={14} />
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
                    What kind of holiday are you in the mood for?
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    Tell us anything — beach vibes, mountains, culture, adventure, relaxation, family-friendly — we'll suggest places that fit.
                  </p>
                </div>
                <Textarea
                  placeholder="e.g. I want a relaxing beach holiday with my partner, somewhere warm and not too expensive"
                  value={exploreMood}
                  onChange={(e) => setExploreMood(e.target.value)}
                  className="text-[12px] min-h-[60px]"
                  rows={3}
                />
                <Button
                  className="w-full gap-2"
                  disabled={!exploreMood.trim()}
                  onClick={processTrip}
                >
                  Shape my trip <ArrowRight size={14} />
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
                      <InspirationItemRow key={`${item.value}-${i}`} item={item} onRemove={() => removeItem(i)} />
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

                {/* Add note */}
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

                {/* Item count */}
                {inspirationItems.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {inspirationItems.length} item{inspirationItems.length !== 1 ? "s" : ""} added
                    {" · "}
                    {inspirationItems.filter((i) => i.type === "link").length > 0 && `${inspirationItems.filter((i) => i.type === "link").length} link${inspirationItems.filter((i) => i.type === "link").length !== 1 ? "s" : ""}`}
                    {inspirationItems.filter((i) => i.type === "text").length > 0 && `, ${inspirationItems.filter((i) => i.type === "text").length} note${inspirationItems.filter((i) => i.type === "text").length !== 1 ? "s" : ""}`}
                    {inspirationItems.filter((i) => i.type === "file").length > 0 && `, ${inspirationItems.filter((i) => i.type === "file").length} file${inspirationItems.filter((i) => i.type === "file").length !== 1 ? "s" : ""}`}
                  </p>
                )}

                <Button
                  className="w-full gap-2"
                  disabled={!hasValidInspirationInput}
                  onClick={processTrip}
                >
                  Shape my trip <ArrowRight size={14} />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5"
          >
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 size={28} className="text-primary animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-heading font-bold text-foreground text-[14px]">
                  Shaping your trip
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {processingMessage}
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
          </motion.div>
        )}

        {/* ── Contact Capture (fallback) ── */}
        {step === "contact-capture" && (
          <motion.div
            key="contact-capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-3.5"
          >
            {!contactSubmitted ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <Star size={13} className="text-primary" />
                    Almost There
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-[15px] leading-snug">
                    We've captured your trip inputs
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Share your mobile number and our team will get back to you with a detailed trip plan, real pricing, and EMI options.
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-accent/30 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">What you shared</p>
                  {mode === "destination" && (
                    <p className="text-[12px] text-foreground">📍 Destination: {destination}</p>
                  )}
                  {mode === "explore" && (
                    <p className="text-[12px] text-foreground">🧭 Mood: {exploreMood}</p>
                  )}
                  {mode === "inspiration" && (
                    <p className="text-[12px] text-foreground">
                      💡 {inspirationItems.length} inspiration item{inspirationItems.length !== 1 ? "s" : ""} shared
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Your name (optional)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Mobile number *"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="text-sm"
                    type="tel"
                    maxLength={15}
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={!contactPhone.trim()}
                  onClick={submitContact}
                >
                  <Phone size={14} /> Send me a trip plan
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  We'll share a personalised trip plan on WhatsApp or call.
                </p>

                <button
                  onClick={reset}
                  className="w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors text-center pt-1"
                >
                  Start over
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-brand-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-foreground text-[15px]">
                    You're all set!
                  </h3>
                  <p className="text-[12px] text-muted-foreground max-w-[240px]">
                    Our team will review your trip inputs and reach out with a detailed plan, pricing, and EMI options.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={reset} className="mt-2 gap-1.5 text-[12px]">
                  <Compass size={12} /> Build another trip
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Rich Results (via TravelerBuildTripFlow) ── */}
        {step === "results" && result && (
          <TravelerBuildTripFlow
            result={result}
            onReset={reset}
            onContactCapture={() => setStep("contact-capture")}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuildMyTrip;
