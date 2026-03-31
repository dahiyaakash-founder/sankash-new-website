/**
 * Lead activity service — comprehensive activity logging.
 */
import { supabase } from "@/integrations/supabase/client";

export interface LeadActivityEntry {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
  performed_by: string | null;
  created_at: string;
}

/** Log a lead activity */
export async function logActivity(
  leadId: string,
  activityType: string,
  description: string,
  opts?: { oldValue?: string; newValue?: string; performedBy?: string | null }
) {
  await supabase.from("lead_activity" as any).insert({
    lead_id: leadId,
    activity_type: activityType,
    description,
    old_value: opts?.oldValue ?? null,
    new_value: opts?.newValue ?? null,
    performed_by: opts?.performedBy ?? null,
  } as any);
}

/** Fetch all activity for a lead */
export async function fetchLeadActivity(leadId: string): Promise<LeadActivityEntry[]> {
  const { data, error } = await supabase
    .from("lead_activity" as any)
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LeadActivityEntry[];
}

/** Log lead creation */
export async function logLeadCreated(leadId: string, sourcePage?: string) {
  await logActivity(leadId, "lead_created", `Lead created from ${sourcePage ?? "website"}`);
}
