import { useState, useEffect, createContext, useContext, type ReactNode, useCallback, useRef } from "react";
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

  // Cache resolved role per user to avoid re-fetching on token refresh
  const resolvedCache = useRef<{ userId: string; role: AppRole | null; profileStatus: string | null } | null>(null);

  const resolveAccess = useCallback(async (nextUser: User | null, forceRefresh = false) => {
    if (!nextUser) {
      resolvedCache.current = null;
      setHasRole(false);
      setRole(null);
      setProfileStatus(null);
      setLoading(false);
      return;
    }

    // If we already resolved for this user, use cache (skip on force refresh)
    if (!forceRefresh && resolvedCache.current?.userId === nextUser.id) {
      setRole(resolvedCache.current.role);
      setHasRole(Boolean(resolvedCache.current.role));
      setProfileStatus(resolvedCache.current.profileStatus);
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
      const status = profileResult.data?.status ?? null;

      // Cache the result
      resolvedCache.current = { userId: nextUser.id, role: resolvedRole, profileStatus: status };

      setProfileStatus(status);
      setRole(resolvedRole);
      setHasRole(Boolean(resolvedRole));
    } catch (error) {
      console.error("[ops-auth] access resolution failed", error);
      // On error, preserve existing cached role instead of forcing logout
      if (resolvedCache.current?.userId === nextUser.id) {
        console.log("[ops-auth] using cached role after error");
        setRole(resolvedCache.current.role);
        setHasRole(Boolean(resolvedCache.current.role));
        setProfileStatus(resolvedCache.current.profileStatus);
      } else {
        // First-time resolution failed — no cache to fall back on
        setProfileStatus(null);
        setRole(null);
        setHasRole(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      // Only do full role resolution on sign-in or initial; skip for token refresh
      if (event === "TOKEN_REFRESHED") {
        // Token refreshed — session is still valid, no need to re-resolve roles
        return;
      }

      window.setTimeout(() => {
        if (!mounted) return;
        void resolveAccess(session?.user ?? null);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      window.setTimeout(() => {
        if (!mounted) return;
        void resolveAccess(session?.user ?? null);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resolveAccess]);

  const signIn = async (email: string, password: string) => {
    // Clear cache on new sign-in
    resolvedCache.current = null;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    resolvedCache.current = null;
    await supabase.auth.signOut();
  };

  const refreshAccess = async () => {
    await resolveAccess(user, true);
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
