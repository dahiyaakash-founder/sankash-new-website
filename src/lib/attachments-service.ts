/**
 * Lead attachments service — handles file uploads and attachment records.
 */
import { supabase } from "@/integrations/supabase/client";

export interface LeadAttachment {
  id: string;
  lead_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  category: string;
  uploaded_by: string | null;
  uploaded_at: string;
  parsed_text_excerpt: string | null;
}

/** Infer attachment category from file context */
function inferCategory(fileName: string, sourceType?: string): string {
  const lower = fileName.toLowerCase();
  if (sourceType?.includes("quote") || lower.includes("quote")) return "quote";
  if (sourceType?.includes("itinerary") || lower.includes("itinerary")) return "itinerary";
  if (lower.includes("screenshot") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "screenshot";
  if (lower.endsWith(".pdf")) return "document";
  return "unknown";
}

/** Upload a file to lead-attachments storage and create an attachment record */
export async function uploadLeadAttachment(
  file: File,
  leadId: string,
  options?: { sourceType?: string; uploadedBy?: string | null }
): Promise<LeadAttachment> {
  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${leadId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("lead-attachments")
    .upload(storagePath, file);
  if (uploadError) throw uploadError;

  const category = inferCategory(file.name, options?.sourceType);

  const { data, error } = await supabase
    .from("lead_attachments" as any)
    .insert({
      lead_id: leadId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      category,
      uploaded_by: options?.uploadedBy ?? null,
    } as any)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("lead_activity" as any).insert({
    lead_id: leadId,
    activity_type: "file_uploaded",
    description: `File uploaded: ${file.name}`,
    new_value: file.name,
    performed_by: options?.uploadedBy ?? null,
  } as any);

  return data as unknown as LeadAttachment;
}

/** Fetch all attachments for a lead */
export async function fetchLeadAttachments(leadId: string): Promise<LeadAttachment[]> {
  const { data, error } = await supabase
    .from("lead_attachments" as any)
    .select("*")
    .eq("lead_id", leadId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LeadAttachment[];
}

/** Get public URL for an attachment */
export function getAttachmentUrl(storagePath: string): string {
  const { data } = supabase.storage.from("lead-attachments").getPublicUrl(storagePath);
  return data.publicUrl;
}
