import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { LeadRow } from "@/lib/leads-service";

const REASONS = [
  { value: "duplicate", label: "Duplicate lead" },
  { value: "test", label: "Test / QA record" },
  { value: "internal", label: "Internal team submission" },
  { value: "other", label: "Other" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  leads: LeadRow[];
  userId: string;
  onDeleted: () => void;
}

export default function DeleteLeadsModal({ open, onClose, leads, userId, onDeleted }: Props) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!reason) { toast.error("Please select a reason"); return; }
    setDeleting(true);
    try {
      const ids = leads.map(l => l.id);

      // 1. Log each deletion with snapshot
      for (const lead of leads) {
        await supabase.from("lead_deletions" as any).insert({
          lead_id: lead.id,
          lead_snapshot: lead as any,
          deletion_reason: reason,
          notes: notes || null,
          deleted_by: userId,
        } as any);
      }

      // 2. Delete related records first
      for (const table of ["lead_activity", "lead_status_history", "lead_notes", "itinerary_analysis", "lead_attachments"] as const) {
        await supabase.from(table).delete().in("lead_id", ids);
      }

      // 3. Delete leads
      const { error } = await supabase.from("leads").delete().in("id", ids);
      if (error) throw error;

      toast.success(`${leads.length} lead${leads.length > 1 ? "s" : ""} deleted`);
      setReason("");
      setNotes("");
      onClose();
      onDeleted();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete leads");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 size={18} /> Delete {leads.length} lead{leads.length > 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            {leads.length <= 5 ? (
              <ul className="list-disc pl-4 space-y-0.5">
                {leads.map(l => <li key={l.id}>{l.full_name} {l.email ? `(${l.email})` : ""}</li>)}
              </ul>
            ) : (
              <p>{leads.length} leads selected for deletion.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Reason for deletion *</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Additional notes (optional)</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context…"
              rows={2}
            />
          </div>

          <p className="text-xs text-destructive/80">This action cannot be undone. A snapshot of the deleted leads will be saved for audit.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting || !reason}>
            {deleting && <Loader2 size={14} className="animate-spin mr-1.5" />}
            Delete {leads.length > 1 ? `${leads.length} leads` : "lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
