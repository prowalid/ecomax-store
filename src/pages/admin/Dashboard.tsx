import StatCard from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { ArrowUpLeft, Eye, MoreHorizontal } from "lucide-react";

const recentOrders = [
  { id: "#1234", customer: "أحمد بن علي", date: "اليوم، 14:30", total: "4,500 د.ج", items: 2, status: "new" as const, payment: "COD" },
  { id: "#1233", customer: "فاطمة زهراء", date: "اليوم، 13:15", total: "3,200 د.ج", items: 1, status: "attempt" as const, payment: "COD" },
  { id: "#1232", customer: "محمد كريم", date: "أمس، 18:00", total: "7,800 د.ج", items: 3, status: "confirmed" as const, payment: "COD" },
  { id: "#1231", customer: "سارة بوعلام", date: "أمس، 10:20", total: "2,100 د.ج", items: 1, status: "shipped" as const, payment: "COD" },
  { id: "#1230", customer: "يوسف حداد", date: "منذ يومين", total: "5,600 د.ج", items: 2, status: "delivered" as const, payment: "COD" },
];

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

const topProducts = [
  { name: "حذاء رياضي Nike Air", sold: 34, revenue: "153,000 د.ج" },
  { name: "ساعة ذكية GT3 Pro", sold: 28, revenue: "218,400 د.ج" },
  { name: "تيشرت قطن ممتاز", sold: 22, revenue: "35,200 د.ج" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">الرئيسية</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المبيعات"
          value="127,500 د.ج"
          change="↑ 12.5%"
          changeType="positive"
          subtitle="مقارنة بالأمس"
        />
        <StatCard
          title="الطلبات"
          value="34"
          change="↑ 8"
          changeType="positive"
          subtitle="طلب جديد"
        />
        <StatCard
          title="نسبة التأكيد"
          value="67%"
          change="↓ 3%"
          changeType="negative"
          subtitle="هذا الأسبوع"
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value="3,750 د.ج"
          change="—"
          changeType="neutral"
          subtitle="ثابت"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders - takes 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-lg shadow-card border border-border animate-slide-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">آخر الطلبات</h2>
            <a href="/admin/orders" className="text-xs text-primary hover:underline font-medium">
              عرض الكل
            </a>
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
                  const s = statusMap[order.status];
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-primary">{order.id}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{order.date}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{order.customer}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{order.total}</td>
                      <td className="px-5 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card rounded-lg shadow-card border border-border animate-slide-in">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">أفضل المنتجات</h2>
          </div>
          <div className="divide-y divide-border">
            {topProducts.map((product, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.sold} مبيعة</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{product.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
