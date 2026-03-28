import { type ReactNode } from "react";

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
const TRAVEL_KEYWORDS = [
  // document types
  "itinerary", "booking", "quote", "invoice", "confirmation", "voucher",
  // travel concepts
  "travel", "flight", "hotel", "tour", "package", "trip", "holiday",
  "destination", "passenger", "traveller", "traveler", "resort", "cruise",
  "visa", "airport", "airline", "accommodation", "sightseeing", "transfer",
  // schedule
  "departure", "arrival", "return", "check-in", "checkout",
  // people
  "pax", "adult", "child", "infant",
  // duration
  "nights", "days", "duration",
  // pricing
  "total", "price", "cost", "fare", "amount", "tariff", "rate",
  // destinations (popular)
  "goa", "kerala", "manali", "shimla", "dubai", "thailand", "bali",
  "maldives", "singapore", "europe", "kashmir", "rajasthan", "andaman",
  "mauritius", "sri lanka", "vietnam", "japan", "london", "paris",
];

// ── Error types ────────────────────────────────────────────────────
export type ValidationErrorType = "unsupported" | "too-large" | "unreadable" | "not-travel";

export interface ValidationResult {
  valid: boolean;
  errorType?: ValidationErrorType;
  errorTitle?: string;
  errorBody?: string;
}

// ── Validate file ──────────────────────────────────────────────────
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

// ── Check filename for travel signals ──────────────────────────────
export function hasLikelyTravelContent(fileName: string): boolean {
  const lower = fileName.toLowerCase().replace(/[-_]/g, " ");
  return TRAVEL_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Sample accepted files list ─────────────────────────────────────
export const sampleAcceptedFiles = [
  "Holiday package quotation",
  "Travel itinerary PDF",
  "Booking summary or confirmation",
  "Flight + hotel package screenshot",
  "Travel agent quote with destination, dates, and total price",
];
