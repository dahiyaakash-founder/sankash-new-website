import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const INVITE_RECOVERY_FLAG = "ops-invite-recovery";

const readAuthError = () => {
  const candidates = [window.location.search, window.location.hash]
    .map((value) => value.replace(/^[?#]/, ""))
    .filter(Boolean);

  for (const candidate of candidates) {
    const params = new URLSearchParams(candidate);
    const message = params.get("error_description") || params.get("error");
    if (message) return decodeURIComponent(message.replace(/\+/g, " "));
  }

  return "";
};

const OpsAcceptInvite = () => {
  const navigate = useNavigate();
  const { refreshAccess } = useAuth();
  const [status, setStatus] = useState<"loading" | "set_password" | "error" | "success">("loading");
  const [pkceFailure, setPkceFailure] = useState(false);
  const [rereqEmail, setRereqEmail] = useState("");
  const [rereqSending, setRereqSending] = useState(false);
  const [rereqSent, setRereqSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    const markRecoveryReady = () => window.sessionStorage.setItem(INVITE_RECOVERY_FLAG, "ready");
    const clearRecoveryReady = () => window.sessionStorage.removeItem(INVITE_RECOVERY_FLAG);
    const hasRecoveryReady = () => window.sessionStorage.getItem(INVITE_RECOVERY_FLAG) === "ready";

    let el = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", "noindex, nofollow");

    const syncSession = async (sessionOverride?: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      const session = sessionOverride ?? (await supabase.auth.getSession()).data.session;
      if (!mounted) return false;

      if (session?.user && hasRecoveryReady()) {
        console.info("[ops-invite] activation session ready", { userId: session.user.id });
        setStatus("set_password");
        return true;
      }

      return false;
    };

    // Helper: check existing session and allow password form for invited OR active users
    const tryExistingSession = async (reason: string) => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("user_id", existingSession.user.id)
          .maybeSingle();

        if (profile?.status === "invited" || profile?.status === "active") {
          console.info(`[ops-invite] ${reason}, profile status: ${profile?.status}, showing password form`);
          if (profile?.status === "active") setIsPasswordReset(true);
          markRecoveryReady();
          return true;
        }
      }
      return false;
    };

    const bootstrapInviteSession = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const recoveryType = hashParams.get("type") || url.searchParams.get("type");
      const hasRecoveryParams = Boolean(code || (accessToken && refreshToken) || recoveryType === "recovery");

      if (!hasRecoveryParams) {
        await tryExistingSession("no recovery params, checking existing session");
        return;
      }

      try {
        clearRecoveryReady();
        await supabase.auth.signOut({ scope: "local" });

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            // PKCE code_verifier mismatch (opened in different browser/tab)
            console.warn("[ops-invite] code exchange failed (likely PKCE mismatch), trying session fallback", error.message);
            const recovered = await tryExistingSession("PKCE fallback after code exchange failure");
            if (!recovered) {
              // Don't dead-end — show re-request form
              setPkceFailure(true);
              setErrorMsg("This link was opened in a different browser or app than where you requested it. Request a fresh link below to continue.");
              setStatus("error");
              url.searchParams.delete("code");
              url.searchParams.delete("type");
              window.history.replaceState({}, "", `${url.pathname}${url.search}`);
              return;
            }
            url.searchParams.delete("code");
            url.searchParams.delete("type");
            window.history.replaceState({}, "", `${url.pathname}${url.search}`);
            return;
          }
          markRecoveryReady();
          url.searchParams.delete("code");
          url.searchParams.delete("type");
          window.history.replaceState({}, "", `${url.pathname}${url.search}`);
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          markRecoveryReady();
          window.history.replaceState({}, "", url.pathname);
          return;
        }

        if (recoveryType === "recovery") {
          markRecoveryReady();
        }
      } catch (error: any) {
        console.error("[ops-invite] session bootstrap failed", error);
        clearRecoveryReady();
        setPkceFailure(true);
        setErrorMsg("This link could not be verified. Request a fresh link below, or go back to login and use Forgot password.");
        setStatus("error");
      }
    };

    const authError = readAuthError();
    if (authError) {
      clearRecoveryReady();
      setErrorMsg(authError);
      setStatus("error");
      return () => {
        mounted = false;
      };
    }

    void bootstrapInviteSession().then(() => {
      void syncSession();
    });

    const timer = window.setInterval(async () => {
      attempts += 1;
      const hasSession = await syncSession();

      if (hasSession || attempts >= 20) {
        window.clearInterval(timer);
        if (!hasSession && mounted) {
          clearRecoveryReady();
          setPkceFailure(true);
          setErrorMsg("This link could not be verified. Request a fresh link below, or go back to login and use Forgot password.");
          setStatus("error");
        }
      }
    }, 500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.info("[ops-invite] auth event", { event, hasSession: Boolean(session) });
      if (event === "PASSWORD_RECOVERY") {
        markRecoveryReady();
        setIsPasswordReset(true);
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "PASSWORD_RECOVERY") && session && hasRecoveryReady()) {
        window.clearInterval(timer);
        setStatus("set_password");
      }
    });

    return () => {
      mounted = false;
      window.clearInterval(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleRerequestReset = async () => {
    if (!rereqEmail.trim()) {
      setErrorMsg("Enter your work email to receive a fresh reset link.");
      return;
    }
    setRereqSending(true);
    setErrorMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(rereqEmail.trim(), {
      redirectTo: `${window.location.origin}/ops/accept-invite`,
    });
    setRereqSending(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setRereqSent(true);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("Session expired. Please go back to login and use Forgot password to get a fresh link.");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Only call activate for invited users (skip for active users doing password reset)
      if (!isPasswordReset) {
        const activation = await supabase.functions.invoke("team-management", {
          body: { action: "activate" },
        });
        if (activation.error) throw activation.error;
        if (activation.data?.error) throw new Error(activation.data.error);
      }

      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) throw signOutError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (signInError) {
        throw new Error("Password was set, but sign-in could not be completed. Use Forgot password or the latest invite link again.");
      }

      await refreshAccess();
      window.sessionStorage.removeItem(INVITE_RECOVERY_FLAG);

      setStatus("success");
      toast.success("Password set successfully!");
      window.setTimeout(() => navigate("/ops/dashboard", { replace: true }), 1200);
    } catch (err: any) {
      console.error("[ops-invite] activation failed", err);
      setErrorMsg(err.message || "Failed to set password");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={28} />
          <p className="text-sm text-muted-foreground">Preparing your access…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="text-destructive" size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-heading font-bold text-foreground">
              {pkceFailure ? "Link opened in wrong browser" : "Link expired"}
            </h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
          {pkceFailure && !rereqSent && (
            <div className="space-y-3 p-4 rounded-xl border bg-card text-left">
              <label className="text-xs font-medium">Your work email</label>
              <Input
                type="email"
                value={rereqEmail}
                onChange={(e) => setRereqEmail(e.target.value)}
                placeholder="you@sankash.in"
              />
              <Button className="w-full" onClick={handleRerequestReset} disabled={rereqSending}>
                {rereqSending ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending…</> : "Send fresh reset link"}
              </Button>
            </div>
          )}
          {rereqSent && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-primary font-medium">Fresh link sent! Check your email and open the link in this browser.</p>
            </div>
          )}
          <Button variant="outline" onClick={() => navigate("/ops/login")} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="text-primary" size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-heading font-bold text-foreground">You're all set</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to the ops dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isPasswordReset ? "Reset Your Password" : "Activate SanKash Ops"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPasswordReset ? "Enter a new password for your account" : "Create your password to finish setup"}
          </p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4 p-6 rounded-2xl border bg-card">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
            />
          </div>

          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving…</> : (isPasswordReset ? "Reset Password & Continue" : "Set Password & Continue")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OpsAcceptInvite;
