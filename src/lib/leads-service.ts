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
type LeadPriority = Database["public"]["Enums"]["lead_priority"];

export type { LeadRow, LeadInsert, LeadUpdate, LeadStatus, LeadSourceType, AudienceType, LeadPriority };

export interface LeadNote {
  id: string;
  lead_id: string;
  note_text: string;
  created_by: string;
  created_at: string;
}

export interface LeadStatusHistoryEntry {
  id: string;
  lead_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

export type LeadStage = "new" | "reviewed" | "contacted" | "qualified" | "follow_up_scheduled" | "in_progress" | "won" | "lost" | "archived";

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

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
  priority?: LeadPriority;
  assignedTo?: string;
  unassigned?: boolean;
  overdueFollowUp?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortAsc?: boolean;
}) {
  const { search, status, sourceType, audience, priority, assignedTo, unassigned, overdueFollowUp, page = 1, pageSize = 25, sortBy = "created_at", sortAsc = false } = opts;

  let query = supabase.from("leads").select("*", { count: "exact" });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }
  if (status) query = query.eq("status", status);
  if (sourceType) query = query.eq("lead_source_type", sourceType);
  if (audience) query = query.eq("audience_type", audience);
  if (priority) query = query.filter("priority", "eq", priority);
  if (assignedTo) query = query.eq("assigned_to", assignedTo);
  if (unassigned) query = query.is("assigned_to", null);
  if (overdueFollowUp) {
    query = query.not("next_follow_up_at", "is", null).lte("next_follow_up_at", new Date().toISOString());
  }

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

/** Fetch leads grouped by source for dashboard chart */
export async function fetchLeadsBySource() {
  const { data, error } = await supabase.from("leads").select("lead_source_type");
  if (error) throw error;
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r: any) => {
    const src = r.lead_source_type ?? "unknown";
    counts[src] = (counts[src] ?? 0) + 1;
  });
  return counts;
}

/** Fetch leads grouped by status */
export async function fetchLeadsByStatus() {
  const { data, error } = await supabase.from("leads").select("status");
  if (error) throw error;
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r: any) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  });
  return counts;
}

// ── Lead Notes ──

export async function fetchLeadNotes(leadId: string): Promise<LeadNote[]> {
  const { data, error } = await supabase
    .from("lead_notes" as any)
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LeadNote[];
}

export async function addLeadNote(leadId: string, noteText: string, userId: string): Promise<LeadNote> {
  const { data, error } = await supabase
    .from("lead_notes" as any)
    .insert({ lead_id: leadId, note_text: noteText, created_by: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as LeadNote;
}

// ── Lead Status History ──

export async function fetchLeadHistory(leadId: string): Promise<LeadStatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from("lead_status_history" as any)
    .select("*")
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LeadStatusHistoryEntry[];
}

export async function addStatusHistory(leadId: string, oldStatus: string | null, newStatus: string, userId: string) {
  const { error } = await supabase
    .from("lead_status_history" as any)
    .insert({ lead_id: leadId, old_status: oldStatus, new_status: newStatus, changed_by: userId } as any);
  if (error) throw error;
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
    "Date", "Name", "Email", "Mobile", "Company", "City",
    "Source Type", "Audience", "Status", "Priority", "Outcome",
    "Owner", "Next Follow Up",
  ];
  const rows = leads.map((l: any) => [
    l.created_at, l.full_name, l.email ?? "", l.mobile_number ?? "",
    l.company_name ?? "", l.city ?? "",
    l.lead_source_type ?? "", l.audience_type ?? "", l.status, l.priority ?? "", l.outcome,
    l.assigned_to ?? "", l.next_follow_up_at ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
}

// ── Team / User Roles ──

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("user_roles").select("*");
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

/**
 * Resolve team member emails by looking up the current user and matching IDs.
 * Since we can't query auth.users, we build a map from what's available.
 */
export function buildTeamEmailMap(members: TeamMember[], currentUserId: string | undefined, currentUserEmail: string | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  members.forEach((m) => {
    if (m.user_id === currentUserId && currentUserEmail) {
      map[m.user_id] = currentUserEmail;
    }
    // For other users, we'll show a truncated ID unless we have more info
  });
  return map;
}
