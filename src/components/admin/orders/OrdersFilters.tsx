import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/hooks/useOrders";

import { allOrderStatuses, orderStatusConfig } from "./constants";

interface OrdersFiltersProps {
  activeFilter: OrderStatus | "all";
  search: string;
  totalCount?: number;
  hasActiveFilters: boolean;
  getFilterCount: (status: OrderStatus) => number | undefined;
  onFilterChange: (status: OrderStatus | "all") => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function OrdersFilters({
  activeFilter,
  search,
  totalCount,
  hasActiveFilters,
  getFilterCount,
  onFilterChange,
  onSearchChange,
  onResetFilters,
}: OrdersFiltersProps) {
  return (
    <>
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin pb-px">
        <button
          onClick={() => onFilterChange("all")}
          data-testid="orders-filter-all"
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            activeFilter === "all"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          الكل {totalCount !== undefined && <span className="text-xs text-muted-foreground mr-1">({totalCount})</span>}
        </button>
        {allOrderStatuses.map((status) => {
          const config = orderStatusConfig[status];
          const count = getFilterCount(status);
          return (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              data-testid={`orders-filter-${status}`}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                activeFilter === status
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {config.label} {count !== undefined && <span className="text-xs text-muted-foreground mr-1">({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الطلب، الهاتف، IP أو رقم التتبع..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="orders-search-input"
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeFilter !== "all" && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              الفلتر الحالي: {orderStatusConfig[activeFilter].label}
            </span>
          )}
          {search.trim() && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              بحث: {search.trim()}
            </span>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              تصفير الفلاتر
            </button>
          )}
        </div>
      </div>
    </>
  );
}
