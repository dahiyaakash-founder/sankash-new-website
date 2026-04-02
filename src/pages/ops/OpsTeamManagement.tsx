import { useEffect, useState } from "react";
import OpsLayout from "@/components/ops/OpsLayout";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchLeads } from "@/lib/leads-service";
import { Loader2, Shield, User, Inbox, UserPlus, MoreHorizontal, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  team_supervisor: "Team Supervisor",
  team_member: "Team Member",
};

const roleBadgeStyles: Record<string, string> = {
  super_admin: "bg-primary/15 text-primary",
  admin: "bg-primary/10 text-primary",
  team_supervisor: "bg-amber-100 text-amber-800",
  team_member: "bg-muted text-muted-foreground",
};

const ROLE_ORDER: Record<string, number> = {
  super_admin: 0,
  admin: 1,
  team_supervisor: 2,
  team_member: 3,
};

interface TeamMemberRow {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
  status?: string;
  supervisor_id?: string | null;
  openLeads: number;
  overdueLeads: number;
  convertedThisMonth: number;
}

const OpsTeamManagement = () => {
  const { user, role: currentUserRole } = useAuth();
  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdminOrAbove = currentUserRole === "super_admin" || currentUserRole === "admin";

  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "team_member", supervisor_id: "" });
  const [credentialsModal, setCredentialsModal] = useState<{ email: string; password: string; name: string } | null>(null);
  const [expandedSupervisors, setExpandedSupervisors] = useState<Set<string>>(new Set());

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data: roles } = await supabase.from("user_roles").select("*");
      const { data: profiles } = await supabase.from("profiles" as any).select("*") as any;

      const profileMap: Record<string, { full_name: string; status: string; supervisor_id?: string }> = {};
      (profiles ?? []).forEach((p: any) => {
        profileMap[p.user_id] = { full_name: p.full_name, status: p.status, supervisor_id: p.supervisor_id };
      });

      let emailMap: Record<string, string> = {};
      if (user?.email) {
        emailMap[user.id] = user.email;
      }

      const allLeads = await fetchLeads({ pageSize: 1000 });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const merged: TeamMemberRow[] = (roles ?? []).map((r: any) => {
        const memberLeads = allLeads.data.filter((l: any) => l.assigned_to === r.user_id);
        const profile = profileMap[r.user_id];
        return {
          id: r.id,
          user_id: r.user_id,
          role: r.role,
          full_name: profile?.full_name,
          status: profile?.status ?? "active",
          email: emailMap[r.user_id] ?? undefined,
          supervisor_id: profile?.supervisor_id,
          openLeads: memberLeads.filter((l: any) => !["converted", "closed_lost"].includes(l.status)).length,
          overdueLeads: memberLeads.filter((l: any) => l.next_follow_up_at && new Date(l.next_follow_up_at) < now && !["converted", "closed_lost"].includes(l.status)).length,
          convertedThisMonth: memberLeads.filter((l: any) => l.status === "converted" && l.updated_at >= startOfMonth).length,
        };
      });

      setMembers(merged);
      // Auto-expand all supervisors
      const supIds = new Set(merged.filter(m => m.role === "team_supervisor").map(m => m.user_id));
      setExpandedSupervisors(supIds);
    } catch {
      toast.error("Failed to load team members");
    }
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteForm.full_name || !inviteForm.email || !inviteForm.role) {
      toast.error("All fields are required");
      return;
    }
    setInviting(true);
    try {
      const res = await supabase.functions.invoke("team-management", {
        body: {
          action: "invite",
          email: inviteForm.email,
          full_name: inviteForm.full_name,
          role: inviteForm.role,
          supervisor_id: inviteForm.supervisor_id || undefined,
        },
      });
      if (res.error) {
        const msg = typeof res.error === "object" && "message" in res.error
          ? (res.error as any).message
          : String(res.error);
        throw new Error(msg || "Invite failed");
      }
      if (res.data?.error) {
        const errMsg = res.data.error;
        if (errMsg.includes("already been registered") || errMsg.includes("duplicate")) {
          throw new Error(`${inviteForm.email} has already been invited or registered.`);
        }
        throw new Error(errMsg);
      }
      setInviteOpen(false);
      setCredentialsModal({
        email: inviteForm.email,
        password: res.data?.temp_password ?? "",
        name: inviteForm.full_name,
      });
      setInviteForm({ full_name: "", email: "", role: "team_member", supervisor_id: "" });
      loadMembers();
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.error(err.message || "Failed to send invite. Please try again.");
    }
    setInviting(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await supabase.functions.invoke("team-management", {
        body: { action: "update_role", user_id: userId, new_role: newRole },
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Role updated");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleSetSupervisor = async (userId: string, supervisorId: string | null) => {
    try {
      const res = await supabase.functions.invoke("team-management", {
        body: { action: "set_supervisor", user_id: userId, supervisor_id: supervisorId },
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Supervisor updated");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update supervisor");
    }
  };

  const handleDisable = async (userId: string) => {
    try {
      const res = await supabase.functions.invoke("team-management", {
        body: { action: "disable", user_id: userId },
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("User disabled");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to disable user");
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const res = await supabase.functions.invoke("team-management", {
        body: { action: "reactivate", user_id: userId },
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("User reactivated");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate user");
    }
  };

  const handleReinvite = async (userId: string) => {
    try {
      const res = await supabase.functions.invoke("team-management", {
        body: { action: "reinvite", user_id: userId },
      });
      if (res.data?.error) throw new Error(res.data.error);
      setCredentialsModal({
        email: res.data?.email ?? "",
        password: res.data?.temp_password ?? "",
        name: "Team Member",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to re-send invite");
    }
  };

  const toggleSupervisor = (supervisorId: string) => {
    setExpandedSupervisors(prev => {
      const next = new Set(prev);
      if (next.has(supervisorId)) next.delete(supervisorId);
      else next.add(supervisorId);
      return next;
    });
  };

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  // Build hierarchy
  const admins = members.filter(m => m.role === "super_admin" || m.role === "admin").sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  const supervisors = members.filter(m => m.role === "team_supervisor");
  const teamMembers = members.filter(m => m.role === "team_member");
  const supervisorOptions = supervisors.filter(s => s.status !== "disabled");

  // Group team members by supervisor
  const membersBySupervisor: Record<string, TeamMemberRow[]> = {};
  const unassignedMembers: TeamMemberRow[] = [];
  teamMembers.forEach(m => {
    if (m.supervisor_id && supervisors.some(s => s.user_id === m.supervisor_id)) {
      if (!membersBySupervisor[m.supervisor_id]) membersBySupervisor[m.supervisor_id] = [];
      membersBySupervisor[m.supervisor_id].push(m);
    } else {
      unassignedMembers.push(m);
    }
  });

  const renderMemberRow = (m: TeamMemberRow, indent: number = 0) => {
    const isYou = m.user_id === user?.id;
    const displayName = m.full_name || m.email || "Team member";
    const displayEmail = isYou ? user?.email : m.email;
    const isDisabled = m.status === "disabled";
    const isInvited = m.status === "invited";
    const isMemberSuperAdmin = m.role === "super_admin";
    const supervisorName = m.supervisor_id ? members.find(s => s.user_id === m.supervisor_id)?.full_name : null;

    return (
      <tr key={m.id} className={`border-b last:border-0 ${isDisabled ? "opacity-50" : ""}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent * 24}px` }}>
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
              <User size={13} className="text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{displayName}</span>
                {isYou && <span className="text-[10px] text-primary font-semibold">(You)</span>}
              </div>
              {displayEmail && <span className="text-[11px] text-muted-foreground">{displayEmail}</span>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadgeStyles[m.role] ?? "bg-muted text-muted-foreground"}`}>
            <Shield size={10} />
            {roleLabels[m.role] ?? m.role}
          </span>
        </td>
        <td className="px-4 py-3">
          {isDisabled ? (
            <span className="text-xs text-destructive font-medium">Disabled</span>
          ) : isInvited ? (
            <span className="text-xs text-amber-600 font-medium">Invited</span>
          ) : (
            <span className="text-xs text-emerald-600 font-medium">Active</span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {supervisorName ?? (m.role === "team_member" ? <span className="italic text-muted-foreground/50">Unassigned</span> : "—")}
        </td>
        <td className="px-4 py-3 text-center text-sm">{m.openLeads}</td>
        <td className="px-4 py-3 text-center">
          {m.overdueLeads > 0 ? (
            <span className="text-sm font-semibold text-amber-600">{m.overdueLeads}</span>
          ) : <span className="text-sm">0</span>}
        </td>
        <td className="px-4 py-3 text-center">
          {m.convertedThisMonth > 0 ? (
            <span className="text-sm font-semibold text-emerald-600">{m.convertedThisMonth}</span>
          ) : <span className="text-sm">0</span>}
        </td>
        {isAdminOrAbove && (
          <td className="px-4 py-3 text-right">
            {!isMemberSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isDisabled && (
                    <>
                      {isInvited && (
                        <DropdownMenuItem onClick={() => handleReinvite(m.user_id)}>Re-send Invite</DropdownMenuItem>
                      )}
                      {!isInvited && !isYou && (
                        <DropdownMenuItem onClick={() => handleReinvite(m.user_id)}>Reset Password</DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "admin")}>Set as Admin</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "team_supervisor")}>Set as Supervisor</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "team_member")}>Set as Team Member</DropdownMenuItem>
                      {(m.role === "team_member" || m.role === "team_supervisor") && supervisorOptions.length > 0 && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Assign Supervisor</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleSetSupervisor(m.user_id, null)}>
                              <span className="italic text-muted-foreground">None (unassign)</span>
                            </DropdownMenuItem>
                            {supervisorOptions.map(s => (
                              <DropdownMenuItem
                                key={s.user_id}
                                onClick={() => handleSetSupervisor(m.user_id, s.user_id)}
                                className={m.supervisor_id === s.user_id ? "bg-accent" : ""}
                              >
                                {s.full_name ?? s.user_id.slice(0, 8)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      <DropdownMenuItem onClick={() => handleDisable(m.user_id)} className="text-destructive">Disable Access</DropdownMenuItem>
                    </>
                  )}
                  {isDisabled && (
                    <DropdownMenuItem onClick={() => handleReactivate(m.user_id)}>Reactivate</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </td>
        )}
      </tr>
    );
  };

  const colCount = isAdminOrAbove ? 8 : 7;

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold">Team Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdminOrAbove ? "Manage team hierarchy, roles, and assignments." : "View your team and reporting structure."}
            </p>
          </div>
          {isAdminOrAbove && (
            <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
              <UserPlus size={14} /> Invite Member
            </Button>
          )}
        </div>

        {/* Hierarchy Tree View */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Reports To</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Open</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Overdue</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Converted</th>
                  {isAdminOrAbove && (
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox size={24} className="text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No team members found</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Admins / Super Admins */}
                {admins.length > 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-2 bg-primary/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Leadership</span>
                    </td>
                  </tr>
                )}
                {admins.map(m => renderMemberRow(m))}

                {/* Supervisors with their team members */}
                {supervisors.length > 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-2 bg-amber-50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Supervisors & Teams</span>
                    </td>
                  </tr>
                )}
                {supervisors.map(sup => {
                  const teamUnder = membersBySupervisor[sup.user_id] ?? [];
                  const isExpanded = expandedSupervisors.has(sup.user_id);
                  return [
                    <tr key={`sup-toggle-${sup.user_id}`} className="border-b">
                      <td colSpan={1} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {teamUnder.length > 0 && (
                            <button onClick={() => toggleSupervisor(sup.user_id)} className="p-0.5 hover:bg-accent rounded">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          )}
                          {teamUnder.length === 0 && <div className="w-5" />}
                          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Users size={13} className="text-amber-700" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate">{sup.full_name || "Supervisor"}</span>
                              {sup.user_id === user?.id && <span className="text-[10px] text-primary font-semibold">(You)</span>}
                              {teamUnder.length > 0 && (
                                <span className="text-[10px] text-muted-foreground">· {teamUnder.length} member{teamUnder.length > 1 ? "s" : ""}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadgeStyles.team_supervisor}`}>
                          <Shield size={10} />
                          Team Supervisor
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sup.status === "disabled" ? (
                          <span className="text-xs text-destructive font-medium">Disabled</span>
                        ) : sup.status === "invited" ? (
                          <span className="text-xs text-amber-600 font-medium">Invited</span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">Admin</td>
                      <td className="px-4 py-3 text-center text-sm">{sup.openLeads}</td>
                      <td className="px-4 py-3 text-center">
                        {sup.overdueLeads > 0 ? <span className="text-sm font-semibold text-amber-600">{sup.overdueLeads}</span> : <span className="text-sm">0</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sup.convertedThisMonth > 0 ? <span className="text-sm font-semibold text-emerald-600">{sup.convertedThisMonth}</span> : <span className="text-sm">0</span>}
                      </td>
                      {isAdminOrAbove && (
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {sup.status !== "disabled" && (
                                <>
                                  {sup.status === "invited" && <DropdownMenuItem onClick={() => handleReinvite(sup.user_id)}>Re-send Invite</DropdownMenuItem>}
                                  {sup.status !== "invited" && sup.user_id !== user?.id && <DropdownMenuItem onClick={() => handleReinvite(sup.user_id)}>Reset Password</DropdownMenuItem>}
                                  <DropdownMenuItem onClick={() => handleRoleChange(sup.user_id, "admin")}>Set as Admin</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(sup.user_id, "team_member")}>Set as Team Member</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDisable(sup.user_id)} className="text-destructive">Disable Access</DropdownMenuItem>
                                </>
                              )}
                              {sup.status === "disabled" && <DropdownMenuItem onClick={() => handleReactivate(sup.user_id)}>Reactivate</DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>,
                    ...(isExpanded ? teamUnder.map(m => renderMemberRow(m, 1)) : []),
                  ];
                })}

                {/* Unassigned team members */}
                {unassignedMembers.length > 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-2 bg-muted/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unassigned Team Members</span>
                    </td>
                  </tr>
                )}
                {unassignedMembers.map(m => renderMemberRow(m))}
              </tbody>
            </table>
          </div>
        </div>

        {isAdminOrAbove && (
          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Hierarchy:</strong> Assign team members to supervisors using the Actions menu → "Assign Supervisor". Supervisors report to Admin and can view only their assigned team members.
            </p>
          </div>
        )}
      </div>

      {/* Invite modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Full Name</label>
              <Input value={inviteForm.full_name} onChange={(e) => setInviteForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Nikita Sharma" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Work Email</label>
              <Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} placeholder="nikita@sankash.in" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Role</label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="team_supervisor">Team Supervisor</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteForm.role === "team_member" && supervisorOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Reports To (Supervisor)</label>
                <Select value={inviteForm.supervisor_id} onValueChange={(v) => setInviteForm((p) => ({ ...p, supervisor_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supervisor (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {supervisorOptions.map(s => (
                      <SelectItem key={s.user_id} value={s.user_id}>{s.full_name ?? s.user_id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleInvite} className="w-full" disabled={inviting}>
              {inviting ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending invite…</> : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials modal */}
      <Dialog open={!!credentialsModal} onOpenChange={() => setCredentialsModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Temporary Login Credentials</DialogTitle>
          </DialogHeader>
          {credentialsModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share these credentials privately with <strong>{credentialsModal.name}</strong>. They can change the password later using Forgot password.
              </p>
              <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <p className="text-sm font-mono select-all">{credentialsModal.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Temporary Password</label>
                  <p className="text-sm font-mono font-bold select-all">{credentialsModal.password}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Login URL</label>
                  <p className="text-sm font-mono select-all text-primary">https://www.sankash.in/ops/login</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `SanKash Ops Login Credentials\n\nLogin URL: https://www.sankash.in/ops/login\nEmail: ${credentialsModal.email}\nPassword: ${credentialsModal.password}\n\nPlease change your password after first login using Forgot Password.`
                    );
                    toast.success("Credentials copied to clipboard");
                  }}
                >
                  Copy All
                </Button>
                <Button className="flex-1" onClick={() => setCredentialsModal(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </OpsLayout>
  );
};

export default OpsTeamManagement;
