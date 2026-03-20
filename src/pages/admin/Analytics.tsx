import StatCard from "@/components/admin/StatCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import {
  DollarSign, TrendingUp, PackageOpen, ShoppingCart, Users2,
  CheckCircle2, XCircle, Truck, RefreshCcw, Clock, BarChart3, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const formatAuditAction = (action: string) =>
  action.split(".").filter(Boolean).join(" / ");

const formatAuditTime = (value: string) =>
  new Intl.DateTimeFormat("ar-DZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "جديد", color: "bg-blue-400", icon: Clock },
  attempt: { label: "محاولة اتصال", color: "bg-amber-400", icon: RefreshCcw },
  no_answer: { label: "لا يجيب", color: "bg-orange-400", icon: XCircle },
  confirmed: { label: "مؤكد", color: "bg-emerald-400", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-rose-400", icon: XCircle },
  ready: { label: "جاهز للشحن", color: "bg-violet-400", icon: PackageOpen },
  shipped: { label: "مشحون", color: "bg-sky-400", icon: Truck },
  delivered: { label: "مسلّم", color: "bg-green-400", icon: CheckCircle2 },
  returned: { label: "مرتجع", color: "bg-red-400", icon: RefreshCcw },
};

const SECTION_CARD = "bg-white rounded-[24px] shadow-sm border border-slate-100 p-6";

const Analytics = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalytics();
  const { data: auditLog, isLoading: auditLoading, isError: auditError } = useAdminAuditLog();

  if (isLoading) {
    return (
      <AdminDataState
        type="loading"
        title="جاري تحميل التحليلات"
        description="نسترجع مؤشرات المتجر المبنية على بيانات الخادم."
      />
    );
  }

  if (isError || !data) {
    return (
      <AdminDataState
        type="error"
        title="تعذر تحميل التحليلات"
        description={error instanceof Error ? error.message : "تعذر تحميل التحليلات"}
        actionLabel="إعادة المحاولة"
        actionDisabled={isFetching}
        onAction={() => { void refetch(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="التحليلات"
        description="مؤشرات تشغيلية واضحة تساعدك على فهم المبيعات، المخزون، والزبائن."
        meta="محدّثة من الخادم"
      />

      {/* Revenue stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatPrice(data.sales.totalRevenue)}
          change={`${data.orders.delivered} طلب مسلّم`}
          changeType="neutral"
          variant="green"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="إيرادات آخر 30 يوم"
          value={formatPrice(data.sales.monthRevenue)}
          change="من الطلبات المسلّمة"
          changeType="neutral"
          variant="blue"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="نسبة التأكيد"
          value={`${data.orders.confirmRate}%`}
          change={`من ${data.orders.total} طلب`}
          changeType={data.orders.confirmRate >= 60 ? "positive" : "negative"}
          variant="purple"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={formatPrice(data.sales.avgDeliveredOrderValue)}
          change="للطلبات المسلّمة"
          changeType="neutral"
          variant="orange"
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      {/* Time-based order stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="طلبات اليوم" value={String(data.orders.today)} change="بتوقيت الجزائر" changeType="neutral" />
        <StatCard title="طلبات الأسبوع" value={String(data.orders.week)} change="آخر 7 أيام" changeType="neutral" />
        <StatCard title="طلبات الشهر" value={String(data.orders.month)} change="آخر 30 يوم" changeType="neutral" />
        <StatCard
          title="نسبة الإلغاء"
          value={`${data.orders.cancelRate}%`}
          change="من إجمالي الطلبات"
          changeType={data.orders.cancelRate > 20 ? "negative" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order status breakdown */}
        <div className={SECTION_CARD}>
          <h3 className="text-[16px] font-black text-sidebar-heading mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            توزيع حالات الطلبات
          </h3>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = data.orders.statusBreakdown?.[key as keyof typeof data.orders.statusBreakdown] || 0;
              const pct = data.orders.total > 0 ? Math.round((count / data.orders.total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-slate-600 w-24 shrink-0">{cfg.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", cfg.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-slate-500 font-medium w-16 text-left shrink-0">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Products & Customers */}
        <div className="space-y-4">
          <div className={SECTION_CARD}>
            <h3 className="text-[16px] font-black text-sidebar-heading mb-4 flex items-center gap-2">
              <PackageOpen className="w-4 h-4 text-primary" />
              المنتجات
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-[22px] font-black text-emerald-600">{data.products.active}</p>
                <p className="text-[11px] font-semibold text-emerald-500 mt-1">نشط</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <p className="text-[22px] font-black text-amber-500">{data.products.lowStock}</p>
                <p className="text-[11px] font-semibold text-amber-400 mt-1">مخزون منخفض</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3">
                <p className="text-[22px] font-black text-rose-500">{data.products.outOfStock}</p>
                <p className="text-[11px] font-semibold text-rose-400 mt-1">نفذ المخزون</p>
              </div>
            </div>
          </div>

          <div className={SECTION_CARD}>
            <h3 className="text-[16px] font-black text-sidebar-heading mb-4 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-primary" />
              الزبائن
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[22px] font-black text-sidebar-heading">{data.customers.total}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">إجمالي الزبائن</p>
              </div>
              <div className="rounded-2xl bg-primary/5 p-3">
                <p className="text-[22px] font-black text-primary">{data.customers.newLast30Days}</p>
                <p className="text-[11px] font-semibold text-primary/60 mt-1">جدد هذا الشهر</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className={SECTION_CARD}>
        <h3 className="text-[16px] font-black text-sidebar-heading mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          سجل التعديلات الإدارية
        </h3>
        <p className="text-[13px] text-slate-500 font-medium mb-5">
          آخر العمليات الحساسة التي نُفذت داخل الإدارة.
        </p>

        {auditLoading ? (
          <p className="text-[13px] text-slate-400 font-medium">جاري تحميل السجل...</p>
        ) : auditError ? (
          <p className="text-[13px] text-rose-500 font-medium">تعذر تحميل سجل التعديلات.</p>
        ) : !auditLog || auditLog.length === 0 ? (
          <p className="text-[13px] text-slate-400 font-medium">لا توجد عمليات إدارية مسجلة بعد.</p>
        ) : (
          <div className="space-y-2">
            {auditLog.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-[16px] border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-[13px] font-bold text-sidebar-heading">
                    {formatAuditAction(entry.action)}
                  </p>
                  <p className="text-[12px] text-slate-400 font-medium">
                    الكيان: {entry.entityType}
                    {entry.entityId ? ` • ${entry.entityId}` : ""}
                    {" • "}المنفذ: {entry.actorPhone || "مدير"}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 font-medium sm:text-right shrink-0">
                  {formatAuditTime(entry.createdAt)}
                  {entry.requestId ? (
                    <p className="text-[10px] text-slate-300">req: {entry.requestId}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
