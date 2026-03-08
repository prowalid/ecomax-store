import { Loader2 } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const Analytics = () => {
  const { data: orders = [], isLoading: ol } = useOrders();
  const { data: products = [], isLoading: pl } = useProducts();
  const { data: customers = [], isLoading: cl } = useCustomers();

  if (ol || pl || cl) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr));
  const weekOrders = orders.filter((o) => new Date(o.created_at) >= weekAgo);
  const monthOrders = orders.filter((o) => new Date(o.created_at) >= monthAgo);

  const delivered = orders.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((s, o) => s + Number(o.total), 0);
  const monthRevenue = delivered.filter((o) => new Date(o.created_at) >= monthAgo).reduce((s, o) => s + Number(o.total), 0);

  const confirmRate = orders.length > 0
    ? Math.round((orders.filter((o) => ["confirmed", "ready", "shipped", "delivered"].includes(o.status)).length / orders.length) * 100)
    : 0;

  const cancelRate = orders.length > 0
    ? Math.round((orders.filter((o) => o.status === "cancelled").length / orders.length) * 100)
    : 0;

  const avgOrder = delivered.length > 0
    ? Math.round(delivered.reduce((s, o) => s + Number(o.total), 0) / delivered.length)
    : 0;

  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const statusLabels: Record<string, string> = {
    new: "جديد", attempt: "محاولة اتصال", no_answer: "لا يجيب", confirmed: "مؤكد",
    cancelled: "ملغي", ready: "جاهز للشحن", shipped: "مشحون", delivered: "مسلّم", returned: "مرتجع",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">التحليلات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">تحليلات أداء المتجر — بيانات حقيقية</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الإيرادات" value={formatPrice(totalRevenue)} change="" changeType="neutral" subtitle="الطلبات المسلّمة" />
        <StatCard title="إيرادات الشهر" value={formatPrice(monthRevenue)} change="" changeType="neutral" subtitle="آخر 30 يوم" />
        <StatCard title="نسبة التأكيد" value={`${confirmRate}%`} change="" changeType="neutral" subtitle={`من ${orders.length} طلب`} />
        <StatCard title="متوسط قيمة الطلب" value={formatPrice(avgOrder)} change="" changeType="neutral" subtitle="الطلبات المسلّمة" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="طلبات اليوم" value={String(todayOrders.length)} change="" changeType="neutral" subtitle={todayStr} />
        <StatCard title="طلبات الأسبوع" value={String(weekOrders.length)} change="" changeType="neutral" subtitle="آخر 7 أيام" />
        <StatCard title="طلبات الشهر" value={String(monthOrders.length)} change="" changeType="neutral" subtitle="آخر 30 يوم" />
        <StatCard title="نسبة الإلغاء" value={`${cancelRate}%`} change="" changeType="neutral" subtitle="من إجمالي الطلبات" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order status breakdown */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 animate-slide-in">
          <h3 className="text-base font-semibold text-foreground mb-4">توزيع حالات الطلبات</h3>
          <div className="space-y-2">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = statusCounts[key] || 0;
              const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-28">{label}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-left">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Products & customers summary */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-5 animate-slide-in">
            <h3 className="text-base font-semibold text-foreground mb-3">المنتجات</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{activeProducts}</p>
                <p className="text-xs text-muted-foreground">نشط</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{lowStock}</p>
                <p className="text-xs text-muted-foreground">مخزون منخفض</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{outOfStock}</p>
                <p className="text-xs text-muted-foreground">نفذ المخزون</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5 animate-slide-in">
            <h3 className="text-base font-semibold text-foreground mb-3">الزبائن</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-xs text-muted-foreground">إجمالي الزبائن</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {customers.filter((c) => new Date(c.created_at) >= monthAgo).length}
                </p>
                <p className="text-xs text-muted-foreground">جدد هذا الشهر</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
