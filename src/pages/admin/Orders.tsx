import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "new" | "attempt" | "no_answer" | "confirmed" | "cancelled" | "ready" | "shipped" | "delivered" | "returned";

interface Order {
  id: string;
  customer: string;
  phone: string;
  wilaya: string;
  commune: string;
  total: string;
  items: number;
  status: OrderStatus;
  date: string;
  delivery: "home" | "desk";
  attempts?: number;
  note?: string;
}

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

// Status flow: what statuses can transition to
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

const initialOrders: Order[] = [
  { id: "#1234", customer: "أحمد بن علي", phone: "0555 12 34 56", wilaya: "الجزائر", commune: "بئر مراد رايس", total: "4,500 د.ج", items: 2, status: "new", date: "اليوم، 14:30", delivery: "home" },
  { id: "#1233", customer: "فاطمة زهراء", phone: "0661 23 45 67", wilaya: "وهران", commune: "وهران المدينة", total: "3,200 د.ج", items: 1, status: "new", date: "اليوم، 13:15", delivery: "desk" },
  { id: "#1232", customer: "محمد كريم", phone: "0770 12 34 56", wilaya: "قسنطينة", commune: "قسنطينة", total: "7,800 د.ج", items: 3, status: "attempt", date: "أمس، 18:00", delivery: "home", attempts: 1 },
  { id: "#1231", customer: "سارة بوعلام", phone: "0550 98 76 54", wilaya: "سطيف", commune: "سطيف المدينة", total: "2,100 د.ج", items: 1, status: "no_answer", date: "أمس، 10:20", delivery: "desk", attempts: 3 },
  { id: "#1230", customer: "يوسف حداد", phone: "0660 11 22 33", wilaya: "باتنة", commune: "باتنة", total: "5,600 د.ج", items: 2, status: "confirmed", date: "منذ يومين", delivery: "home" },
  { id: "#1229", customer: "نور الهدى", phone: "0771 22 33 44", wilaya: "بجاية", commune: "بجاية", total: "1,800 د.ج", items: 1, status: "ready", date: "منذ يومين", delivery: "home" },
  { id: "#1228", customer: "كمال بوزيد", phone: "0550 33 44 55", wilaya: "تيزي وزو", commune: "تيزي وزو", total: "9,200 د.ج", items: 4, status: "shipped", date: "منذ 3 أيام", delivery: "desk" },
  { id: "#1227", customer: "أمينة سعيدي", phone: "0661 44 55 66", wilaya: "عنابة", commune: "عنابة", total: "3,400 د.ج", items: 1, status: "delivered", date: "منذ 3 أيام", delivery: "home" },
  { id: "#1226", customer: "رضا بلقاسم", phone: "0770 55 66 77", wilaya: "بليدة", commune: "بليدة", total: "6,100 د.ج", items: 2, status: "returned", date: "منذ 4 أيام", delivery: "home" },
  { id: "#1225", customer: "مريم خالدي", phone: "0555 66 77 88", wilaya: "الجزائر", commune: "الدار البيضاء", total: "2,800 د.ج", items: 1, status: "cancelled", date: "منذ 4 أيام", delivery: "desk", note: "الزبون ألغى" },
];

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.customer.includes(search) || o.id.includes(search) || o.phone.includes(search);
    const matchFilter = activeFilter === "all" || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filtered.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered.map((o) => o.id));
    }
  };

  const getFilterCount = (status: OrderStatus) => orders.filter((o) => o.status === status).length;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الطلبات</h1>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
          تصدير
        </button>
      </div>

      {/* Status tabs - scrollable */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-thin pb-px">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            activeFilter === "all"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
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

      {/* Search bar */}
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
          <span className="text-sm text-foreground font-medium">
            {selectedOrders.length} طلب محدد
          </span>
          <div className="flex items-center gap-2 mr-auto flex-wrap">
            {allStatuses.filter(s => s !== "cancelled").map((status) => (
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
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
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
            لا توجد طلبات مطابقة
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderRowProps {
  order: Order;
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
        className={cn(
          "border-b border-border transition-colors cursor-pointer",
          isSelected ? "bg-primary/5" : "hover:bg-muted/40"
        )}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-input accent-primary"
          />
        </td>
        <td className="px-4 py-3">
          <span className="text-sm font-medium text-primary">{order.id}</span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{order.date}</td>
        <td className="px-4 py-3 text-sm text-foreground">{order.customer}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{order.wilaya}</td>
        <td className="px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {order.delivery === "home" ? "🏠 منزل" : "🏢 مكتب"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-foreground">{order.total}</td>
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
                  <span dir="ltr">{order.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{order.commune}، {order.wilaya}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">المنتجات</p>
                <p className="text-sm text-foreground">{order.items} منتج</p>
              </div>
              {order.attempts !== undefined && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">محاولات الاتصال</p>
                  <p className="text-sm text-foreground">{order.attempts} محاولة</p>
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
