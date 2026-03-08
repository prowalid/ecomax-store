import { useState } from "react";
import { GripVertical, Phone, MapPin } from "lucide-react";

type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "returned";

interface Order {
  id: string;
  customer: string;
  phone: string;
  wilaya: string;
  commune: string;
  total: string;
  products: string;
  status: OrderStatus;
  date: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: "جديد", color: "text-primary-foreground", bg: "bg-primary" },
  confirmed: { label: "مؤكد", color: "text-warning-foreground", bg: "bg-warning" },
  shipped: { label: "مشحون", color: "text-info-foreground", bg: "bg-primary/80" },
  delivered: { label: "مُسلّم", color: "text-success-foreground", bg: "bg-success" },
  returned: { label: "مرتجع", color: "text-destructive-foreground", bg: "bg-destructive" },
};

const initialOrders: Order[] = [
  { id: "#1234", customer: "أحمد بن علي", phone: "0555123456", wilaya: "الجزائر", commune: "بئر مراد رايس", total: "4,500 د.ج", products: "حذاء رياضي × 1", status: "new", date: "اليوم 14:30" },
  { id: "#1233", customer: "فاطمة زهراء", phone: "0661234567", wilaya: "وهران", commune: "وهران المدينة", total: "3,200 د.ج", products: "تيشرت × 2", status: "new", date: "اليوم 13:15" },
  { id: "#1232", customer: "محمد كريم", phone: "0770123456", wilaya: "قسنطينة", commune: "قسنطينة", total: "7,800 د.ج", products: "ساعة ذكية × 1", status: "confirmed", date: "أمس 18:00" },
  { id: "#1231", customer: "سارة بوعلام", phone: "0550987654", wilaya: "سطيف", commune: "سطيف المدينة", total: "2,100 د.ج", products: "وشاح × 3", status: "shipped", date: "أمس 10:20" },
  { id: "#1230", customer: "يوسف حداد", phone: "0660112233", wilaya: "باتنة", commune: "باتنة", total: "5,600 د.ج", products: "حقيبة ظهر × 1", status: "delivered", date: "منذ يومين" },
  { id: "#1229", customer: "نور الهدى", phone: "0771223344", wilaya: "بجاية", commune: "بجاية", total: "1,800 د.ج", products: "قميص × 1", status: "returned", date: "منذ 3 أيام" },
];

const OrderCard = ({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => void }) => {
  const statuses: OrderStatus[] = ["new", "confirmed", "shipped", "delivered", "returned"];
  const currentIndex = statuses.indexOf(order.status);
  const nextStatus = statuses[currentIndex + 1];

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-card hover:shadow-elevated transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-primary">{order.id}</span>
        <span className="text-xs text-muted-foreground">{order.date}</span>
      </div>
      <h4 className="font-semibold text-sm text-foreground mb-2">{order.customer}</h4>
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="w-3 h-3" />
          <span dir="ltr">{order.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{order.wilaya} - {order.commune}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{order.products}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{order.total}</span>
        {nextStatus && (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[nextStatus].bg} ${statusConfig[nextStatus].color} hover:opacity-90 transition-opacity`}
          >
            ← {statusConfig[nextStatus].label}
          </button>
        )}
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const columns: OrderStatus[] = ["new", "confirmed", "shipped", "delivered", "returned"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground text-sm mt-1">إجمالي {orders.length} طلبات</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4 overflow-x-auto">
        {columns.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          const config = statusConfig[status];
          return (
            <div key={status} className="min-w-[240px]">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-3 h-3 rounded-full ${config.bg}`} />
                <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {columnOrders.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
                {columnOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                    لا توجد طلبات
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
