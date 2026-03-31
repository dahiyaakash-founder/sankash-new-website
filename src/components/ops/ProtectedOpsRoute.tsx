import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const ProtectedOpsRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, hasRole, profileStatus } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (!user) return <Navigate to="/ops/login" replace />;
  if (profileStatus === "invited") return <Navigate to="/ops/accept-invite" replace />;
  if (!hasRole) return <Navigate to="/ops/login" replace />;

  return <>{children}</>;
};

export default ProtectedOpsRoute;
