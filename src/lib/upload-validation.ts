// ── Accepted types & limits ────────────────────────────────────────
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MIN_FILE_SIZE = 512; // 0.5 KB — anything smaller is likely empty

// ── Travel-content keyword signals ─────────────────────────────────
// Strong travel signals
const STRONG_TRAVEL_SIGNALS = [
  // destinations / geography
  "goa", "kerala", "manali", "shimla", "dubai", "thailand", "bali",
  "maldives", "singapore", "europe", "kashmir", "rajasthan", "andaman",
  "mauritius", "sri lanka", "vietnam", "japan", "london", "paris",
  "destination", "country", "city",
  // travel document types
  "itinerary", "booking summary", "holiday package", "tour package",
  "travel quote", "travel quotation", "holiday quotation",
  // travel concepts
  "flight", "hotel", "resort", "cruise", "airline", "airport",
  "sightseeing", "transfer", "accommodation", "room",
  // schedule
  "departure", "arrival", "check-in", "checkout",
  // people
  "traveller", "traveler", "passenger", "pax",
  // duration
  "nights", "days", "duration",
  // trip types
  "honeymoon", "pilgrimage", "group tour", "family trip",
  // broader travel terms
  "holiday", "tour", "trip", "travel", "package", "vacation",
  "excursion", "safari", "trek", "backpacking",
];

// Commercial / booking signals
const COMMERCIAL_SIGNALS = [
  "total amount", "package cost", "fare", "quotation",
  "booking amount", "package price", "trip cost",
  "per person", "twin sharing", "child with bed", "child without bed",
  "inr", "₹", "usd", "package value",
  "inclusions", "exclusions", "package includes",
  "cost per", "net rate", "gross rate", "selling price",
  "price", "cost", "amount", "rate", "budget",
];

// Generic words that should NOT trigger a pass on their own
const NON_TRAVEL_REJECTION_SIGNALS = [
  "refrigerator", "washing machine", "air conditioner", "microwave",
  "television", "laptop", "mobile phone", "smartphone", "tablet",
  "electronics", "appliance", "gadget", "warranty card",
  "warehouse", "shipment tracking", "dispatch", "consignment",
  "export invoice", "purchase order", "goods receipt",
  "gst invoice", "tax invoice", "proforma invoice",
  "hsn code", "sac code", "igst", "cgst", "sgst",
  "product invoice", "service invoice", "vendor invoice",
  "bill of materials", "packing list", "delivery challan",
];

// ── Error types ────────────────────────────────────────────────────
export type ValidationErrorType = "unsupported" | "too-large" | "unreadable" | "not-travel";

export type TravelConfidence = "invalid" | "medium" | "high";

export interface ValidationResult {
  valid: boolean;
  errorType?: ValidationErrorType;
  errorTitle?: string;
  errorBody?: string;
}

export interface TravelConfidenceResult {
  confidence: TravelConfidence;
  travelCount: number;
  commercialCount: number;
}

// ── Validate file (type + size) ────────────────────────────────────
export function validateFile(file: File): ValidationResult {
  const ext = file.name.toLowerCase().match(/\.[a-z]+$/)?.[0] ?? "";

  if (!ACCEPTED_MIME_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      errorType: "unsupported",
      errorTitle: "Unsupported file type",
      errorBody:
        "Upload a PDF, JPG, PNG, or DOC file containing your holiday quote, itinerary, or booking summary.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      errorType: "too-large",
      errorTitle: "File is too large",
      errorBody: "Please upload a file under 10 MB.",
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      valid: false,
      errorType: "unreadable",
      errorTitle: "We could not read travel details from this file",
      errorBody:
        "Please upload a clearer PDF or image with trip details such as destination, dates, traveller count, or package pricing.",
    };
  }

  return { valid: true };
}

// ── Assess travel confidence (3-state) ─────────────────────────────
export function assessTravelConfidence(fileName: string): TravelConfidenceResult {
  const lower = fileName.toLowerCase().replace(/[-_]/g, " ");

  // Check for explicit non-travel rejection signals
  const hasRejection = NON_TRAVEL_REJECTION_SIGNALS.some((kw) => lower.includes(kw));
  if (hasRejection) {
    // Only allow if there are also very strong travel signals
    const strongCount = STRONG_TRAVEL_SIGNALS.filter((kw) => lower.includes(kw)).length;
    if (strongCount < 2) {
      return { confidence: "invalid", travelCount: strongCount, commercialCount: 0 };
    }
  }

  // Count signals
  const travelCount = STRONG_TRAVEL_SIGNALS.filter((kw) => lower.includes(kw)).length;
  const commercialCount = COMMERCIAL_SIGNALS.filter((kw) => lower.includes(kw)).length;

  // HIGH: 2+ travel signals AND 1+ commercial, OR 3+ travel signals
  if ((travelCount >= 2 && commercialCount >= 1) || travelCount >= 3) {
    return { confidence: "high", travelCount, commercialCount };
  }

  // MEDIUM: at least 1 travel signal (destination, itinerary, package, holiday, etc.)
  if (travelCount >= 1) {
    return { confidence: "medium", travelCount, commercialCount };
  }

  // MEDIUM: commercial signal alone with travel-like extension/context
  if (commercialCount >= 1) {
    return { confidence: "medium", travelCount, commercialCount };
  }

  // INVALID: no travel or commercial signals at all
  return { confidence: "invalid", travelCount, commercialCount };
}

// ── Legacy helper (kept for backward compat) ───────────────────────
export function hasLikelyTravelContent(fileName: string): boolean {
  return assessTravelConfidence(fileName).confidence !== "invalid";
}

// ── Sample accepted files list ─────────────────────────────────────
export const sampleAcceptedFiles = [
  "Holiday package quotation",
  "Travel itinerary PDF",
  "Booking summary or confirmation",
  "Flight + hotel package screenshot",
  "Travel agent quote with destination, dates, and total price",
];
