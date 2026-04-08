import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OpsLayout from "@/components/ops/OpsLayout";
import { fetchLeads, fetchTeamMembers, updateLead, leadsToCSV, type LeadRow, type LeadStatus, type LeadSourceType, type AudienceType, type LeadPriority, type TeamMember } from "@/lib/leads-service";
import { logActivity } from "@/lib/activity-service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Search, ChevronLeft, ChevronRight, Inbox, Upload, FileDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import LeadImportModal from "@/components/ops/LeadImportModal";
import DeleteLeadsModal from "@/components/ops/DeleteLeadsModal";
import { downloadTemplate } from "@/lib/lead-import-service";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "waiting_for_customer", label: "Waiting" },
  { value: "demo_scheduled", label: "Demo scheduled" },
  { value: "sandbox_issued", label: "Sandbox issued" },
  { value: "production_review", label: "Production review" },
  { value: "converted", label: "Converted" },
  { value: "closed_lost", label: "Closed lost" },
];

const SOURCE_OPTIONS: { value: LeadSourceType; label: string }[] = [
  { value: "contact_form", label: "Contact Form" },
  { value: "traveler_quote_unlock", label: "Traveler Quote" },
  { value: "agent_quote_review", label: "Agent Quote" },
  { value: "sandbox_access_request", label: "Sandbox" },
  { value: "production_access_request", label: "Production" },
  { value: "demo_request", label: "Demo" },
  { value: "support_request", label: "Support" },
  { value: "integration_query", label: "Integration" },
  { value: "excel_import", label: "Excel Import" },
  { value: "manual_entry", label: "Manual Entry" },
  { value: "offline_calling", label: "Offline Calling" },
  { value: "whatsapp_inbound", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
  { value: "existing_partner", label: "Existing Partner" },
  { value: "event_lead", label: "Event Lead" },
  { value: "itinerary_upload", label: "Itinerary Upload" },
  { value: "insurance_query" as LeadSourceType, label: "Insurance Query" },
];

const AUDIENCE_OPTIONS: { value: AudienceType; label: string }[] = [
  { value: "traveler", label: "Traveler" },
  { value: "agent", label: "Agent" },
  { value: "developer", label: "Developer" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS: { value: LeadPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const VIEW_PRESETS: { label: string; filter: Partial<{ status: LeadStatus; sourceType: LeadSourceType; audience: AudienceType; special: string }> }[] = [
  { label: "All", filter: {} },
  { label: "My Leads", filter: { special: "my_leads" } },
  { label: "Unassigned", filter: { special: "unassigned" } },
  { label: "Overdue", filter: { special: "overdue" } },
  { label: "New", filter: { status: "new" } },
  { label: "Traveler", filter: { audience: "traveler" } },
  { label: "Agent", filter: { audience: "agent" } },
  { label: "Sandbox", filter: { sourceType: "sandbox_access_request" } },
  { label: "Production", filter: { sourceType: "production_access_request" } },
  { label: "Converted", filter: { status: "converted" } },
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

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

const PAGE_SIZE = 25;

const OpsLeads = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teamEmails, setTeamEmails] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">(searchParams.get("status") as LeadStatus ?? "");
  const [sourceFilter, setSourceFilter] = useState<LeadSourceType | "">(searchParams.get("source") as LeadSourceType ?? "");
  const [audienceFilter, setAudienceFilter] = useState<AudienceType | "">(searchParams.get("audience") as AudienceType ?? "");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "">("");
  const [specialFilter, setSpecialFilter] = useState<string>("");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [activePreset, setActivePreset] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canDelete = role === "super_admin" || role === "admin" || role === "team_supervisor";
  const canImport = role === "super_admin" || role === "admin" || role === "team_supervisor";
  const canExport = role === "super_admin" || role === "admin";
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLeads({
        search: search || undefined,
        status: (statusFilter || undefined) as LeadStatus | undefined,
        sourceType: (sourceFilter || undefined) as LeadSourceType | undefined,
        audience: (audienceFilter || undefined) as AudienceType | undefined,
        priority: (priorityFilter || undefined) as LeadPriority | undefined,
        assignedTo: specialFilter === "my_leads" ? user?.id : undefined,
        unassigned: specialFilter === "unassigned" ? true : undefined,
        overdueFollowUp: specialFilter === "overdue" ? true : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setLeads(res.data);
      setTotal(res.count);
    } catch {
      // fail silently
    }
    setLoading(false);
  }, [search, statusFilter, sourceFilter, audienceFilter, priorityFilter, specialFilter, page, user?.id]);

  useEffect(() => { load(); }, [load]);

  // Load team members for owner display
  useEffect(() => {
    fetchTeamMembers().then((members) => {
      setTeamMembers(members);
      const emailMap: Record<string, string> = {};
      members.forEach(m => { if (m.full_name) emailMap[m.user_id] = m.full_name; });
      if (user) emailMap[user.id] = user.email ?? user.id.slice(0, 8) + "…";
      setTeamEmails(emailMap);
    }).catch(() => {});
  }, [user]);

  const applyPreset = (preset: typeof VIEW_PRESETS[number]) => {
    setActivePreset(preset.label);
    setStatusFilter((preset.filter.status ?? "") as LeadStatus | "");
    setSourceFilter((preset.filter.sourceType ?? "") as LeadSourceType | "");
    setAudienceFilter((preset.filter.audience ?? "") as AudienceType | "");
    setPriorityFilter("");
    setSpecialFilter(preset.filter.special ?? "");
    setPage(1);
    setSelected(new Set());
  };

  const handleExport = async () => {
    const all = await fetchLeads({ search, status: statusFilter || undefined, sourceType: sourceFilter || undefined, audience: audienceFilter || undefined, priority: priorityFilter || undefined, pageSize: 10000 });
    const csv = leadsToCSV(all.data, teamMembers);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sankash-leads-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l.id)));
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-heading font-bold">Leads <span className="text-sm font-normal text-muted-foreground ml-1">({total})</span></h1>
           <div className="flex items-center gap-2">
            {selected.size > 0 && canDelete && (
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="gap-1.5 text-xs">
                <Trash2 size={14} /> Delete ({selected.size})
              </Button>
            )}
            {selected.size > 0 && <span className="text-xs text-muted-foreground">{selected.size} selected</span>}
            {canImport && (
              <>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate("xlsx")} className="gap-1.5 text-xs">
                  <FileDown size={14} /> Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5 text-xs">
                  <Upload size={14} /> Import
                </Button>
              </>
            )}
            {canExport && (
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
                <Download size={14} /> Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* View presets */}
        <div className="flex flex-wrap gap-1.5">
          {VIEW_PRESETS.map((p) => (
            <Button
              key={p.label}
              variant={activePreset === p.label ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-7 px-3"
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, company, phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter || "__all__"} onValueChange={(v) => { setStatusFilter(v === "__all__" ? "" : v as LeadStatus); setPage(1); setActivePreset(""); }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceFilter || "__all__"} onValueChange={(v) => { setSourceFilter(v === "__all__" ? "" : v as LeadSourceType); setPage(1); setActivePreset(""); }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All sources</SelectItem>
              {SOURCE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={audienceFilter || "__all__"} onValueChange={(v) => { setAudienceFilter(v === "__all__" ? "" : v as AudienceType); setPage(1); setActivePreset(""); }}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Audience" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All audiences</SelectItem>
              {AUDIENCE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter || "__all__"} onValueChange={(v) => { setPriorityFilter(v === "__all__" ? "" : v as LeadPriority); setPage(1); setActivePreset(""); }}>
            <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All priorities</SelectItem>
              {PRIORITY_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2.5 w-8">
                    <input type="checkbox" checked={selected.size === leads.length && leads.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Last Activity</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Company</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Source</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden xl:table-cell">Owner</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Priority</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Audience</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={20} /></td></tr>
                )}
                {!loading && leads.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox size={28} className="text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">No leads yet</p>
                        <p className="text-xs text-muted-foreground/70">Leads from website forms and gated actions will appear here automatically.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${selected.has(lead.id) ? "bg-primary/5" : ""}`}
                    onClick={() => navigate(`/ops/leads/${lead.id}`)}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}>
                      <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded" />
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-foreground">{format(new Date(lead.updated_at), "dd MMM")}</span>
                      {lead.updated_at !== lead.created_at && (
                        <span className="block text-[10px] text-muted-foreground/60">Est. {format(new Date(lead.created_at), "dd MMM")}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-medium whitespace-nowrap">{lead.full_name}</td>
                    <td className="px-3 py-2.5 text-xs hidden md:table-cell">{lead.company_name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs hidden lg:table-cell font-mono">{lead.mobile_number ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs capitalize whitespace-nowrap">{lead.lead_source_type?.replace(/_/g, " ") ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs hidden xl:table-cell">
                      {lead.assigned_to ? (
                        <span className="text-xs text-muted-foreground">
                          {lead.assigned_to === user?.id ? (user?.email ?? "You") : (teamEmails[lead.assigned_to] ?? lead.assigned_to.slice(0, 8) + "…")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[lead.status] ?? "bg-muted text-muted-foreground"}`}>
                        {lead.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityColors[lead.priority] ?? "bg-muted text-muted-foreground"}`}>
                        {lead.priority ?? "medium"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs capitalize hidden lg:table-cell">{lead.audience_type ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{total} leads · page {page} of {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </div>

      {canImport && (
        <LeadImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          userId={user!.id}
          teamMembers={teamMembers}
          onImportComplete={load}
        />
      )}

      {canDelete && deleteOpen && (
        <DeleteLeadsModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          leads={leads.filter(l => selected.has(l.id))}
          userId={user!.id}
          onDeleted={() => { setSelected(new Set()); load(); }}
        />
      )}
    </OpsLayout>
  );
};

export default OpsLeads;
