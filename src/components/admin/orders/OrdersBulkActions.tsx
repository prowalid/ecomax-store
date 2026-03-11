import type { OrderStatus } from "@/hooks/useOrders";

import { allOrderStatuses, orderStatusConfig } from "./constants";

interface OrdersBulkActionsProps {
  count: number;
  onApplyStatus: (status: OrderStatus) => void;
}

export default function OrdersBulkActions({ count, onApplyStatus }: OrdersBulkActionsProps) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5 animate-slide-in">
      <span className="text-sm text-foreground font-medium">{count} طلب محدد</span>
      <div className="flex items-center gap-2 mr-auto flex-wrap">
        {allOrderStatuses
          .filter((status) => status !== "cancelled")
          .map((status) => (
            <button
              key={status}
              onClick={() => onApplyStatus(status)}
              className="text-xs px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent transition-colors"
            >
              → {orderStatusConfig[status].label}
            </button>
          ))}
      </div>
    </div>
  );
}
