import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.rpc("admin_count").then(({ data }) => {
      setAdminExists((data ?? 0) > 0);
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
