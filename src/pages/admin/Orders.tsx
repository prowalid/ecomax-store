import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, MapPin, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders, useUpdateOrderStatus, type OrderStatus } from "@/hooks/useOrders";

const statusConfig: Record<OrderStatus, { label: string; variant: "info" | "warning" | "default" | "success" | "destructive" | "muted" | "purple" | "pink" | "secondary" }> = {
  new: { label: "جديد", variant: "info" },
  attempt: { label: "محاولة اتصال", variant: "purple" },
  no_answer: { label: "لا يجيب", variant: "pink" },
  confirmed: { label: "مؤكد", variant: "warning" },
  cancelled: { label: "ملغي", variant: "muted" },
  ready: { label: "جاهز للشحن", variant: "secondary" },
  shipped: { label: "مشحون", variant: "default" },
  delivered: { label: "مسلّم", variant: "success" },
  returned: { label: "مرتجع", variant: "destructive" },
};

const allStatuses: OrderStatus[] = ["new", "attempt", "no_answer", "confirmed", "cancelled", "ready", "shipped", "delivered", "returned"];

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  new: ["attempt", "confirmed", "cancelled"],
  attempt: ["no_answer", "confirmed", "cancelled"],
  no_answer: ["attempt", "confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  cancelled: [],
  ready: ["shipped"],
  shipped: ["delivered", "returned"],
  delivered: [],
  returned: [],
};

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return `اليوم، ${d.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}`;
  if (days === 1) return "أمس";
  return `منذ ${days} أيام`;
};

const Orders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.customer_name.includes(search) || String(o.order_number).includes(search) || o.customer_phone.includes(search);
    const matchFilter = activeFilter === "all" || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      updateStatus.mutate({ id, status: newStatus, order });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filtered.length) setSelectedOrders([]);
    else setSelectedOrders(filtered.map((o) => o.id));
  };

  const getFilterCount = (status: OrderStatus) => orders.filter((o) => o.status === status).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الطلبات</h1>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
          تصدير
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin pb-px">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            activeFilter === "all" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          الكل <span className="text-xs text-muted-foreground mr-1">({orders.length})</span>
        </button>
        {allStatuses.map((status) => {
          const config = statusConfig[status];
          const count = getFilterCount(status);
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                activeFilter === status ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {config.label} <span className="text-xs text-muted-foreground mr-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم، أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5 animate-slide-in">
          <span className="text-sm text-foreground font-medium">{selectedOrders.length} طلب محدد</span>
          <div className="flex items-center gap-2 mr-auto flex-wrap">
            {allStatuses.filter((s) => s !== "cancelled").map((status) => (
              <button
                key={status}
                onClick={() => {
                  selectedOrders.forEach((id) => handleStatusChange(id, status));
                  setSelectedOrders([]);
                }}
                className="text-xs px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent transition-colors"
              >
                → {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-slide-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selectedOrders.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-input accent-primary" />
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الطلب</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">التاريخ</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الزبون</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الولاية</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">التوصيل</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">المبلغ</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الحالة</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const s = statusConfig[order.status];
              const isExpanded = expandedOrder === order.id;
              const isSelected = selectedOrders.includes(order.id);
              const nextStatuses = statusFlow[order.status];

              return (
                <OrderRow
                  key={order.id}
                  order={order}
                  statusLabel={s.label}
                  statusVariant={s.variant}
                  isExpanded={isExpanded}
                  isSelected={isSelected}
                  nextStatuses={nextStatuses}
                  onToggleExpand={() => setExpandedOrder(isExpanded ? null : order.id)}
                  onToggleSelect={() => toggleSelect(order.id)}
                  onStatusChange={handleStatusChange}
                />
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد طلبات مطابقة"}
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderRowProps {
  order: any;
  statusLabel: string;
  statusVariant: string;
  isExpanded: boolean;
  isSelected: boolean;
  nextStatuses: OrderStatus[];
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

const OrderRow = ({ order, statusLabel, statusVariant, isExpanded, isSelected, nextStatuses, onToggleExpand, onToggleSelect, onStatusChange }: OrderRowProps) => {
  return (
    <>
      <tr
        className={cn("border-b border-border transition-colors cursor-pointer", isSelected ? "bg-primary/5" : "hover:bg-muted/40")}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="w-4 h-4 rounded border-input accent-primary" />
        </td>
        <td className="px-4 py-3">
          <span className="text-sm font-medium text-primary">#{order.order_number}</span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(order.created_at)}</td>
        <td className="px-4 py-3 text-sm text-foreground">{order.customer_name}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{order.wilaya || "—"}</td>
        <td className="px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {order.delivery_type === "home" ? "🏠 منزل" : "🏢 مكتب"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
        <td className="px-4 py-3">
          <Badge variant={statusVariant as any}>{statusLabel}</Badge>
        </td>
        <td className="px-4 py-3">
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/20 animate-slide-in">
          <td colSpan={9} className="px-6 py-4">
            <div className="flex items-start gap-8 flex-wrap">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">معلومات الاتصال</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span dir="ltr">{order.customer_phone}</span>
                </div>
                {(order.commune || order.wilaya) && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{[order.commune, order.wilaya].filter(Boolean).join("، ")}</span>
                  </div>
                )}
              </div>
              {order.call_attempts > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">محاولات الاتصال</p>
                  <p className="text-sm text-foreground">{order.call_attempts} محاولة</p>
                </div>
              )}
              {order.note && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">ملاحظة</p>
                  <p className="text-sm text-foreground">{order.note}</p>
                </div>
              )}
              {nextStatuses.length > 0 && (
                <div className="mr-auto flex items-center gap-2 flex-wrap">
                  {nextStatuses.map((ns) => (
                    <button
                      key={ns}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(order.id, ns);
                      }}
                      className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 transition-opacity"
                    >
                      {statusConfig[ns].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default Orders;
