import { useEffect, useState } from "react";
import OpsLayout from "@/components/ops/OpsLayout";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchLeads } from "@/lib/leads-service";
import { Loader2, Shield, User, Inbox, UserPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
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

      // Try to get emails for all users via auth if we're super_admin
      // Otherwise fall back to profile names
      let emailMap: Record<string, string> = {};
      if (user?.email) {
        emailMap[user.id] = user.email;
      }

      // Get lead stats per member
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
        },
      });
      if (res.error) {
        const msg = typeof res.error === "object" && "message" in res.error
          ? (res.error as any).message
          : String(res.error);
        throw new Error(msg || "Invite failed");
      }
      if (res.data?.error) {
        // Handle specific known errors
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

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  const supervisors = members.filter(m => m.role === "team_supervisor" || m.role === "admin" || m.role === "super_admin");

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold">Team Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdminOrAbove ? "Manage team members, roles, and assignments." : "View team members and their roles."}
            </p>
          </div>
          {isAdminOrAbove && (
            <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
              <UserPlus size={14} /> Invite Member
            </Button>
          )}
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
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
                    <td colSpan={isAdminOrAbove ? 7 : 6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox size={24} className="text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No team members found</p>
                      </div>
                    </td>
                  </tr>
                )}
                {members.map((m) => {
                  const isYou = m.user_id === user?.id;
                  const displayName = m.full_name || m.email || `Team member`;
                  const displayEmail = isYou ? user?.email : m.email;
                  const isDisabled = m.status === "disabled";
                  const isInvited = m.status === "invited";
                  const isMemberSuperAdmin = m.role === "super_admin";

                  return (
                    <tr key={m.id} className={`border-b last:border-0 ${isDisabled ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                            <User size={13} className="text-accent-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{displayName}</span>
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
                                    <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "admin")}>Set as Admin</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "team_supervisor")}>Set as Supervisor</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "team_member")}>Set as Team Member</DropdownMenuItem>
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        {isAdminOrAbove && (
          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Invite flow:</strong> When you invite a member, a temporary password is generated. Share it with them privately. They can change it later from Forgot password.
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
