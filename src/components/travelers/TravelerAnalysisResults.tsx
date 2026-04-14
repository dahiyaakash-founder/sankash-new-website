/**
 * Partial extraction results view for travelers.
 * Shows what was found, what's missing, and prompts for more uploads.
 */
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin, Calendar, Users, CreditCard, Plane, Building2,
  CheckCircle2, AlertTriangle, Plus, Upload, ImageIcon,
  FileText, Phone, Lock, ArrowRight, Loader2, X,
  Shield, Wallet, TrendingDown,
} from "lucide-react";
import type { ItineraryAnalysis } from "@/lib/itinerary-analysis-service";

interface Props {
  analysis: ItineraryAnalysis | null;
  files: File[];
  onUnlock: () => void;
  onAddMore: (newFiles: File[]) => void;
  onReanalyze: () => void;
  onReset: () => void;
  isReanalyzing?: boolean;
}

type SectionStatus = "found" | "partial" | "missing";

function sectionStatus(fields: (unknown | null | undefined)[]): SectionStatus {
  const filled = fields.filter(f => f != null && f !== "" && f !== false).length;
  if (filled === 0) return "missing";
  if (filled === fields.length) return "found";
  return "partial";
}

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === "found") return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
  if (status === "partial") return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
  return <AlertTriangle size={14} className="text-muted-foreground/40 shrink-0" />;
}

function DataRow({ label, value, icon: Icon }: {
  label: string;
  value: string | number | null | undefined;
  icon?: any;
}) {
  const isEmpty = value == null || value === "";
  if (isEmpty) return null;
  return (
    <div className="flex items-center gap-2 py-1">
      {Icon && <Icon size={12} className="text-muted-foreground shrink-0" />}
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium text-foreground ml-auto">{String(value)}</span>
    </div>
  );
}

function MissingPrompt({ title, description, uploadHint }: {
  title: string;
  description: string;
  uploadHint: string;
}) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2.5">
      <div className="flex items-start gap-2">
        <Upload size={13} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">{title}</p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70 mt-0.5">{description}</p>
          <p className="text-[10px] text-amber-600/70 dark:text-amber-500/60 mt-1 italic">{uploadHint}</p>
        </div>
      </div>
    </div>
  );
}

function clipText(value: string, max = 72) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function buildManualReviewSignals(analysis: ItineraryAnalysis | null, files: File[]) {
  const signals: string[] = [];
  const destination = [analysis?.destination_city, analysis?.destination_country].filter(Boolean).join(", ");

  if (destination) signals.push(`Destination clue: ${destination}`);
  if (analysis?.duration_nights || analysis?.duration_days) {
    signals.push(`Duration clue: ${analysis.duration_nights ?? "?"}N / ${analysis.duration_days ?? "?"}D`);
  }
  if ((analysis?.hotel_names_json ?? []).length > 0) {
    signals.push(`Stay clue: ${(analysis?.hotel_names_json ?? []).slice(0, 2).join(", ")}`);
  }
  if ((analysis?.airline_names_json ?? []).length > 0 || (analysis?.sectors_json ?? []).length > 0) {
    const flightHint = [
      ...(analysis?.airline_names_json ?? []).slice(0, 1),
      ...(analysis?.sectors_json ?? []).slice(0, 1),
    ].filter(Boolean).join(" · ");
    if (flightHint) signals.push(`Flight clue: ${flightHint}`);
  }
  if (analysis?.total_price != null) {
    signals.push(`Price clue: ${analysis.currency ?? "INR"} ${Number(analysis.total_price).toLocaleString("en-IN")}`);
  } else if (analysis?.price_per_person != null) {
    signals.push(`Price clue: ${analysis.currency ?? "INR"} ${Number(analysis.price_per_person).toLocaleString("en-IN")} per person`);
  }
  if (analysis?.inclusions_text) {
    signals.push(`Visible in plan: ${clipText(analysis.inclusions_text)}`);
  } else if ((analysis?.extracted_snippets_json ?? []).length > 0) {
    const snippet = (analysis?.extracted_snippets_json ?? []).find((item) => typeof item === "string" && item.trim().length > 0);
    if (snippet) signals.push(`Visible in plan: ${clipText(String(snippet))}`);
  }

  if (signals.length === 0 && files.length > 0) {
    signals.push(files.length > 1 ? `${files.length} trip documents received` : "Trip document received");
  }

  return signals.slice(0, 4);
}

/** Small file thumbnail for add-more section */
function SmallFileThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
  return (
    <div className="relative group flex items-center gap-1.5 bg-muted rounded px-2 py-1 pr-6 min-w-0">
      {isImage ? (
        <ImageIcon size={11} className="text-muted-foreground shrink-0" />
      ) : (
        <FileText size={11} className="text-red-500 shrink-0" />
      )}
      <span className="text-[10px] text-foreground truncate max-w-[100px]">{file.name}</span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full hover:bg-destructive/20 flex items-center justify-center"
        aria-label="Remove"
      >
        <X size={8} className="text-muted-foreground" />
      </button>
    </div>
  );
}

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
  const [addMoreExpanded, setAddMoreExpanded] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) setAdditionalFiles(prev => [...prev, ...selected].slice(0, 5));
    if (addFileRef.current) addFileRef.current.value = "";
  }, []);

  const submitAdditional = () => {
    if (additionalFiles.length === 0) return;
    onAddMore(additionalFiles);
    setAdditionalFiles([]);
    setAddMoreExpanded(false);
  };

  // Compute section statuses
  const destination = [a?.destination_city, a?.destination_country].filter(Boolean).join(", ");
  const hasDates = !!(a?.travel_start_date || a?.travel_end_date);
  const hasTravellers = !!a?.traveller_count_total;

  const priceStatus = sectionStatus([a?.total_price, a?.price_per_person]);
  const flightStatus = sectionStatus([a?.flight_departure_time, a?.flight_arrival_time, ...(a?.airline_names_json ?? []), ...(a?.sectors_json ?? [])]);
  const hotelStatus = sectionStatus([a?.hotel_check_in, a?.hotel_check_out, ...(a?.hotel_names_json ?? [])]);
  const tripStatus = sectionStatus([destination, a?.travel_start_date, a?.traveller_count_total, a?.duration_nights, a?.duration_days]);
  const confidence = a?.parsing_confidence ?? "low";
  const isLowConfidence = confidence === "low";
  const manualReviewSignals = buildManualReviewSignals(a, files);

  const anyFound = priceStatus !== "missing" || flightStatus !== "missing" || hotelStatus !== "missing" || tripStatus !== "missing";
  const allMissing = !anyFound;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <FileText size={14} className="text-primary" />
          Trip Snapshot
        </div>
        <button onClick={onReset} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
          Start over
        </button>
      </div>

      {/* Files analyzed */}
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
        <FileText size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs text-foreground font-medium truncate">
          {files.length > 1 ? `${files.length} files analyzed` : files[0]?.name}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto shrink-0 ${
          isLowConfidence ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
        }`}>
          {isLowConfidence ? "Partial" : "Reviewed"}
        </span>
      </div>

      {/* Low confidence banner */}
      {isLowConfidence && anyFound && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2">
          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            We found some trip details but couldn't extract everything. Upload clearer or additional screenshots for a complete review.
          </p>
        </div>
      )}

      {/* All missing / weakly-structured — graceful manual fallback */}
      {allMissing && (
        <div className="rounded-xl border bg-accent/20 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">We understood you're planning a trip</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our automatic review could not fully identify all the trip details from this file or format. Share your mobile number and our team will review it and continue with you on WhatsApp or call.
              </p>
            </div>
          </div>

          {manualReviewSignals.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">What we could still pick up</p>
              <div className="flex flex-wrap gap-1.5">
                {manualReviewSignals.map((signal) => (
                  <span key={signal} className="rounded-full border bg-background px-2.5 py-1 text-[10px] text-foreground">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section: Trip Overview (always first if found) ── */}
      {tripStatus !== "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={tripStatus} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Trip Overview</span>
          </div>
          <DataRow label="Destination" value={destination || null} icon={MapPin} />
          <DataRow label="Type" value={a?.domestic_or_international} icon={MapPin} />
          <DataRow label="Dates" value={
            a?.travel_start_date && a?.travel_end_date
              ? `${a.travel_start_date} → ${a.travel_end_date}`
              : a?.travel_start_date || a?.travel_end_date || null
          } icon={Calendar} />
          <DataRow label="Duration" value={
            a?.duration_nights ? `${a.duration_nights}N / ${a.duration_days ?? a.duration_nights + 1}D` : null
          } icon={Calendar} />
          <DataRow label="Travellers" value={
            a?.traveller_count_total
              ? `${a.traveller_count_total} total${a.adults_count ? ` (${a.adults_count}A` : ""}${a.children_count ? ` ${a.children_count}C` : ""}${a.infants_count ? ` ${a.infants_count}I` : ""}${a.adults_count ? ")" : ""}`
              : null
          } icon={Users} />
        </motion.div>
      )}

      {/* ── Section: Price Benchmark ── */}
      {priceStatus !== "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={priceStatus} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Price & EMI</span>
          </div>
          <DataRow label="Total price" value={a?.total_price ? `${a.currency ?? "INR"} ${Number(a.total_price).toLocaleString("en-IN")}` : null} icon={CreditCard} />
          <DataRow label="Per person" value={a?.price_per_person ? `${a.currency ?? "INR"} ${Number(a.price_per_person).toLocaleString("en-IN")}` : null} icon={CreditCard} />
          
          {/* Actionable insights when price is found */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
              <TrendingDown size={13} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-foreground">This quote can be optimised</p>
                <p className="text-[10px] text-muted-foreground">Potential savings of up to 5%</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
              <CreditCard size={13} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-foreground">Eligible for No Cost EMI</p>
                <p className="text-[10px] text-muted-foreground">6-month EMI available, subject to credit approval</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Section: Flights ── */}
      {flightStatus !== "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={flightStatus} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Flights</span>
          </div>
          <DataRow label="Departure" value={a?.flight_departure_time} icon={Plane} />
          <DataRow label="Arrival" value={a?.flight_arrival_time} icon={Plane} />
          {(a?.airline_names_json ?? []).length > 0 && (
            <DataRow label="Airlines" value={(a?.airline_names_json ?? []).join(", ")} icon={Plane} />
          )}
          {(a?.sectors_json ?? []).length > 0 && (
            <DataRow label="Sectors" value={(a?.sectors_json ?? []).join(", ")} icon={Plane} />
          )}
        </motion.div>
      )}

      {/* ── Section: Hotels ── */}
      {hotelStatus !== "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={hotelStatus} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hotels</span>
          </div>
          {(a?.hotel_names_json ?? []).length > 0 && (
            <DataRow label="Hotels" value={(a?.hotel_names_json ?? []).join(", ")} icon={Building2} />
          )}
          <DataRow label="Check-in" value={a?.hotel_check_in} icon={Calendar} />
          <DataRow label="Check-out" value={a?.hotel_check_out} icon={Calendar} />
        </motion.div>
      )}

      {/* ── Missing section prompts ── */}
      {priceStatus === "missing" && anyFound && (
        <MissingPrompt
          title="Price not detected"
          description="Upload a screenshot showing the trip price to unlock savings estimate and EMI options."
          uploadHint="Tip: A screenshot of the price summary page works best"
        />
      )}
      {flightStatus === "missing" && anyFound && (
        <MissingPrompt
          title="Flight details missing"
          description="Add a screenshot of your flight booking or itinerary to see departure/arrival times."
          uploadHint="Tip: Share the flight confirmation or booking screenshot"
        />
      )}
      {hotelStatus === "missing" && anyFound && (
        <MissingPrompt
          title="Hotel details missing"
          description="Upload hotel booking screenshots to complete your trip timeline."
          uploadHint="Tip: Share hotel confirmation emails or OTA booking screenshots"
        />
      )}

      {/* ── Add More Screenshots ── */}
      {anyFound && (
        <div className="border border-dashed rounded-lg p-3">
          {!addMoreExpanded ? (
            <button
              onClick={() => setAddMoreExpanded(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus size={13} /> Add more screenshots to improve results
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add More Files</p>
              {additionalFiles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {additionalFiles.map((f, i) => (
                    <SmallFileThumb
                      key={`${f.name}-${i}`}
                      file={f}
                      onRemove={() => setAdditionalFiles(prev => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs flex-1"
                  onClick={() => addFileRef.current?.click()}
                >
                  <ImageIcon size={12} /> Choose files
                </Button>
                {additionalFiles.length > 0 && (
                  <Button
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={submitAdditional}
                    disabled={isReanalyzing}
                  >
                    {isReanalyzing ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                    Re-analyze
                  </Button>
                )}
              </div>
              <input
                ref={addFileRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleAddFiles}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Unlock CTA ── */}
      <div className="space-y-2 pt-1">
        {anyFound && (
          <>
            <div className="relative rounded-xl overflow-hidden">
              <div className="space-y-1.5 select-none p-3" style={{ filter: "blur(4px)" }} aria-hidden>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
                  <Shield size={13} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground">Exact savings amount and EMI breakdown</p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/40">
                  <Wallet size={13} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground">Recommended travel protection with pricing</p>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] px-4">
                <Lock size={16} className="text-primary mb-1.5" />
                <p className="font-heading font-bold text-xs text-foreground mb-0.5 text-center">
                  Unlock full review
                </p>
                <p className="text-[10px] text-muted-foreground mb-2 text-center max-w-[260px]">
                  Verify your mobile to see exact savings, EMI options, and trip recommendations
                </p>
                <Button size="sm" className="gap-1.5" onClick={onUnlock}>
                  <Phone size={13} /> Unlock full review
                </Button>
              </div>
            </div>
          </>
        )}

        {allMissing && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="sm" className="gap-1.5" onClick={onUnlock}>
              <Phone size={13} /> Continue with our team
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              Upload different files
            </Button>
          </div>
        )}
      </div>

      {/* Confidence + warnings footer */}
      {a?.confidence_notes && (
        <p className="text-[10px] text-muted-foreground italic px-1">ℹ️ {a.confidence_notes}</p>
      )}
      {(a?.extraction_warnings_json ?? []).length > 0 && (
        <div className="space-y-0.5 px-1">
          {(a?.extraction_warnings_json ?? []).map((w, i) => (
            <p key={i} className="text-[10px] text-amber-600 italic">⚠️ {w as string}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
