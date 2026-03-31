import { useState, useEffect, createContext, useContext, type ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "team_supervisor" | "team_member";

interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasRole: boolean;
  role: AppRole | null;
  profileStatus: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | undefined>(undefined);

const ROLE_PRIORITY: AppRole[] = ["super_admin", "admin", "team_supervisor", "team_member"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  const resolveAccess = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setHasRole(false);
      setRole(null);
      setProfileStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [profileResult, roleResults] = await Promise.all([
        supabase.from("profiles").select("status").eq("user_id", nextUser.id).maybeSingle(),
        Promise.all(
          ROLE_PRIORITY.map(async (candidate) => {
            const { data } = await supabase.rpc("has_role", {
              _user_id: nextUser.id,
              _role: candidate as any,
            });

            return data ? candidate : null;
          }),
        ),
      ]);

      const resolvedRole = roleResults.find(Boolean) ?? null;
      setProfileStatus(profileResult.data?.status ?? null);
      setRole(resolvedRole);
      setHasRole(Boolean(resolvedRole));
    } catch (error) {
      console.error("[ops-auth] access resolution failed", error);
      setProfileStatus(null);
      setRole(null);
      setHasRole(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      void resolveAccess(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      void resolveAccess(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resolveAccess]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshAccess = async () => {
    await resolveAccess(user);
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, hasRole, role, profileStatus, signIn, signOut, refreshAccess }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
