import { useEffect, useState } from "react";
import OpsLayout from "@/components/ops/OpsLayout";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, User, Inbox, UserPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
}

const OpsTeamManagement = () => {
  const { user, role: currentUserRole } = useAuth();
  const isSuperAdmin = currentUserRole === "super_admin";

  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "team_member" });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Fetch roles
      const { data: roles } = await supabase.from("user_roles").select("*");
      // Fetch profiles
      const { data: profiles } = await supabase.from("profiles" as any).select("*") as any;

      const profileMap: Record<string, { full_name: string; status: string }> = {};
      (profiles ?? []).forEach((p: any) => {
        profileMap[p.user_id] = { full_name: p.full_name, status: p.status };
      });

      const merged: TeamMemberRow[] = (roles ?? []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
        full_name: profileMap[r.user_id]?.full_name,
        status: profileMap[r.user_id]?.status ?? "active",
        email: r.user_id === user?.id ? user?.email ?? undefined : undefined,
      }));

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
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("team-management", {
        body: {
          action: "invite",
          email: inviteForm.email,
          full_name: inviteForm.full_name,
          role: inviteForm.role,
        },
      });
      if (res.error) throw new Error(res.error.message || "Invite failed");
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Invited ${inviteForm.full_name}`);
      setInviteOpen(false);
      setInviteForm({ full_name: "", email: "", role: "team_member" });
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Invite failed");
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

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold">Team Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSuperAdmin
                ? "Invite members, assign roles, and manage access."
                : "View team members and their roles."}
            </p>
          </div>
          {isSuperAdmin && (
            <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
              <UserPlus size={14} /> Invite Member
            </Button>
          )}
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                {isSuperAdmin && (
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={24} className="text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No team members found</p>
                    </div>
                  </td>
                </tr>
              )}
              {members.map((m) => {
                const isYou = m.user_id === user?.id;
                const displayName = m.full_name ?? m.email ?? m.user_id.slice(0, 8) + "…";
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
                          {displayEmail && (
                            <span className="text-[11px] text-muted-foreground">{displayEmail}</span>
                          )}
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
                    {isSuperAdmin && (
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
                                  <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "admin")}>
                                    Set as Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "team_supervisor")}>
                                    Set as Supervisor
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(m.user_id, "team_member")}>
                                    Set as Team Member
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDisable(m.user_id)} className="text-destructive">
                                    Disable Access
                                  </DropdownMenuItem>
                                </>
                              )}
                              {isDisabled && (
                                <DropdownMenuItem onClick={() => handleReactivate(m.user_id)}>
                                  Reactivate
                                </DropdownMenuItem>
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

        {isSuperAdmin && (
          <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Invite flow:</strong> Invited members receive an email to set their password. Once activated, they can log in at <code>/ops/login</code>.
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
              <Input
                value={inviteForm.full_name}
                onChange={(e) => setInviteForm((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Lakshay Sharma"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Work Email</label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="lakshay@sankash.in"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Role</label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) => setInviteForm((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
    </OpsLayout>
  );
};

export default OpsTeamManagement;
