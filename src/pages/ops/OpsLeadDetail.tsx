import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import OpsLayout from "@/components/ops/OpsLayout";
import { fetchLead, updateLead, type LeadRow, type LeadStatus } from "@/lib/leads-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, ExternalLink, FileText } from "lucide-react";
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

const OpsLeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchLead(id).then((l) => {
      setLead(l);
      setStatus(l.status);
      setOutcome(l.outcome);
      setNotes(l.notes ?? "");
      setFollowUp(l.next_follow_up_at ? l.next_follow_up_at.split("T")[0] : "");
      setAssignedTo(l.assigned_to ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateLead(id, {
        status: status as LeadStatus,
        outcome: outcome as "open" | "won" | "lost",
        notes,
        next_follow_up_at: followUp ? new Date(followUp).toISOString() : null,
      });
      setLead(updated as LeadRow);
      toast.success("Lead updated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update");
    }
    setSaving(false);
  };

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;
  if (!lead) return <OpsLayout><div className="py-20 text-center text-muted-foreground">Lead not found</div></OpsLayout>;

  const infoRows = [
    { label: "Full name", value: lead.full_name },
    { label: "Email", value: lead.email },
    { label: "Mobile", value: lead.mobile_number },
    { label: "Company", value: lead.company_name },
    { label: "City", value: lead.city },
    { label: "Source page", value: lead.lead_source_page },
    { label: "Source type", value: lead.lead_source_type?.replace(/_/g, " ") },
    { label: "Audience", value: lead.audience_type },
    { label: "Destination", value: lead.destination_type },
    { label: "EMI flag", value: lead.emi_flag ? "Yes" : "No" },
    { label: "Insurance flag", value: lead.insurance_flag ? "Yes" : "No" },
    { label: "PG flag", value: lead.pg_flag ? "Yes" : "No" },
    { label: "Validation status", value: lead.quote_validation_status },
    { label: "Created", value: format(new Date(lead.created_at), "dd MMM yyyy, HH:mm") },
    { label: "Updated", value: format(new Date(lead.updated_at), "dd MMM yyyy, HH:mm") },
  ];

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link to="/ops/leads">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><ArrowLeft size={14} /> Back</Button>
          </Link>
          <h1 className="text-lg font-heading font-bold">{lead.full_name}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border rounded-xl bg-card p-5 space-y-3">
              <h2 className="text-sm font-heading font-semibold">Submission details</h2>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {infoRows.map((r) => (
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

            {/* File */}
            {lead.quote_file_url && (
              <div className="border rounded-xl bg-card p-5 space-y-2">
                <h2 className="text-sm font-heading font-semibold">Uploaded file</h2>
                <a href={lead.quote_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText size={14} /> {lead.quote_file_name ?? "View file"} <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Metadata */}
            {lead.metadata_json && Object.keys(lead.metadata_json as object).length > 0 && (
              <div className="border rounded-xl bg-card p-5 space-y-2">
                <h2 className="text-sm font-heading font-semibold">Metadata</h2>
                <pre className="text-xs text-muted-foreground bg-muted rounded-lg p-3 overflow-auto max-h-40">
                  {JSON.stringify(lead.metadata_json, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Action panel */}
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
                <label className="text-xs text-muted-foreground">Next follow-up</label>
                <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Internal notes</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="text-sm" placeholder="Add notes…" />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OpsLayout>
  );
};

export default OpsLeadDetail;
