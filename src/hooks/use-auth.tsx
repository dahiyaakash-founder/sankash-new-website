import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "team_supervisor" | "team_member";

interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasRole: boolean;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | undefined>(undefined);

const ROLE_PRIORITY: AppRole[] = ["super_admin", "admin", "team_supervisor", "team_member"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);

  const resolveRole = async (userId: string) => {
    for (const r of ROLE_PRIORITY) {
      const { data } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: r as any,
      });
      if (data) {
        setRole(r);
        setHasRole(true);
        setLoading(false);
        return;
      }
    }
    setRole(null);
    setHasRole(false);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => resolveRole(session.user.id), 0);
      } else {
        setHasRole(false);
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, hasRole, role, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
