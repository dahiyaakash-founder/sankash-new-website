import { useState, useEffect } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const OpsLogin = () => {
  const location = useLocation();
  const { user, loading, hasRole, signIn, profileStatus } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [noAdmin, setNoAdmin] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data }) => {
      if (!data) setNoAdmin(true);
    });
    // Noindex for internal ops pages
    let el = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", "robots"); document.head.appendChild(el); }
    el.setAttribute("content", "noindex, nofollow");
  }, []);

  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
  const hasRecoveryParams = Boolean(
    searchParams.get("code") ||
    hashParams.get("access_token") ||
    hashParams.get("refresh_token") ||
    searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery",
  );

  if (hasRecoveryParams) {
    return <Navigate to={`/ops/accept-invite${location.search}${location.hash}`} replace />;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (user && profileStatus === "invited") return <Navigate to="/ops/accept-invite" replace />;
  if (user && hasRole) return <Navigate to="/ops/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetSent(false);

    if (!email.trim()) {
      setError("Enter your work email first, then use Forgot password.");
      return;
    }

    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/ops/accept-invite`,
    });
    setResetting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">SanKash Ops</h1>
          <p className="text-sm text-muted-foreground">Internal team dashboard</p>
        </div>
        {noAdmin && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
            <p className="text-sm text-foreground font-medium">No admin account exists yet</p>
            <Link to="/ops/setup">
              <Button variant="outline-primary" size="sm">Set up first admin</Button>
            </Link>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border bg-card">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@sankash.in" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {resetSent && <p className="text-xs text-primary">Reset link sent. Open it to set a new password, then sign in again.</p>}
          {user && !hasRole && (
            <p className="text-xs text-destructive">
              Your account is signed in, but CRM access is not ready yet. Ask an admin to send a fresh invite or confirm your role.
            </p>
          )}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {resetting ? "Sending reset link…" : "Forgot password?"}
          </button>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Signing in…</> : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OpsLogin;
