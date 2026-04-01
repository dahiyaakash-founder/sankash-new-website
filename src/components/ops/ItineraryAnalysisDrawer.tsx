/**
 * Slide-over drawer for itinerary analysis results.
 * Opened via "View Itinerary Analysis" button on lead detail.
 *
 * Four states: loading | loaded | no_analysis | error
 */
import { useState, useEffect, useRef } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, MapPin, Calendar, Users, CreditCard, Shield, Wallet,
  Building2, Plane, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  XCircle, FileSearch, Sparkles, HelpCircle, RefreshCw,
} from "lucide-react";
import { fetchItineraryAnalysis, triggerItineraryAnalysis, type ItineraryAnalysis } from "@/lib/itinerary-analysis-service";
import { toast } from "sonner";
import { trackItineraryAnalysisOpened } from "@/lib/analytics";

interface Props {
  leadId: string;
  attachmentId?: string;
  fileUrl: string;
  fileName: string;
  audienceType?: string;
}

type DrawerState = "loading" | "loaded" | "no_analysis" | "error";

const confidenceColors: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800",
};

/** Always-visible row: shows placeholder when value is missing */
function InfoRow({ label, value, icon: Icon, placeholder }: {
  label: string;
  value: string | number | null | undefined;
  icon?: any;
  placeholder?: string;
}) {
  const isEmpty = value == null || value === "";
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0">
      {Icon && <Icon size={13} className={`shrink-0 mt-0.5 ${isEmpty ? "text-muted-foreground/40" : "text-muted-foreground"}`} />}
      <span className="text-xs text-muted-foreground min-w-[100px]">{label}</span>
      {isEmpty ? (
        <span className="text-xs text-muted-foreground/50 italic flex-1 text-right flex items-center justify-end gap-1">
          <HelpCircle size={10} /> {placeholder || "Not found"}
        </span>
      ) : (
        <span className="text-xs font-medium text-foreground flex-1 text-right">{String(value)}</span>
      )}
    </div>
  );
}

function FlagBadge({ label, active, variant }: { label: string; active: boolean; variant: "success" | "muted" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      active
        ? variant === "success" ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground"
    }`}>
      {active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {label}
    </span>
  );
}

export default function ItineraryAnalysisDrawer({ leadId, attachmentId, fileUrl, fileName, audienceType }: Props) {
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<ItineraryAnalysis | null>(null);
  const [drawerState, setDrawerState] = useState<DrawerState>("loading");
  const [analyzing, setAnalyzing] = useState(false);
  const [rawExpanded, setRawExpanded] = useState(false);
  const [snippetsExpanded, setSnippetsExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Reset fetch flag when drawer closes or leadId changes
  useEffect(() => {
    if (!open) {
      hasFetched.current = false;
      setAnalysis(null);
      setDrawerState("loading");
      setErrorMsg(null);
    }
  }, [open, leadId]);

  // Fetch analysis once when drawer opens
  useEffect(() => {
    if (!open || hasFetched.current) return;
    hasFetched.current = true;
    trackItineraryAnalysisOpened();
    setDrawerState("loading");

    fetchItineraryAnalysis(leadId)
      .then((data) => {
        if (data) {
          setAnalysis(data);
          setDrawerState("loaded");
        } else {
          setDrawerState("no_analysis");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch itinerary analysis:", err);
        setErrorMsg(err?.message || "Unknown error");
        setDrawerState("error");
      });
  }, [open, leadId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = await triggerItineraryAnalysis({
        lead_id: leadId,
        attachment_id: attachmentId,
        file_url: fileUrl,
        file_name: fileName,
        audience_type: audienceType,
      });
      setAnalysis(result);
      setDrawerState("loaded");
      toast.success("Itinerary analyzed");
    } catch (err: any) {
      const msg = err.message || "Analysis failed";
      toast.error(msg);
      setErrorMsg(msg);
      setDrawerState("error");
    }
    setAnalyzing(false);
  };

  const handleRetry = () => {
    hasFetched.current = false;
    setDrawerState("loading");
    setErrorMsg(null);
    setAnalysis(null);

    fetchItineraryAnalysis(leadId)
      .then((data) => {
        if (data) {
          setAnalysis(data);
          setDrawerState("loaded");
        } else {
          setDrawerState("no_analysis");
        }
      })
      .catch((err) => {
        setErrorMsg(err?.message || "Unknown error");
        setDrawerState("error");
      });
  };

  const a = analysis;
  const missingFields = (a?.missing_fields_json ?? []) as string[];
  const snippets = (a?.extracted_snippets_json ?? []) as string[];
  const hotels = (a?.hotel_names_json ?? []) as string[];
  const airlines = (a?.airline_names_json ?? []) as string[];
  const sectors = (a?.sectors_json ?? []) as string[];
  const additionalDests = (a?.additional_destinations_json ?? []) as string[];
  const extractedFields = (a?.extracted_fields_json ?? {}) as Record<string, unknown>;
  const confidenceNotes = extractedFields.confidence_notes as string | undefined;
  const priceNotes = extractedFields.price_notes as string | undefined;
  const altPrices = (extractedFields.alternate_prices ?? []) as number[];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <FileSearch size={12} /> View Itinerary Analysis
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-sm font-heading flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> Itinerary Analysis
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            AI-extracted travel details for {fileName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* 1. Loading state */}
          {drawerState === "loading" && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading analysis…</p>
            </div>
          )}

          {/* 2. Error state */}
          {drawerState === "error" && (
            <div className="text-center py-8 space-y-3">
              <AlertTriangle size={32} className="mx-auto text-amber-500" />
              <p className="text-sm text-muted-foreground">We could not load itinerary analysis right now.</p>
              {errorMsg && <p className="text-xs text-muted-foreground/70">{errorMsg}</p>}
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} variant="outline" size="sm" className="gap-1.5">
                  <RefreshCw size={13} /> Retry
                </Button>
                <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="gap-1.5">
                  {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {analyzing ? "Analyzing…" : "Run Analysis"}
                </Button>
              </div>
            </div>
          )}

          {/* 3. No analysis yet */}
          {drawerState === "no_analysis" && (
            <div className="text-center py-8 space-y-3">
              <FileSearch size={32} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No analysis available for this file yet.</p>
              <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="gap-1.5">
                {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {analyzing ? "Analyzing…" : "Run Analysis"}
              </Button>
              <p className="text-[10px] text-muted-foreground">
                AI will extract trip details, pricing, and commercial flags from the uploaded file
              </p>
            </div>
          )}

          {/* 4. Loaded successfully */}
          {drawerState === "loaded" && a && (
            <>
              {/* Confidence + re-run */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${confidenceColors[a.parsing_confidence] ?? confidenceColors.low}`}>
                  {a.parsing_confidence?.toUpperCase()} CONFIDENCE
                </span>
                <Button variant="ghost" size="sm" onClick={handleAnalyze} disabled={analyzing} className="text-xs gap-1 h-7">
                  {analyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  Re-analyze
                </Button>
              </div>

              {/* Confidence notes */}
              {confidenceNotes && (
                <p className="text-[10px] text-muted-foreground bg-muted rounded px-2 py-1.5 italic">
                  ℹ️ {confidenceNotes}
                </p>
              )}

              {/* A. Extracted Summary — always show all Ring 1 fields */}
              <div className="border rounded-lg p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trip Summary</p>
                <InfoRow
                  label="Destination"
                  value={[a.destination_city, a.destination_country].filter(Boolean).join(", ") || null}
                  icon={MapPin}
                  placeholder="Destination not detected"
                />
                <InfoRow label="Type" value={a.domestic_or_international} icon={MapPin} placeholder="Domestic/intl unclear" />
                {additionalDests.length > 0 && (
                  <InfoRow label="Other places" value={additionalDests.join(", ")} icon={MapPin} />
                )}
                <InfoRow
                  label="Travel dates"
                  value={
                    a.travel_start_date && a.travel_end_date
                      ? `${a.travel_start_date} → ${a.travel_end_date}`
                      : a.travel_start_date || a.travel_end_date || null
                  }
                  icon={Calendar}
                  placeholder="Dates not found"
                />
                <InfoRow
                  label="Duration"
                  value={
                    a.duration_nights ? `${a.duration_nights}N / ${a.duration_days ?? a.duration_nights + 1}D` : null
                  }
                  icon={Calendar}
                  placeholder="Duration not found"
                />
                <InfoRow
                  label="Travellers"
                  value={
                    a.traveller_count_total
                      ? `${a.traveller_count_total} total${a.adults_count ? ` (${a.adults_count}A` : ""}${a.children_count ? ` ${a.children_count}C` : ""}${a.infants_count ? ` ${a.infants_count}I` : ""}${a.adults_count ? ")" : ""}`
                      : null
                  }
                  icon={Users}
                  placeholder="Traveller count not found"
                />
                <InfoRow
                  label="Total price"
                  value={a.total_price ? `${a.currency} ${Number(a.total_price).toLocaleString("en-IN")}` : null}
                  icon={CreditCard}
                  placeholder="Price not detected"
                />
                <InfoRow
                  label="Per person"
                  value={a.price_per_person ? `${a.currency} ${Number(a.price_per_person).toLocaleString("en-IN")}` : null}
                  icon={CreditCard}
                  placeholder="Not stated"
                />
                {priceNotes && (
                  <p className="text-[10px] text-amber-600 italic px-1 mt-0.5">💡 {priceNotes}</p>
                )}
                {altPrices.length > 0 && (
                  <div className="text-[10px] text-muted-foreground px-1 mt-0.5">
                    Other prices seen: {altPrices.map(p => `${a.currency} ${Number(p).toLocaleString("en-IN")}`).join(", ")}
                  </div>
                )}
                <InfoRow label="Uploaded by" value={a.uploaded_by_audience} icon={Users} placeholder="Unknown" />
                <InfoRow label="Agent name" value={a.travel_agent_name} icon={Building2} placeholder="Not identified" />
                <InfoRow label="Customer" value={a.customer_name} icon={Users} placeholder="Not identified" />
              </div>

              {/* B. Travel Components */}
              <div className="border rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Travel Components</p>
                {hotels.length > 0 ? (
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">Hotels</span>
                    <div className="flex flex-wrap gap-1">
                      {hotels.map((h, i) => <Badge key={i} variant="secondary" className="text-[10px]">{h}</Badge>)}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 italic">No hotels detected</p>
                )}
                {airlines.length > 0 ? (
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">Airlines</span>
                    <div className="flex flex-wrap gap-1">
                      {airlines.map((al, i) => <Badge key={i} variant="secondary" className="text-[10px]">{al}</Badge>)}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 italic">No airlines detected</p>
                )}
                {sectors.length > 0 && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">Sectors</span>
                    <div className="flex flex-wrap gap-1">
                      {sectors.map((s, i) => <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {a.inclusions_text && (
                  <div>
                    <span className="text-[10px] text-muted-foreground font-medium">Inclusions</span>
                    <p className="text-xs text-foreground mt-0.5">{a.inclusions_text}</p>
                  </div>
                )}
                {a.exclusions_text && (
                  <div>
                    <span className="text-[10px] text-muted-foreground font-medium">Exclusions</span>
                    <p className="text-xs text-foreground mt-0.5">{a.exclusions_text}</p>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap pt-1">
                  <FlagBadge label="Visa" active={a.visa_mentioned === true} variant="muted" />
                  <FlagBadge label="Insurance" active={a.insurance_mentioned === true} variant="muted" />
                </div>
              </div>

              {/* C. Commercial Flags */}
              <div className="border rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Commercial Flags</p>
                <div className="flex gap-2 flex-wrap">
                  <FlagBadge label="EMI Candidate" active={a.emi_candidate} variant="success" />
                  <FlagBadge label="Insurance Candidate" active={a.insurance_candidate} variant="success" />
                  <FlagBadge label="PG Candidate" active={a.pg_candidate} variant="success" />
                </div>
                {missingFields.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle size={11} className="text-amber-500" />
                      <span className="text-[10px] font-semibold text-amber-700">Missing Fields</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {missingFields.map((f, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {f.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(missingFields.length > 3 || a.parsing_confidence === "low") && (
                  <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                    <AlertTriangle size={10} /> Manual review recommended
                  </p>
                )}
              </div>

              {/* D. Raw Extraction */}
              {snippets.length > 0 && (
                <div className="border rounded-lg p-3">
                  <button
                    onClick={() => setSnippetsExpanded(!snippetsExpanded)}
                    className="flex items-center gap-1 w-full text-left"
                  >
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                      Extracted Snippets ({snippets.length})
                    </p>
                    {snippetsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {snippetsExpanded && (
                    <div className="mt-2 space-y-1">
                      {snippets.map((s, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground bg-muted rounded px-2 py-1">"{s}"</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {a.raw_text && a.raw_text.length > 50 && (
                <div className="border rounded-lg p-3">
                  <button
                    onClick={() => setRawExpanded(!rawExpanded)}
                    className="flex items-center gap-1 w-full text-left"
                  >
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                      Raw Text
                    </p>
                    {rawExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {rawExpanded && (
                    <pre className="mt-2 text-[10px] text-muted-foreground bg-muted rounded p-2 max-h-40 overflow-auto whitespace-pre-wrap">
                      {a.raw_text}
                    </pre>
                  )}
                </div>
              )}

              <p className="text-[9px] text-muted-foreground text-center">
                Analyzed {new Date(a.updated_at).toLocaleString()}
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
