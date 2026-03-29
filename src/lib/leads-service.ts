/**
 * Leads service — handles all Supabase lead operations.
 * Used by both website forms (anon insert) and ops dashboard (authenticated CRUD).
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadStatus = Database["public"]["Enums"]["lead_status"];
type LeadSourceType = Database["public"]["Enums"]["lead_source_type"];
type AudienceType = Database["public"]["Enums"]["audience_type"];

export type { LeadRow, LeadInsert, LeadUpdate, LeadStatus, LeadSourceType, AudienceType };

/** Insert a lead from a public website form (anon) */
export async function createLead(lead: LeadInsert) {
  const { data, error } = await supabase.from("leads").insert(lead).select().single();
  if (error) throw error;
  return data;
}

/** Fetch leads with optional filters, search, sort, pagination */
export async function fetchLeads(opts: {
  search?: string;
  status?: LeadStatus;
  sourceType?: LeadSourceType;
  audience?: AudienceType;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortAsc?: boolean;
}) {
  const { search, status, sourceType, audience, page = 1, pageSize = 25, sortBy = "created_at", sortAsc = false } = opts;

  let query = supabase.from("leads").select("*", { count: "exact" });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }
  if (status) query = query.eq("status", status);
  if (sourceType) query = query.eq("lead_source_type", sourceType);
  if (audience) query = query.eq("audience_type", audience);

  query = query.order(sortBy, { ascending: sortAsc });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data as LeadRow[], count: count ?? 0 };
}

/** Update a lead */
export async function updateLead(id: string, updates: LeadUpdate) {
  const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/** Fetch a single lead by ID */
export async function fetchLead(id: string) {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) throw error;
  return data as LeadRow;
}

/** Dashboard KPIs */
export async function fetchLeadKPIs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const todayISO = today.toISOString();

  const [allRes, newTodayRes, openRes, followUpRes, sandboxRes, prodRes, convertedRes] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("leads").select("id", { count: "exact", head: true }).in("status", ["new", "contacted", "qualified", "waiting_for_customer"]),
    supabase.from("leads").select("id", { count: "exact", head: true }).not("next_follow_up_at", "is", null).lte("next_follow_up_at", new Date().toISOString()),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("lead_source_type", "sandbox_access_request"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("lead_source_type", "production_access_request"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "converted").gte("updated_at", startOfMonth),
  ]);

  return {
    total: allRes.count ?? 0,
    newToday: newTodayRes.count ?? 0,
    open: openRes.count ?? 0,
    pendingFollowUp: followUpRes.count ?? 0,
    sandbox: sandboxRes.count ?? 0,
    production: prodRes.count ?? 0,
    convertedThisMonth: convertedRes.count ?? 0,
  };
}

/** Upload a quote file to storage */
export async function uploadQuoteFile(file: File) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("quote-files").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("quote-files").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
}

/** Export leads to CSV */
export function leadsToCSV(leads: LeadRow[]): string {
  const headers = [
    "ID", "Created", "Name", "Email", "Mobile", "Company", "City",
    "Source Page", "Source Type", "Audience", "Status", "Outcome",
    "Assigned To", "Next Follow Up", "Notes", "Message",
  ];
  const rows = leads.map((l) => [
    l.id, l.created_at, l.full_name, l.email ?? "", l.mobile_number ?? "",
    l.company_name ?? "", l.city ?? "", l.lead_source_page ?? "",
    l.lead_source_type ?? "", l.audience_type ?? "", l.status, l.outcome,
    l.assigned_to ?? "", l.next_follow_up_at ?? "", l.notes ?? "", l.message ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
}
