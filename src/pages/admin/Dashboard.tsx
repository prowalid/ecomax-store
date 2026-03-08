import { Loader2 } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";

const statusMap: Record<string, { label: string; variant: "info" | "warning" | "default" | "success" | "destructive" | "purple" | "muted" }> = {
  new: { label: "جديد", variant: "info" },
  attempt: { label: "محاولة اتصال", variant: "purple" },
  no_answer: { label: "لا يجيب", variant: "muted" },
  confirmed: { label: "مؤكد", variant: "warning" },
  cancelled: { label: "ملغي", variant: "muted" },
  ready: { label: "جاهز للشحن", variant: "default" },
  shipped: { label: "مشحون", variant: "default" },
  delivered: { label: "مسلّم", variant: "success" },
  returned: { label: "مرتجع", variant: "destructive" },
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

const Dashboard = () => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const isLoading = ordersLoading || productsLoading;

  const totalSales = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const newOrders = orders.filter((o) => o.status === "new").length;
  const confirmedCount = orders.filter((o) => ["confirmed", "ready", "shipped", "delivered"].includes(o.status)).length;
  const confirmRate = orders.length > 0 ? Math.round((confirmedCount / orders.length) * 100) : 0;
  const avgOrder = orders.length > 0 ? Math.round(orders.reduce((s, o) => s + Number(o.total), 0) / orders.length) : 0;

  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">الرئيسية</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المبيعات" value={formatPrice(totalSales)} change="" changeType="neutral" subtitle="الطلبات المسلّمة" />
        <StatCard title="الطلبات الجديدة" value={String(newOrders)} change="" changeType="neutral" subtitle="بانتظار المعالجة" />
        <StatCard title="نسبة التأكيد" value={`${confirmRate}%`} change="" changeType="neutral" subtitle={`من ${orders.length} طلب`} />
        <StatCard title="متوسط قيمة الطلب" value={formatPrice(avgOrder)} change="" changeType="neutral" subtitle="جميع الطلبات" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-card border border-border animate-slide-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">آخر الطلبات</h2>
            <a href="/admin/orders" className="text-xs text-primary hover:underline font-medium">عرض الكل</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الطلب</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">التاريخ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الزبون</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">المبلغ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const s = statusMap[order.status] || { label: order.status, variant: "default" };
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3"><span className="text-sm font-medium text-primary">#{order.order_number}</span></td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{order.customer_name}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{formatPrice(Number(order.total))}</td>
                      <td className="px-5 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">لا توجد طلبات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border animate-slide-in">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">المنتجات النشطة</h2>
          </div>
          <div className="divide-y divide-border">
            {products.filter((p) => p.status === "active").slice(0, 5).map((product) => (
              <div key={product.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.stock} في المخزون</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatPrice(Number(product.price))}</span>
              </div>
            ))}
            {products.filter((p) => p.status === "active").length === 0 && (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">لا توجد منتجات نشطة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
