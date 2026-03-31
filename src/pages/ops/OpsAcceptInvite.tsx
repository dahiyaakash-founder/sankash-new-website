import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const OpsAcceptInvite = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "set_password" | "error" | "success">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Noindex
    let el = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", "robots"); document.head.appendChild(el); }
    el.setAttribute("content", "noindex, nofollow");

    // Check if user arrived via an invite/recovery link
    // Supabase puts tokens in the URL hash after redirect
    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is authenticated via the invite link — show password form
        setStatus("set_password");
      } else {
        // Check URL hash for error
        const hash = window.location.hash;
        if (hash.includes("error")) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const errorDesc = params.get("error_description") || "Invite link is invalid or has expired";
          setErrorMsg(errorDesc.replace(/\+/g, " "));
          setStatus("error");
        } else {
          // No session and no error — wait for auth state change
          setStatus("loading");
        }
      }
    };

    // Listen for auth state changes (invite link auto-signs in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("set_password");
      } else if (event === "TOKEN_REFRESHED" && session) {
        setStatus("set_password");
      }
    });

    handleAuthChange();

    return () => subscription.unsubscribe();
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

      // Update profile status from "invited" to "active"
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ status: "active" } as any).eq("user_id", user.id);
      }

      setStatus("success");
      toast.success("Password set successfully!");

      // Redirect to ops dashboard after a moment
      setTimeout(() => navigate("/ops/dashboard", { replace: true }), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to set password");
    }
    setSubmitting(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={28} />
          <p className="text-sm text-muted-foreground">Verifying your invite…</p>
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
            <h1 className="text-xl font-heading font-bold text-foreground">Invite Link Expired</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Ask your admin to send a new invite from the Team Management page.
            </p>
            <Button variant="outline" onClick={() => navigate("/ops/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-heading font-bold text-foreground">You're all set!</h1>
            <p className="text-sm text-muted-foreground">Redirecting to the dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">Welcome to SanKash Ops</h1>
          <p className="text-sm text-muted-foreground">Set your password to activate your account</p>
        </div>
        <form onSubmit={handleSetPassword} className="space-y-4 p-6 rounded-2xl border bg-card">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 8 characters"
              minLength={8}
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
            {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Setting password…</> : "Set Password & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OpsAcceptInvite;
