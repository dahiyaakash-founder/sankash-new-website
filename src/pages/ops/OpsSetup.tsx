import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";

const OpsSetup = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data }) => {
      setAdminExists(!!data);
      setChecking(false);
    });
  }, []);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (adminExists) return <Navigate to="/ops/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("User creation failed");

      // 2. Assign admin role via bootstrap function
      const { data: bootstrapped, error: rpcError } = await supabase.rpc("bootstrap_first_admin", {
        _user_id: signUpData.user.id,
      });

      if (rpcError) throw rpcError;
      if (!bootstrapped) {
        setError("An admin already exists. Redirecting to login…");
        setTimeout(() => navigate("/ops/login"), 1500);
        return;
      }

      // 3. Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      navigate("/ops/dashboard");
    } catch (err: any) {
      setError(err.message || "Setup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <ShieldCheck className="text-primary" size={36} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">First Admin Setup</h1>
          <p className="text-sm text-muted-foreground">
            No admin account exists yet. Create the first admin to access SanKash Ops.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border bg-card">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@sankash.in" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Creating admin…</> : "Create Admin & Sign In"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          This page is only available once. After the first admin is created, it will be disabled.
        </p>
      </div>
    </div>
  );
};

export default OpsSetup;
