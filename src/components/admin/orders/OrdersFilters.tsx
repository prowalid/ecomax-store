import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/hooks/useOrders";

import { allOrderStatuses, orderStatusConfig } from "./constants";

interface OrdersFiltersProps {
  activeFilter: OrderStatus | "all";
  search: string;
  totalCount: number;
  getFilterCount: (status: OrderStatus) => number;
  onFilterChange: (status: OrderStatus | "all") => void;
  onSearchChange: (value: string) => void;
}

export default function OrdersFilters({
  activeFilter,
  search,
  totalCount,
  getFilterCount,
  onFilterChange,
  onSearchChange,
}: OrdersFiltersProps) {
  return (
    <>
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin pb-px">
        <button
          onClick={() => onFilterChange("all")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            activeFilter === "all"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          الكل <span className="text-xs text-muted-foreground mr-1">({totalCount})</span>
        </button>
        {allOrderStatuses.map((status) => {
          const config = orderStatusConfig[status];
          const count = getFilterCount(status);
          return (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                activeFilter === status
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {config.label} <span className="text-xs text-muted-foreground mr-1">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الطلب، الهاتف، IP أو رقم التتبع..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>
      </div>
    </>
  );
}
