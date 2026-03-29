import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OpsLayout from "@/components/ops/OpsLayout";
import { fetchLeadKPIs, fetchLeads, type LeadRow } from "@/lib/leads-service";
import { Loader2, TrendingUp, Users, Clock, Server, Rocket, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  converted: "bg-emerald-100 text-emerald-800",
  closed_lost: "bg-red-100 text-red-800",
};

const OpsDashboard = () => {
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof fetchLeadKPIs>> | null>(null);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLeadKPIs(), fetchLeads({ pageSize: 10 })]).then(([k, l]) => {
      setKpis(k);
      setRecentLeads(l.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  const cards = [
    { label: "New today", value: kpis?.newToday ?? 0, icon: TrendingUp, color: "text-blue-600" },
    { label: "Open leads", value: kpis?.open ?? 0, icon: Users, color: "text-primary" },
    { label: "Pending follow-ups", value: kpis?.pendingFollowUp ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "Sandbox requests", value: kpis?.sandbox ?? 0, icon: Server, color: "text-violet-600" },
    { label: "Production requests", value: kpis?.production ?? 0, icon: Rocket, color: "text-rose-600" },
    { label: "Converted (month)", value: kpis?.convertedThisMonth ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  return (
    <OpsLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-heading font-bold">Dashboard</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="p-4 rounded-xl border bg-card space-y-1">
              <div className="flex items-center gap-2">
                <c.icon size={14} className={c.color} />
                <span className="text-[11px] text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-2xl font-heading font-bold">{c.value}</p>
            </div>
          ))}
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
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Audience</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">No leads yet</td></tr>
                  )}
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/ops/leads/${lead.id}`}>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{format(new Date(lead.created_at), "dd MMM yyyy")}</td>
                      <td className="px-4 py-2.5 font-medium">{lead.full_name}</td>
                      <td className="px-4 py-2.5 text-xs">{lead.lead_source_type?.replace(/_/g, " ") ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[lead.status] ?? "bg-muted text-muted-foreground"}`}>
                          {lead.status.replace(/_/g, " ")}
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
