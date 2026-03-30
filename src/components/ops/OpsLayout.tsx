import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Shield } from "lucide-react";

const OpsLayout = ({ children }: { children: ReactNode }) => {
  const { user, role, signOut } = useAuth();
  const location = useLocation();

  // Team page visible only to super_admin and admin
  const canSeeTeam = role === "super_admin" || role === "admin";

  const navItems = [
    { to: "/ops/dashboard", label: "Dashboard", icon: LayoutDashboard, visible: true },
    { to: "/ops/leads", label: "Leads", icon: Users, visible: true },
    { to: "/ops/team", label: "Team", icon: Shield, visible: canSeeTeam },
  ].filter((i) => i.visible);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-6">
            <Link to="/ops/dashboard" className="font-heading font-bold text-base text-foreground">
              SanKash <span className="text-primary">Ops</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={location.pathname.startsWith(item.to) ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{user?.email}</span>
              {role && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
                  {role.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-xs">
              <LogOut size={14} /> Sign out
            </Button>
          </div>
        </div>
        <nav className="flex md:hidden items-center gap-1 px-4 pb-2">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname.startsWith(item.to) ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 text-xs"
              >
                <item.icon size={14} />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </header>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
};

export default OpsLayout;
