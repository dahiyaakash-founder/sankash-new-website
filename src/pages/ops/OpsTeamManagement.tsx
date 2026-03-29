import { useEffect, useState } from "react";
import OpsLayout from "@/components/ops/OpsLayout";
import { fetchTeamMembers } from "@/lib/leads-service";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, User, Inbox } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  team_member: "Team Member",
};

const OpsTeamManagement = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const m = await fetchTeamMembers();
      setMembers(m);
      // Try to get emails via auth admin (will only work for the current user)
      const emailMap: Record<string, string> = {};
      if (user) {
        emailMap[user.id] = user.email ?? user.id.slice(0, 8) + "…";
      }
      setProfiles(emailMap);
    } catch { /* */ }
    setLoading(false);
  };

  if (loading) return <OpsLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div></OpsLayout>;

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-heading font-bold">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">View team members and their roles. Contact your admin to add or update roles.</p>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={24} className="text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No team members found</p>
                    </div>
                  </td>
                </tr>
              )}
              {members.map((m) => {
                const isYou = m.user_id === user?.id;
                const displayName = isYou ? (user?.email ?? "You") : (profiles[m.user_id] ?? m.user_id.slice(0, 8) + "…");
                return (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                          <User size={13} className="text-accent-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{displayName}</span>
                          {isYou && <span className="text-[10px] text-primary font-semibold ml-1.5">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${m.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Shield size={10} />
                        {roleLabels[m.role] ?? m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-emerald-600 font-medium">Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> To add new team members, create their account and assign a role through the backend. Role changes require admin access.
          </p>
        </div>
      </div>
    </OpsLayout>
  );
};

export default OpsTeamManagement;
