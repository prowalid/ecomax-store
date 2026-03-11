import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type SetupStatusResponse = { hasAdmin: boolean };

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if an admin exists to know whether to show setup or login
    api.get('/auth/setup-status')
      .then((res: SetupStatusResponse) => setAdminExists(res.hasAdmin))
      .catch((err) => {
        console.error('Failed to check setup status:', err);
        setAdminExists(true); // Default to true for safety
      });
  }, []);

  if (isLoading || adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!adminExists) {
    return <Navigate to="/admin/setup" replace />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
