import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type SetupStatusResponse = { hasAdmin: boolean };

type AdminGuestGuardProps = {
  children: React.ReactNode;
  mode: "login" | "setup";
};

export default function AdminGuestGuard({ children, mode }: AdminGuestGuardProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    api.get("/auth/setup-status")
      .then((res: SetupStatusResponse) => setAdminExists(res.hasAdmin))
      .catch((err) => {
        console.error("Failed to check setup status:", err);
        setAdminExists(true);
      });
  }, []);

  if (isLoading || adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (mode === "login" && !adminExists) {
    return <Navigate to="/admin/setup" replace />;
  }

  if (mode === "setup" && adminExists) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
