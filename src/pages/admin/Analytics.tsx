import StatCard from "@/components/admin/StatCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const Analytics = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalytics();

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل التحليلات" description="نسترجع مؤشرات المتجر المبنية على بيانات الخادم." />;
  }

  if (isError || !data) {
    return (
      <AdminDataState
        type="error"
        title="تعذر تحميل التحليلات"
        description={error instanceof Error ? error.message : "تعذر تحميل التحليلات"}
        actionLabel="إعادة المحاولة"
        actionDisabled={isFetching}
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  const statusLabels: Record<string, string> = {
    new: "جديد", attempt: "محاولة اتصال", no_answer: "لا يجيب", confirmed: "مؤكد",
    cancelled: "ملغي", ready: "جاهز للشحن", shipped: "مشحون", delivered: "مسلّم", returned: "مرتجع",
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="التحليلات"
        description="لوحة مؤشرات تشغيلية واضحة تساعدك على فهم المبيعات، المخزون، والزبائن بسرعة."
        meta="محدّثة من الخادم"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الإيرادات" value={formatPrice(data.sales.totalRevenue)} change="" changeType="neutral" subtitle="الطلبات المسلّمة" />
        <StatCard title="إيرادات آخر 30 يوم" value={formatPrice(data.sales.monthRevenue)} change="" changeType="neutral" subtitle="من الطلبات المسلّمة" />
        <StatCard title="نسبة التأكيد" value={`${data.orders.confirmRate}%`} change="" changeType="neutral" subtitle={`من ${data.orders.total} طلب`} />
        <StatCard title="متوسط قيمة الطلب" value={formatPrice(data.sales.avgDeliveredOrderValue)} change="" changeType="neutral" subtitle="للطلبات المسلّمة" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="طلبات اليوم" value={String(data.orders.today)} change="" changeType="neutral" subtitle="بتوقيت الجزائر" />
        <StatCard title="طلبات الأسبوع" value={String(data.orders.week)} change="" changeType="neutral" subtitle="آخر 7 أيام" />
        <StatCard title="طلبات الشهر" value={String(data.orders.month)} change="" changeType="neutral" subtitle="آخر 30 يوم" />
        <StatCard title="نسبة الإلغاء" value={`${data.orders.cancelRate}%`} change="" changeType="neutral" subtitle="من إجمالي الطلبات" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order status breakdown */}
        <div className="bg-card rounded-[20px] shadow-card border border-border p-5 animate-slide-in">
          <h3 className="text-base font-semibold text-foreground mb-4">توزيع حالات الطلبات</h3>
          <div className="space-y-2">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = data.orders.statusBreakdown[key as keyof typeof data.orders.statusBreakdown] || 0;
              const pct = data.orders.total > 0 ? Math.round((count / data.orders.total) * 100) : 0;
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
          <div className="bg-card rounded-[20px] shadow-card border border-border p-5 animate-slide-in">
            <h3 className="text-base font-semibold text-foreground mb-3">المنتجات</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{data.products.active}</p>
                <p className="text-xs text-muted-foreground">نشط</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{data.products.lowStock}</p>
                <p className="text-xs text-muted-foreground">مخزون منخفض</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{data.products.outOfStock}</p>
                <p className="text-xs text-muted-foreground">نفذ المخزون</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[20px] shadow-card border border-border p-5 animate-slide-in">
            <h3 className="text-base font-semibold text-foreground mb-3">الزبائن</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{data.customers.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي الزبائن</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data.customers.newLast30Days}</p>
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
