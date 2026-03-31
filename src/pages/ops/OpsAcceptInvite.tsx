import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [status, setStatus] = useState<"loading" | "set_password" | "error" | "success">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

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

      if (session?.user) {
        console.info("[ops-invite] activation session ready", { userId: session.user.id });
        setStatus("set_password");
        return true;
      }

      return false;
    };

    const authError = readAuthError();
    if (authError) {
      setErrorMsg(authError);
      setStatus("error");
      return () => {
        mounted = false;
      };
    }

    const timer = window.setInterval(async () => {
      attempts += 1;
      const hasSession = await syncSession();

      if (hasSession || attempts >= 12) {
        window.clearInterval(timer);
        if (!hasSession && mounted) {
          setErrorMsg("This activation link is invalid or has expired. Ask your admin for a fresh invite.");
          setStatus("error");
        }
      }
    }, 500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.info("[ops-invite] auth event", { event, hasSession: Boolean(session) });
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "PASSWORD_RECOVERY") && session) {
        window.clearInterval(timer);
        setStatus("set_password");
      }
    });

    void syncSession();

    return () => {
      mounted = false;
      window.clearInterval(timer);
      subscription.unsubscribe();
    };
  }, []);

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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const activation = await supabase.functions.invoke("team-management", {
        body: { action: "activate" },
      });

      if (activation.error) throw activation.error;
      if (activation.data?.error) throw new Error(activation.data.error);

      setStatus("success");
      toast.success("Password set successfully!");
      window.setTimeout(() => navigate("/ops/dashboard", { replace: true }), 1200);
    } catch (err: any) {
      console.error("[ops-invite] activation failed", err);
      setErrorMsg(err.message || "Failed to activate account");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={28} />
          <p className="text-sm text-muted-foreground">Preparing your CRM access…</p>
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
            <h1 className="text-xl font-heading font-bold text-foreground">Activation link expired</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/ops/login")}>
            Go to Login
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
            <h1 className="text-xl font-heading font-bold text-foreground">You’re all set</h1>
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Activate SanKash Ops</h1>
          <p className="text-sm text-muted-foreground">Create your password to finish setup</p>
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
            {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Activating…</> : "Set Password & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OpsAcceptInvite;