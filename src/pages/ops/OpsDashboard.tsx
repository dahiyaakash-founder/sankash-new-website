import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OpsLayout from "@/components/ops/OpsLayout";
import { fetchLeadKPIs, fetchLeads, fetchLeadsBySource, fetchLeadsByStatus, fetchTeamMembers, type LeadRow, type TeamMember } from "@/lib/leads-service";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, TrendingUp, Users, Clock, Server, Rocket, CheckCircle2, AlertTriangle, BarChart3, UserCheck, CalendarClock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

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

interface TeamStats {
  userId: string;
  name: string;
  role: string;
  supervisorId?: string | null;
  supervisorName?: string | null;
  openLeads: number;
  overdueLeads: number;
  convertedThisMonth: number;
  totalLeads: number;
}

const OpsDashboard = () => {
  const { role } = useAuth();
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof fetchLeadKPIs>> | null>(null);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [agingBuckets, setAgingBuckets] = useState({ day01: 0, day23: 0, day47: 0, day7plus: 0 });
  const [followUpsDueToday, setFollowUpsDueToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const isSupervisorOrAbove = role === "super_admin" || role === "admin" || role === "team_supervisor";

  useEffect(() => {
    const load = async () => {
      try {
        const [k, l, src, st] = await Promise.all([
          fetchLeadKPIs(),
          fetchLeads({ pageSize: 10 }),
          fetchLeadsBySource(),
          fetchLeadsByStatus(),
        ]);
        setKpis(k);
        setRecentLeads(l.data);
        setSourceBreakdown(src);
        setStatusBreakdown(st);

        // Calculate aging buckets and follow-ups due today from all open leads
        if (isSupervisorOrAbove) {
          const allOpen = await fetchLeads({ pageSize: 1000 });
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today.getTime() + 86400000);
          let d01 = 0, d23 = 0, d47 = 0, d7p = 0, fudToday = 0;

          allOpen.data.forEach((lead: any) => {
            if (lead.status === "converted" || lead.status === "closed_lost") return;
            const age = differenceInDays(now, new Date(lead.created_at));
            if (age <= 1) d01++;
            else if (age <= 3) d23++;
            else if (age <= 7) d47++;
            else d7p++;

            if (lead.next_follow_up_at) {
              const fu = new Date(lead.next_follow_up_at);
              if (fu >= today && fu < tomorrow) fudToday++;
            }
          });
          setAgingBuckets({ day01: d01, day23: d23, day47: d47, day7plus: d7p });
          setFollowUpsDueToday(fudToday);

          // Team stats
          const members = await fetchTeamMembers();
          // Fetch profiles for supervisor_id
          const { data: profiles } = await supabase.from("profiles" as any).select("*") as any;
          const profileMap: Record<string, { supervisor_id?: string }> = {};
          (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = { supervisor_id: p.supervisor_id }; });

          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const nameMap: Record<string, string> = {};
          members.forEach(m => { if (m.full_name) nameMap[m.user_id] = m.full_name; });

          const stats: TeamStats[] = members.map((m) => {
            const memberLeads = allOpen.data.filter((lead: any) => lead.assigned_to === m.user_id);
            const openLeads = memberLeads.filter((lead: any) => !["converted", "closed_lost"].includes(lead.status)).length;
            const overdueLeads = memberLeads.filter((lead: any) =>
              lead.next_follow_up_at && new Date(lead.next_follow_up_at) < now && !["converted", "closed_lost"].includes(lead.status)
            ).length;
            const convertedThisMonth = memberLeads.filter((lead: any) =>
              lead.status === "converted" && lead.updated_at >= startOfMonth
            ).length;
            const supId = profileMap[m.user_id]?.supervisor_id;
            return {
              userId: m.user_id,
              name: m.full_name ?? m.email ?? m.user_id.slice(0, 8) + "…",
              role: m.role,
              supervisorId: supId,
              supervisorName: supId ? nameMap[supId] ?? null : null,
              openLeads,
              overdueLeads,
              convertedThisMonth,
              totalLeads: memberLeads.length,
            };
          }).sort((a, b) => {
            const roleOrder: Record<string, number> = { super_admin: 0, admin: 1, team_supervisor: 2, team_member: 3 };
            const diff = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
            return diff !== 0 ? diff : b.totalLeads - a.totalLeads;
          });
          setTeamStats(stats);
        }
      } catch { /* */ }
      setLoading(false);
    };
    load();
  }, [isSupervisorOrAbove]);

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  const cards = [
    { label: "New today", value: kpis?.newToday ?? 0, icon: TrendingUp, color: "text-blue-600" },
    { label: "Open leads", value: kpis?.open ?? 0, icon: Users, color: "text-primary" },
    { label: "Overdue follow-ups", value: kpis?.pendingFollowUp ?? 0, icon: Clock, color: "text-amber-600", alert: (kpis?.pendingFollowUp ?? 0) > 0 },
    { label: "Follow-ups today", value: followUpsDueToday, icon: CalendarClock, color: "text-emerald-600" },
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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

        {/* Aging buckets (supervisor+) */}
        {isSupervisorOrAbove && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "0–1 day", value: agingBuckets.day01, color: "bg-emerald-100 text-emerald-700" },
              { label: "2–3 days", value: agingBuckets.day23, color: "bg-yellow-100 text-yellow-700" },
              { label: "4–7 days", value: agingBuckets.day47, color: "bg-orange-100 text-orange-700" },
              { label: "7+ days", value: agingBuckets.day7plus, color: "bg-red-100 text-red-700" },
            ].map(b => (
              <div key={b.label} className="p-3 rounded-xl border bg-card">
                <span className="text-[10px] text-muted-foreground">{b.label}</span>
                <p className="text-lg font-heading font-bold mt-1">{b.value}</p>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${b.color}`}>aging</span>
              </div>
            ))}
          </div>
        )}

        {/* Breakdowns */}
        <div className="grid md:grid-cols-2 gap-4">
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

        {/* Team leaderboard (supervisor+) */}
        {isSupervisorOrAbove && teamStats.length > 0 && (
          <div className="border rounded-xl bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-primary" />
              <h2 className="text-sm font-heading font-semibold">Team leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Member</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Reports To</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Total</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Open</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Overdue</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats.map((s) => (
                    <tr key={s.userId} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-xs capitalize text-muted-foreground">{s.role.replace(/_/g, " ")}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {s.supervisorName ?? (s.role === "team_member" ? <span className="italic opacity-50">Unassigned</span> : "—")}
                      </td>
                      <td className="px-3 py-2 text-center">{s.totalLeads}</td>
                      <td className="px-3 py-2 text-center">{s.openLeads}</td>
                      <td className="px-3 py-2 text-center">
                        {s.overdueLeads > 0 ? (
                          <span className="text-xs font-semibold text-amber-600">{s.overdueLeads}</span>
                        ) : "0"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {s.convertedThisMonth > 0 ? (
                          <span className="text-xs font-semibold text-emerald-600">{s.convertedThisMonth}</span>
                        ) : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users size={24} className="text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">No leads yet</p>
                          <p className="text-xs text-muted-foreground/70">Submissions from website forms will appear here.</p>
                        </div>
                      </td>
                    </tr>
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
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          lead.priority === "urgent" ? "bg-red-100 text-red-700" :
                          lead.priority === "high" ? "bg-orange-100 text-orange-700" :
                          lead.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
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
