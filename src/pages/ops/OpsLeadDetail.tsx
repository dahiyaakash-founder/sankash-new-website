import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import OpsLayout from "@/components/ops/OpsLayout";
import {
  fetchLead, updateLead, fetchLeadNotes, addLeadNote, fetchLeadHistory, addStatusHistory,
  type LeadRow, type LeadStatus, type LeadNote, type LeadStatusHistoryEntry, type LeadPriority,
} from "@/lib/leads-service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, ArrowLeft, ExternalLink, FileText, Clock, MessageSquare, History, Send,
  Phone, Mail, MessageCircle, Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "waiting_for_customer", label: "Waiting for customer" },
  { value: "demo_scheduled", label: "Demo scheduled" },
  { value: "sandbox_issued", label: "Sandbox issued" },
  { value: "production_review", label: "Production review" },
  { value: "converted", label: "Converted" },
  { value: "closed_lost", label: "Closed lost" },
];

const OUTCOME_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const PRIORITY_OPTIONS: { value: LeadPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  waiting_for_customer: "bg-orange-100 text-orange-800",
  demo_scheduled: "bg-purple-100 text-purple-800",
  sandbox_issued: "bg-violet-100 text-violet-800",
  production_review: "bg-indigo-100 text-indigo-800",
  converted: "bg-emerald-100 text-emerald-800",
  closed_lost: "bg-red-100 text-red-800",
};

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
};

const OpsLeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  const [leadNotes, setLeadNotes] = useState<LeadNote[]>([]);
  const [history, setHistory] = useState<LeadStatusHistoryEntry[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "history">("notes");

  const loadLead = useCallback(async () => {
    if (!id) return;
    try {
      const l = await fetchLead(id);
      setLead(l);
      setStatus(l.status);
      setOutcome(l.outcome);
      setPriority(l.priority ?? "medium");
      setNotes(l.notes ?? "");
      setFollowUp(l.next_follow_up_at ? l.next_follow_up_at.split("T")[0] : "");
    } catch { /* handle */ }
    setLoading(false);
  }, [id]);

  const loadNotesAndHistory = useCallback(async () => {
    if (!id) return;
    try {
      const [n, h] = await Promise.all([fetchLeadNotes(id), fetchLeadHistory(id)]);
      setLeadNotes(n);
      setHistory(h);
    } catch { /* fail silently */ }
  }, [id]);

  useEffect(() => { loadLead(); loadNotesAndHistory(); }, [loadLead, loadNotesAndHistory]);

  const handleSave = async () => {
    if (!id || !lead) return;
    setSaving(true);
    try {
      if (status !== lead.status && user) {
        await addStatusHistory(id, lead.status, status, user.id);
      }
      if (priority !== (lead.priority ?? "medium") && user) {
        await addStatusHistory(id, `priority:${lead.priority ?? "medium"}`, `priority:${priority}`, user.id);
      }

      const updates: any = {
        status: status as LeadStatus,
        outcome: outcome as "open" | "won" | "lost",
        priority,
        notes,
        next_follow_up_at: followUp ? new Date(followUp).toISOString() : null,
      };

      if (status === "converted" || outcome === "won" || status === "closed_lost" || outcome === "lost") {
        updates.closed_at = new Date().toISOString();
      }
      if (status === "contacted" && lead.status === "new") {
        updates.last_contacted_at = new Date().toISOString();
      }

      const updated = await updateLead(id, updates);
      setLead(updated as LeadRow);
      toast.success("Lead updated");
      loadNotesAndHistory();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update");
    }
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!id || !user || !newNote.trim()) return;
    setAddingNote(true);
    try {
      await addLeadNote(id, newNote.trim(), user.id);
      setNewNote("");
      await loadNotesAndHistory();
      toast.success("Note added");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to add note");
    }
    setAddingNote(false);
  };

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;
  if (!lead) return <OpsLayout><div className="py-20 text-center text-muted-foreground">Lead not found</div></OpsLayout>;

  const meta = lead.metadata_json && typeof lead.metadata_json === "object" && Object.keys(lead.metadata_json as object).length > 0
    ? lead.metadata_json as Record<string, any>
    : null;

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/ops/leads">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><ArrowLeft size={14} /> Back</Button>
          </Link>
          <h1 className="text-lg font-heading font-bold">{lead.full_name}</h1>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[lead.status] ?? "bg-muted text-muted-foreground"}`}>
            {lead.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          {lead.mobile_number && (
            <>
              <a href={`tel:${lead.mobile_number}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Phone size={13} /> Call</Button>
              </a>
              <a href={`https://wa.me/${lead.mobile_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs"><MessageCircle size={13} /> WhatsApp</Button>
              </a>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(lead.mobile_number!, "Phone")}>
                <Copy size={13} /> Copy phone
              </Button>
            </>
          )}
          {lead.email && (
            <>
              <a href={`mailto:${lead.email}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Mail size={13} /> Email</Button>
              </a>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => copyToClipboard(lead.email!, "Email")}>
                <Copy size={13} /> Copy email
              </Button>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {/* A. Contact */}
            <div className="border rounded-xl bg-card p-5 space-y-3">
              <h2 className="text-sm font-heading font-semibold">Contact</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Full name", value: lead.full_name },
                  { label: "Mobile", value: lead.mobile_number },
                  { label: "Email", value: lead.email },
                  { label: "Company", value: lead.company_name },
                  { label: "City", value: lead.city },
                  { label: "Website", value: lead.website_url },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-xs font-medium text-right">{r.value ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* B. Lead context */}
            <div className="border rounded-xl bg-card p-5 space-y-3">
              <h2 className="text-sm font-heading font-semibold">Lead context</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Source type", value: lead.lead_source_type?.replace(/_/g, " ") },
                  { label: "Source page", value: lead.lead_source_page },
                  { label: "Audience", value: lead.audience_type },
                  { label: "Destination", value: lead.destination_type },
                  { label: "Trip type", value: lead.detected_trip_type },
                  { label: "Quote amount", value: lead.quote_amount ? `₹${Number(lead.quote_amount).toLocaleString()}` : null },
                  { label: "EMI flag", value: lead.emi_flag ? "Yes" : "No" },
                  { label: "Insurance flag", value: lead.insurance_flag ? "Yes" : "No" },
                  { label: "PG flag", value: lead.pg_flag ? "Yes" : "No" },
                  { label: "Validation status", value: lead.quote_validation_status },
                  { label: "Created", value: format(new Date(lead.created_at), "dd MMM yyyy, HH:mm") },
                  { label: "Updated", value: format(new Date(lead.updated_at), "dd MMM yyyy, HH:mm") },
                  { label: "Last contacted", value: lead.last_contacted_at ? format(new Date(lead.last_contacted_at), "dd MMM yyyy") : null },
                  { label: "Closed at", value: lead.closed_at ? format(new Date(lead.closed_at), "dd MMM yyyy") : null },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-xs font-medium text-right capitalize">{r.value ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            {lead.message && (
              <div className="border rounded-xl bg-card p-5 space-y-2">
                <h2 className="text-sm font-heading font-semibold">Message</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.message}</p>
              </div>
            )}

            {/* C. Uploaded file */}
            {lead.quote_file_url && (
              <div className="border rounded-xl bg-card p-5 space-y-2">
                <h2 className="text-sm font-heading font-semibold">Uploaded file</h2>
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.quote_file_name ?? "Attachment"}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      Source: {lead.lead_source_type?.replace(/_/g, " ") ?? "Unknown"}
                    </p>
                  </div>
                  <a href={lead.quote_file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <ExternalLink size={12} /> Open file
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Metadata */}
            {meta && (
              <div className="border rounded-xl bg-card p-5 space-y-2">
                <button
                  onClick={() => setMetadataExpanded(!metadataExpanded)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <h2 className="text-sm font-heading font-semibold flex-1">Parsed metadata</h2>
                  {metadataExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {!metadataExpanded && (
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                    {Object.entries(meta).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-0.5">
                        <span className="text-[10px] text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-medium text-right truncate max-w-[140px]">{String(v)}</span>
                      </div>
                    ))}
                    {Object.keys(meta).length > 6 && (
                      <p className="text-[10px] text-muted-foreground">+{Object.keys(meta).length - 6} more fields</p>
                    )}
                  </div>
                )}
                {metadataExpanded && (
                  <pre className="text-xs text-muted-foreground bg-muted rounded-lg p-3 overflow-auto max-h-60">
                    {JSON.stringify(meta, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Notes & History */}
            <div className="border rounded-xl bg-card overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === "notes" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <MessageSquare size={13} /> Notes ({leadNotes.length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${activeTab === "history" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <History size={13} /> Activity ({history.length})
                </button>
              </div>
              <div className="p-4">
                {activeTab === "notes" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add an internal note…"
                        rows={2}
                        className="text-sm flex-1 min-h-[60px]"
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()} className="self-end gap-1">
                        {addingNote ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      </Button>
                    </div>
                    {leadNotes.length === 0 && <p className="text-xs text-muted-foreground py-2">No notes yet</p>}
                    {leadNotes.map((note) => (
                      <div key={note.id} className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {note.created_by.slice(0, 8)}… · {format(new Date(note.created_at), "dd MMM yyyy, HH:mm")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "history" && (
                  <div className="space-y-2">
                    {history.length === 0 && <p className="text-xs text-muted-foreground py-2">No activity recorded</p>}
                    {history.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                        <Clock size={12} className="text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs">
                            <span className={`font-semibold px-1.5 py-0.5 rounded ${statusColors[entry.old_status ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                              {entry.old_status?.replace(/_/g, " ") ?? "—"}
                            </span>
                            <span className="mx-1.5 text-muted-foreground">→</span>
                            <span className={`font-semibold px-1.5 py-0.5 rounded ${statusColors[entry.new_status] ?? "bg-muted text-muted-foreground"}`}>
                              {entry.new_status.replace(/_/g, " ")}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(entry.changed_at), "dd MMM, HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action panel */}
          <div className="space-y-4">
            <div className="border rounded-xl bg-card p-5 space-y-4">
              <h2 className="text-sm font-heading font-semibold">Update lead</h2>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Outcome</label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OUTCOME_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Next follow-up</label>
                <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Quick summary</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="text-sm" placeholder="Quick summary…" />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                Save changes
              </Button>
            </div>

            {/* Source & follow-up card */}
            <div className="border rounded-xl bg-card p-4 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Source</p>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full capitalize">
                {lead.lead_source_type?.replace(/_/g, " ") ?? "—"}
              </span>
              {lead.next_follow_up_at && (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Follow-up</p>
                  <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className={new Date(lead.next_follow_up_at) < new Date() ? "text-amber-500" : "text-muted-foreground"} />
                    {format(new Date(lead.next_follow_up_at), "dd MMM yyyy")}
                    {new Date(lead.next_follow_up_at) < new Date() && (
                      <span className="text-[10px] text-amber-600 font-semibold">OVERDUE</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OpsLayout>
  );
};

export default OpsLeadDetail;
