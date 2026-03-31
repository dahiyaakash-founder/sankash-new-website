import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Fetch all leads
    const { data: leads } = await adminClient.from("leads").select("*");
    const allLeads = leads ?? [];

    // Fetch team
    const { data: roles } = await adminClient.from("user_roles").select("*");
    const { data: profiles } = await adminClient.from("profiles").select("*");
    const profileMap: Record<string, string> = {};
    (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = p.full_name; });

    // Company-level stats
    const newYesterday = allLeads.filter(l => new Date(l.created_at) >= yesterday && new Date(l.created_at) < new Date(todayStart)).length;
    const openLeads = allLeads.filter(l => !["converted", "closed_lost"].includes(l.status)).length;
    const overdueTotal = allLeads.filter(l => l.next_follow_up_at && new Date(l.next_follow_up_at) < now && !["converted", "closed_lost"].includes(l.status)).length;
    const followUpsDueToday = allLeads.filter(l => l.next_follow_up_at && l.next_follow_up_at >= todayStart && l.next_follow_up_at < tomorrowStart).length;
    const convertedThisMonth = allLeads.filter(l => l.status === "converted" && l.updated_at >= startOfMonth).length;

    // Source breakdown
    const sourceMap: Record<string, number> = {};
    allLeads.forEach(l => { const s = l.lead_source_type ?? "unknown"; sourceMap[s] = (sourceMap[s] ?? 0) + 1; });

    // Per-member stats
    const memberStats = (roles ?? []).map((r: any) => {
      const name = profileMap[r.user_id] ?? r.user_id.slice(0, 8);
      const memberLeads = allLeads.filter(l => l.assigned_to === r.user_id);
      return {
        name,
        role: r.role,
        total: memberLeads.length,
        open: memberLeads.filter(l => !["converted", "closed_lost"].includes(l.status)).length,
        overdue: memberLeads.filter(l => l.next_follow_up_at && new Date(l.next_follow_up_at) < now && !["converted", "closed_lost"].includes(l.status)).length,
        dueToday: memberLeads.filter(l => l.next_follow_up_at && l.next_follow_up_at >= todayStart && l.next_follow_up_at < tomorrowStart).length,
        converted: memberLeads.filter(l => l.status === "converted" && l.updated_at >= startOfMonth).length,
      };
    });

    // Build report JSON
    const report = {
      generated_at: now.toISOString(),
      timezone: "Asia/Kolkata",
      company_summary: {
        new_yesterday: newYesterday,
        open_leads: openLeads,
        overdue_follow_ups: overdueTotal,
        follow_ups_due_today: followUpsDueToday,
        converted_this_month: convertedThisMonth,
        total_leads: allLeads.length,
        source_breakdown: sourceMap,
      },
      team_summary: memberStats,
      // HTML email template for later wiring
      html: generateReportHTML({
        newYesterday, openLeads, overdueTotal, followUpsDueToday,
        convertedThisMonth, total: allLeads.length, sourceMap, memberStats,
        date: now,
      }),
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateReportHTML(data: any): string {
  const { newYesterday, openLeads, overdueTotal, followUpsDueToday, convertedThisMonth, total, sourceMap, memberStats, date } = data;
  const dateStr = date.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" });

  const sourceRows = Object.entries(sourceMap)
    .sort((a: any, b: any) => b[1] - a[1])
    .map(([src, count]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;text-transform:capitalize">${src.replace(/_/g, " ")}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;text-align:right">${count}</td></tr>`)
    .join("");

  const teamRows = memberStats
    .sort((a: any, b: any) => b.total - a.total)
    .map((m: any) => `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${m.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${m.open}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;color:${m.overdue > 0 ? '#d97706' : '#666'}">${m.overdue}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${m.dueToday}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;color:${m.converted > 0 ? '#059669' : '#666'}">${m.converted}</td>
    </tr>`)
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#0891b2;padding:20px 24px;color:#fff">
    <h1 style="margin:0;font-size:18px">SanKash Ops Daily Report</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:0.85">${dateStr}</p>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr>
        <td style="padding:12px;text-align:center;background:#f0fdfa;border-radius:8px"><div style="font-size:24px;font-weight:700;color:#0891b2">${newYesterday}</div><div style="font-size:11px;color:#666">New yesterday</div></td>
        <td style="width:8px"></td>
        <td style="padding:12px;text-align:center;background:#fef3c7;border-radius:8px"><div style="font-size:24px;font-weight:700;color:#d97706">${overdueTotal}</div><div style="font-size:11px;color:#666">Overdue</div></td>
        <td style="width:8px"></td>
        <td style="padding:12px;text-align:center;background:#ecfdf5;border-radius:8px"><div style="font-size:24px;font-weight:700;color:#059669">${convertedThisMonth}</div><div style="font-size:11px;color:#666">Converted (month)</div></td>
      </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
      <tr><td style="padding:8px 0;font-size:13px;color:#666">Open leads</td><td style="padding:8px 0;font-size:13px;font-weight:600;text-align:right">${openLeads}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#666">Follow-ups due today</td><td style="padding:8px 0;font-size:13px;font-weight:600;text-align:right">${followUpsDueToday}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#666">Total leads</td><td style="padding:8px 0;font-size:13px;font-weight:600;text-align:right">${total}</td></tr>
    </table>
    <h3 style="font-size:14px;margin:20px 0 8px;color:#111">Leads by Source</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px">${sourceRows}</table>
    <h3 style="font-size:14px;margin:20px 0 8px;color:#111">Team Performance</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="background:#f3f4f6"><th style="padding:8px 12px;text-align:left">Member</th><th style="padding:8px 12px;text-align:center">Open</th><th style="padding:8px 12px;text-align:center">Overdue</th><th style="padding:8px 12px;text-align:center">Due today</th><th style="padding:8px 12px;text-align:center">Converted</th></tr></thead>
      <tbody>${teamRows}</tbody>
    </table>
  </div>
  <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
    <p style="margin:0;font-size:11px;color:#9ca3af">SanKash Ops · Generated at 10:00 AM IST</p>
  </div>
</div>
</body></html>`;
}
