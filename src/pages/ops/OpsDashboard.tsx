import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OpsLayout from "@/components/ops/OpsLayout";
import { fetchLeadKPIs, fetchLeads, fetchLeadsBySource, fetchLeadsByStatus, type LeadRow } from "@/lib/leads-service";
import { Loader2, TrendingUp, Users, Clock, Server, Rocket, CheckCircle2, AlertTriangle, BarChart3 } from "lucide-react";
import { format } from "date-fns";

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

const OpsDashboard = () => {
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof fetchLeadKPIs>> | null>(null);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchLeadKPIs(),
      fetchLeads({ pageSize: 10 }),
      fetchLeadsBySource(),
      fetchLeadsByStatus(),
    ]).then(([k, l, src, st]) => {
      setKpis(k);
      setRecentLeads(l.data);
      setSourceBreakdown(src);
      setStatusBreakdown(st);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  const cards = [
    { label: "New today", value: kpis?.newToday ?? 0, icon: TrendingUp, color: "text-blue-600" },
    { label: "Open leads", value: kpis?.open ?? 0, icon: Users, color: "text-primary" },
    { label: "Overdue follow-ups", value: kpis?.pendingFollowUp ?? 0, icon: Clock, color: "text-amber-600", alert: (kpis?.pendingFollowUp ?? 0) > 0 },
    { label: "Sandbox requests", value: kpis?.sandbox ?? 0, icon: Server, color: "text-violet-600" },
    { label: "Production requests", value: kpis?.production ?? 0, icon: Rocket, color: "text-rose-600" },
    { label: "Converted (month)", value: kpis?.convertedThisMonth ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  const topSources = Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topStatuses = Object.entries(statusBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <OpsLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-heading font-bold">Dashboard</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((c) => (
            <div key={c.label} className={`p-4 rounded-xl border bg-card space-y-1 ${c.alert ? "border-amber-300" : ""}`}>
              <div className="flex items-center gap-2">
                {c.alert ? <AlertTriangle size={14} className="text-amber-500" /> : <c.icon size={14} className={c.color} />}
                <span className="text-[11px] text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-2xl font-heading font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Breakdowns */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* By source */}
          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">Leads by source</h2>
            </div>
            <div className="space-y-2">
              {topSources.length === 0 && <p className="text-xs text-muted-foreground">No data yet</p>}
              {topSources.map(([src, count]) => {
                const max = topSources[0]?.[1] ?? 1;
                return (
                  <div key={src} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs capitalize">{src.replace(/_/g, " ")}</span>
                      <span className="text-xs font-bold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By status */}
          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">Leads by status</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {topStatuses.map(([st, count]) => (
                <div key={st} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusColors[st] ?? "bg-muted text-muted-foreground"}`}>
                  {st.replace(/_/g, " ")} · {count}
                </div>
              ))}
              {topStatuses.length === 0 && <p className="text-xs text-muted-foreground">No data yet</p>}
            </div>
          </div>
        </div>

        {/* Recent leads */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-heading font-semibold">Recent submissions</h2>
            <Link to="/ops/leads" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Source</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Priority</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Audience</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">No leads yet</td></tr>
                  )}
                  {recentLeads.map((lead: any) => (
                    <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/ops/leads/${lead.id}`}>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{format(new Date(lead.created_at), "dd MMM yyyy")}</td>
                      <td className="px-4 py-2.5 font-medium">{lead.full_name}</td>
                      <td className="px-4 py-2.5 text-xs capitalize">{lead.lead_source_type?.replace(/_/g, " ") ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[lead.status] ?? "bg-muted text-muted-foreground"}`}>
                          {lead.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityColors[lead.priority] ?? "bg-muted text-muted-foreground"}`}>
                          {lead.priority ?? "medium"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs capitalize">{lead.audience_type ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </OpsLayout>
  );
};

export default OpsDashboard;
