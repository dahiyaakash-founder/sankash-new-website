/**
 * Lead import service — parsing, validation, duplicate detection, and DB insert.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import * as XLSX from "xlsx";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];

// ── Column definitions ──

export const TEMPLATE_HEADERS = [
  "full_name", "mobile", "email", "company", "city", "audience",
  "source_type", "source_detail", "source_page", "destination", "trip_type",
  "quote_amount", "website", "message", "notes", "status", "priority",
  "owner_email", "next_follow_up", "import_batch_name", "uploaded_by",
] as const;

export type TemplateHeader = typeof TEMPLATE_HEADERS[number];

/** Maps template column → DB column */
const COL_TO_DB: Record<string, string> = {
  full_name: "full_name",
  mobile: "mobile_number",
  email: "email",
  company: "company_name",
  city: "city",
  audience: "audience_type",
  source_type: "lead_source_type",
  source_detail: "lead_source_page",
  source_page: "lead_source_page",
  destination: "destination_type",
  trip_type: "detected_trip_type",
  quote_amount: "quote_amount",
  website: "website_url",
  message: "message",
  notes: "notes",
  status: "status",
  priority: "priority",
  next_follow_up: "next_follow_up_at",
  owner_email: "__owner_email",       // resolved at import time
  import_batch_name: "__batch_name",   // metadata, not a lead column
  uploaded_by: "__uploaded_by",        // metadata
};

/** Alias mapping: common header variants → canonical name */
const HEADER_ALIASES: Record<string, string> = {
  name: "full_name", "full name": "full_name", fullname: "full_name",
  phone: "mobile", mobile_number: "mobile", "phone number": "mobile", "mobile number": "mobile",
  "email address": "email", "e-mail": "email",
  "company name": "company", company_name: "company", organisation: "company", organization: "company",
  audience_type: "audience", "audience type": "audience",
  lead_source_type: "source_type", "source type": "source_type", source: "source_type",
  "lead source": "source_type", lead_source: "source_type",
  "source page": "source_page", lead_source_page: "source_page",
  "source detail": "source_detail",
  destination_type: "destination", "destination type": "destination",
  "trip type": "trip_type", detected_trip_type: "trip_type",
  "quote amount": "quote_amount",
  website_url: "website", "website url": "website",
  "follow up": "next_follow_up", next_follow_up_at: "next_follow_up", "next follow up": "next_follow_up",
  "batch name": "import_batch_name", batch_name: "import_batch_name",
  "uploaded by": "uploaded_by",
  "owner email": "owner_email", assigned_to: "owner_email",
};

// ── Valid values ──

export const VALID_AUDIENCES = ["traveler", "agent", "developer", "partner", "other"] as const;
export const VALID_SOURCES = [
  "excel_import", "manual_entry", "offline_calling", "whatsapp_inbound",
  "referral", "existing_partner", "event_lead", "contact_form",
  "demo_request", "sandbox_access_request", "production_access_request",
  "traveler_quote_unlock", "agent_quote_review", "itinerary_upload", "integration_query",
  "support_request",
] as const;
export const VALID_STATUSES = [
  "new", "contacted", "qualified", "demo_scheduled", "sandbox_issued",
  "production_review", "waiting_for_customer", "converted", "closed_lost",
] as const;
export const VALID_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const VALID_TRIP_TYPES = ["domestic", "international", "unknown"] as const;

// ── Parsing ──

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
}

export function parseFile(file: File): Promise<ParsedSheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (raw.length < 2) return reject(new Error("File must have a header row and at least one data row"));
        const headers = raw[0].map((h) => String(h).trim());
        const rows = raw.slice(1).filter((r) => r.some((c) => String(c).trim())).map((r) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = String(r[i] ?? "").trim(); });
          return obj;
        });
        resolve({ headers, rows, fileName: file.name });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/** Auto-detect mapping from file headers to template headers */
export function autoMapHeaders(fileHeaders: string[]): Record<string, TemplateHeader | ""> {
  const mapping: Record<string, TemplateHeader | ""> = {};
  for (const fh of fileHeaders) {
    const lower = fh.toLowerCase().trim();
    // exact match
    if ((TEMPLATE_HEADERS as readonly string[]).includes(lower)) {
      mapping[fh] = lower as TemplateHeader;
      continue;
    }
    // alias match
    if (HEADER_ALIASES[lower]) {
      mapping[fh] = HEADER_ALIASES[lower] as TemplateHeader;
      continue;
    }
    mapping[fh] = "";
  }
  return mapping;
}

// ── Validation ──

export interface ImportDefaults {
  audience?: string;
  source_type?: string;
  owner_id?: string;
  priority?: string;
  status?: string;
  next_follow_up?: string;
}

export interface ValidatedRow {
  rowIndex: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: Record<string, string>;
  leadInsert?: LeadInsert;
  duplicateOf?: string; // existing lead id if duplicate
}

export function validateRows(
  rows: Record<string, string>[],
  mapping: Record<string, TemplateHeader | "">,
  defaults: ImportDefaults,
  teamEmailMap: Record<string, string>, // email → user_id
): ValidatedRow[] {
  return rows.map((row, idx) => {
    const mapped: Record<string, string> = {};
    for (const [fileCol, templateCol] of Object.entries(mapping)) {
      if (templateCol) mapped[templateCol] = row[fileCol] ?? "";
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const fullName = mapped.full_name?.trim();
    const mobile = mapped.mobile?.trim();
    const email = mapped.email?.trim();

    if (!fullName) errors.push("full_name is required");
    if (!mobile && !email) errors.push("At least one of mobile or email is required");

    // Validate enums
    const audience = (mapped.audience?.toLowerCase() || defaults.audience || "").trim();
    if (audience && !(VALID_AUDIENCES as readonly string[]).includes(audience)) {
      warnings.push(`Invalid audience "${audience}", will use default`);
    }

    const sourceType = (mapped.source_type?.toLowerCase() || defaults.source_type || "excel_import").trim();
    if (!(VALID_SOURCES as readonly string[]).includes(sourceType)) {
      warnings.push(`Invalid source_type "${sourceType}", will use excel_import`);
    }

    const status = (mapped.status?.toLowerCase() || defaults.status || "new").trim();
    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      warnings.push(`Invalid status "${status}", will use "new"`);
    }

    const priority = (mapped.priority?.toLowerCase() || defaults.priority || "medium").trim();
    if (!(VALID_PRIORITIES as readonly string[]).includes(priority)) {
      warnings.push(`Invalid priority "${priority}", will use "medium"`);
    }

    // Resolve owner
    let ownerId: string | null = null;
    const ownerEmail = mapped.owner_email?.trim();
    if (ownerEmail) {
      ownerId = teamEmailMap[ownerEmail.toLowerCase()] ?? null;
      if (!ownerId) warnings.push(`owner_email "${ownerEmail}" not found in team, will be unassigned`);
    } else if (defaults.owner_id) {
      ownerId = defaults.owner_id;
    }

    // Follow-up date
    let nextFollowUp: string | null = null;
    const followUpRaw = mapped.next_follow_up?.trim() || defaults.next_follow_up || "";
    if (followUpRaw) {
      const d = new Date(followUpRaw);
      if (isNaN(d.getTime())) {
        warnings.push(`Invalid next_follow_up date "${followUpRaw}"`);
      } else {
        nextFollowUp = d.toISOString();
      }
    }

    const quoteAmt = mapped.quote_amount ? parseFloat(mapped.quote_amount) : null;

    const leadInsert: LeadInsert = {
      full_name: fullName || "Unknown",
      mobile_number: mobile || null,
      email: email || null,
      company_name: mapped.company?.trim() || null,
      city: mapped.city?.trim() || null,
      audience_type: (VALID_AUDIENCES as readonly string[]).includes(audience) ? audience as any : (defaults.audience as any) || null,
      lead_source_type: (VALID_SOURCES as readonly string[]).includes(sourceType) ? sourceType as any : "excel_import" as any,
      lead_source_page: mapped.source_detail?.trim() || mapped.source_page?.trim() || null,
      destination_type: mapped.destination?.trim() || null,
      detected_trip_type: mapped.trip_type?.toLowerCase().trim() || "unknown",
      quote_amount: quoteAmt,
      website_url: mapped.website?.trim() || null,
      message: mapped.message?.trim() || null,
      notes: mapped.notes?.trim() || null,
      status: (VALID_STATUSES as readonly string[]).includes(status) ? status as any : "new" as any,
      priority: (VALID_PRIORITIES as readonly string[]).includes(priority) ? priority as any : "medium" as any,
      assigned_to: ownerId,
      next_follow_up_at: nextFollowUp,
    };

    return {
      rowIndex: idx + 2, // 1-indexed + header
      valid: errors.length === 0,
      errors,
      warnings,
      data: mapped,
      leadInsert: errors.length === 0 ? leadInsert : undefined,
    };
  });
}

// ── Duplicate detection ──

export type DuplicateAction = "skip" | "import_new" | "update";

export async function detectDuplicates(validatedRows: ValidatedRow[]): Promise<ValidatedRow[]> {
  // Fetch existing mobiles and emails for comparison
  const mobiles = validatedRows.map(r => r.leadInsert?.mobile_number).filter(Boolean) as string[];
  const emails = validatedRows.map(r => r.leadInsert?.email).filter(Boolean) as string[];

  const mobileMap = new Map<string, string>();
  const emailMap = new Map<string, string>();

  if (mobiles.length > 0) {
    const { data } = await supabase.from("leads").select("id, mobile_number").in("mobile_number", mobiles);
    (data ?? []).forEach((l: any) => { if (l.mobile_number) mobileMap.set(l.mobile_number, l.id); });
  }
  if (emails.length > 0) {
    const { data } = await supabase.from("leads").select("id, email").in("email", emails);
    (data ?? []).forEach((l: any) => { if (l.email) emailMap.set(l.email.toLowerCase(), l.id); });
  }

  return validatedRows.map(row => {
    if (!row.leadInsert) return row;
    const mob = row.leadInsert.mobile_number;
    const em = row.leadInsert.email;
    const dupId = (mob && mobileMap.get(mob)) || (em && emailMap.get(em.toLowerCase())) || undefined;
    if (dupId) {
      return { ...row, duplicateOf: dupId, warnings: [...row.warnings, `Duplicate of existing lead`] };
    }
    return row;
  });
}

// ── Import execution ──

export interface ImportResult {
  batchId: string;
  totalRows: number;
  validRows: number;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  duplicateRows: number;
  failedRows: number;
  failedDetails: { row: number; errors: string[] }[];
}

export async function executeImport(
  rows: ValidatedRow[],
  duplicateAction: DuplicateAction,
  fileName: string,
  batchName: string,
  userId: string,
): Promise<ImportResult> {
  const batchId = crypto.randomUUID();
  let imported = 0, updated = 0, skipped = 0, duplicates = 0, failed = 0;
  const failedDetails: { row: number; errors: string[] }[] = [];
  const validRows = rows.filter(r => r.valid);

  for (const row of rows) {
    if (!row.valid || !row.leadInsert) {
      failed++;
      failedDetails.push({ row: row.rowIndex, errors: row.errors });
      continue;
    }

    if (row.duplicateOf) {
      duplicates++;
      if (duplicateAction === "skip") {
        skipped++;
        continue;
      }
      if (duplicateAction === "update") {
        const { id, ...updates } = row.leadInsert as any;
        const { error } = await supabase.from("leads").update({ ...updates, import_batch_id: batchId }).eq("id", row.duplicateOf);
        if (error) {
          failed++;
          failedDetails.push({ row: row.rowIndex, errors: [error.message] });
        } else {
          updated++;
        }
        continue;
      }
      // import_new — fall through to insert
    }

    const leadId = crypto.randomUUID();
    const { error } = await supabase.from("leads").insert({
      ...row.leadInsert,
      id: leadId,
      import_batch_id: batchId,
    });
    if (error) {
      failed++;
      failedDetails.push({ row: row.rowIndex, errors: [error.message] });
    } else {
      imported++;
    }
  }

  // Record batch
  await supabase.from("import_batches").insert({
    id: batchId,
    imported_by: userId,
    file_name: fileName,
    batch_name: batchName || null,
    total_rows: rows.length,
    valid_rows: validRows.length,
    imported_rows: imported,
    updated_rows: updated,
    skipped_rows: skipped,
    duplicate_rows: duplicates,
    failed_rows: failed,
    failed_details: failedDetails as any,
    duplicate_action: duplicateAction,
  });

  return {
    batchId,
    totalRows: rows.length,
    validRows: validRows.length,
    importedRows: imported,
    updatedRows: updated,
    skippedRows: skipped,
    duplicateRows: duplicates,
    failedRows: failed,
    failedDetails,
  };
}

// ── Template generation ──

export function downloadTemplate(format: "xlsx" | "csv" = "xlsx") {
  const wb = XLSX.utils.book_new();

  // Data sheet with example rows
  const exampleRows = [
    ["Raj Sharma", "9876543210", "raj@example.com", "Wanderlust Travels", "Mumbai", "agent", "referral", "Partner meetup Jan", "", "International", "International", "250000", "www.wanderlust.com", "Interested in SanKash PG integration", "Met at travel expo", "new", "high", "", "2026-04-15", "", ""],
    ["Priya Patel", "8765432109", "priya@gmail.com", "", "Delhi", "traveler", "whatsapp_inbound", "WhatsApp enquiry", "", "Goa", "Domestic", "45000", "", "Want EMI for Goa trip", "", "new", "medium", "", "", "", ""],
    ["TravelCo India", "", "info@travelco.in", "TravelCo India Pvt Ltd", "Bangalore", "partner", "event_lead", "TTF Bangalore 2026", "", "", "Unknown", "", "www.travelco.in", "Interested in white-label integration", "Follow up after TTF", "contacted", "high", "", "2026-04-20", "March Expo Import", ""],
  ];

  const dataSheet = XLSX.utils.aoa_to_sheet([[...TEMPLATE_HEADERS], ...exampleRows]);

  // Set column widths
  dataSheet["!cols"] = TEMPLATE_HEADERS.map((h) => ({ wch: Math.max(h.length + 2, 14) }));

  XLSX.utils.book_append_sheet(wb, dataSheet, "Leads");

  // Instructions sheet
  const instructions = [
    ["SanKash CRM Lead Import — Instructions"],
    [],
    ["MANDATORY FIELDS"],
    ["full_name", "Required. Full name of the lead contact."],
    ["mobile OR email", "At least one is required. Both can be provided."],
    [],
    ["OPTIONAL FIELDS"],
    ["company", "Company or agency name"],
    ["city", "City of the lead"],
    ["audience", "Accepted: traveler, agent, developer, partner, other"],
    ["source_type", "Accepted: excel_import, manual_entry, offline_calling, whatsapp_inbound, referral, existing_partner, event_lead, contact_form, demo_request, sandbox_access_request, production_access_request, traveler_quote_unlock, agent_quote_review, itinerary_upload, integration_query"],
    ["source_detail", "Free text — describe where the lead came from (e.g. 'TTF Bangalore booth')"],
    ["source_page", "URL or page reference if applicable"],
    ["destination", "Travel destination if known"],
    ["trip_type", "Accepted: Domestic, International, Unknown"],
    ["quote_amount", "Numeric value (e.g. 150000)"],
    ["website", "Lead's website URL"],
    ["message", "Lead's message or enquiry text"],
    ["notes", "Internal notes about the lead"],
    ["status", "Accepted: new, contacted, qualified, demo_scheduled, sandbox_issued, production_review, waiting_for_customer, converted, closed_lost"],
    ["priority", "Accepted: low, medium, high, urgent"],
    ["owner_email", "Email of the team member to assign. Must match an active ops team member. Leave blank for unassigned."],
    ["next_follow_up", "Date format: YYYY-MM-DD (e.g. 2026-04-15)"],
    ["import_batch_name", "Optional label for this import batch (e.g. 'March Expo Leads')"],
    ["uploaded_by", "Optional — name of the person who collected these leads offline"],
    [],
    ["DUPLICATE DETECTION"],
    ["", "Duplicates are detected by mobile number first, then email address."],
    ["", "During import you can choose to: Skip duplicates, Import all as new, or Update existing records."],
    [],
    ["BLANK CELLS"],
    ["", "Blank optional fields will use default values set during import, or remain empty."],
    ["", "If status is blank, defaults to 'new'. If priority is blank, defaults to 'medium'."],
    [],
    ["TIPS"],
    ["", "Delete the example rows before importing your data."],
    ["", "Do not rename or reorder columns — the importer uses header names to map fields."],
    ["", "You can add extra columns — they will be ignored during import."],
  ];
  const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
  instrSheet["!cols"] = [{ wch: 22 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, instrSheet, "Instructions");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(dataSheet);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sankash-lead-import-template.csv"; a.click();
    URL.revokeObjectURL(url);
  } else {
    XLSX.writeFile(wb, "sankash-lead-import-template.xlsx");
  }
}

/** Generate error report CSV for failed rows */
export function downloadErrorReport(failedDetails: { row: number; errors: string[] }[]) {
  const wb = XLSX.utils.book_new();
  const data = [
    ["Row Number", "Errors"],
    ...failedDetails.map(f => [f.row, f.errors.join("; ")]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 12 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, ws, "Failed Rows");
  XLSX.writeFile(wb, "import-errors.xlsx");
}
