import { ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

const recentOrders = [
  { id: "#1234", customer: "أحمد بن علي", wilaya: "الجزائر", total: "4,500 د.ج", status: "جديد", statusColor: "bg-primary" },
  { id: "#1233", customer: "فاطمة زهراء", wilaya: "وهران", total: "3,200 د.ج", status: "مؤكد", statusColor: "bg-warning" },
  { id: "#1232", customer: "محمد كريم", wilaya: "قسنطينة", total: "7,800 د.ج", status: "مشحون", statusColor: "bg-info" },
  { id: "#1231", customer: "سارة بوعلام", wilaya: "سطيف", total: "2,100 د.ج", status: "مسلم", statusColor: "bg-success" },
  { id: "#1230", customer: "يوسف حداد", wilaya: "باتنة", total: "5,600 د.ج", status: "مرتجع", statusColor: "bg-destructive" },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة القيادة</h1>
        <p className="text-muted-foreground text-sm mt-1">مرحباً بك! إليك ملخص أداء متجرك اليوم</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المبيعات"
          value="127,500 د.ج"
          change="↑ 12.5% مقارنة بالأمس"
          changeType="positive"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="الطلبات الجديدة"
          value="34"
          change="↑ 8 طلبات عن الأمس"
          changeType="positive"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard
          title="نسبة التأكيد"
          value="67%"
          change="↓ 3% عن الأسبوع الماضي"
          changeType="negative"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="الزوار اليوم"
          value="1,240"
          change="مستقر"
          changeType="neutral"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg shadow-card border border-border animate-fade-in">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">آخر الطلبات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الطلب</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الزبون</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الولاية</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">المبلغ</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="p-4 text-sm text-foreground">{order.customer}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.wilaya}</td>
                  <td className="p-4 text-sm font-semibold text-foreground">{order.total}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-primary-foreground ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
