import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AdminAuditLogEntry {
  id: string;
  actorUserId: string | null;
  actorPhone: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  requestId: string | null;
  ipAddress: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

export function useAdminAuditLog(limit = 12) {
  return useQuery({
    queryKey: ["admin-audit-log", limit],
    queryFn: async () => {
      const data = await api.get(`/analytics/audit-log?limit=${limit}`);
      return data as AdminAuditLogEntry[];
    },
  });
}
