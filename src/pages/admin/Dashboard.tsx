import { Link } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import ActiveProductsCard from "@/components/admin/dashboard/ActiveProductsCard";
import DashboardStatsGrid from "@/components/admin/dashboard/DashboardStatsGrid";
import RecentOrdersCard from "@/components/admin/dashboard/RecentOrdersCard";
import DashboardQuickActionsBar from "@/components/admin/dashboard/DashboardQuickActionsBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";

const Dashboard = () => {
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    error,
    refetch,
    isFetching,
  } = useAnalytics();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const isLoading = analyticsLoading || ordersLoading || productsLoading;

  const recentOrders = orders.slice(0, 5);
  const activeProducts = products.filter((p) => p.status === "active").slice(0, 5);

  // Operational alerts
  const outOfStockProducts = products.filter((p) => p.status === "active" && p.stock === 0);
  const lowStockProducts = products.filter((p) => p.status === "active" && p.stock > 0 && p.stock <= 5);
  const pendingOrders = orders.filter((o) => o.status === "new");

  if (isLoading) {
    return (
      <AdminDataState
        type="loading"
        title="جاري تحميل لوحة التحكم"
        description="يتم جمع مؤشرات المبيعات والطلبات والمنتجات."
      />
    );
  }

  if (analyticsError || !analytics) {
    return (
      <AdminDataState
        type="error"
        title="تعذر تحميل مؤشرات لوحة التحكم"
        description={error instanceof Error ? error.message : "تعذر تحميل مؤشرات لوحة التحكم"}
        actionLabel="إعادة المحاولة"
        actionDisabled={isFetching}
        onAction={() => { void refetch(); }}
      />
    );
  }

  const hasAlerts = outOfStockProducts.length > 0 || pendingOrders.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="لوحة التحكم"
        description="نظرة تنفيذية سريعة على المبيعات، الطلبات، والمنتجات."
        meta={`آخر ${recentOrders.length} طلبات`}
        actions={<DashboardQuickActionsBar />}
      />

      {/* Operational alerts */}
      {hasAlerts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pendingOrders.length > 0 && (
            <Link
              to="/admin/orders?status=new"
              className="flex items-center gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 hover:bg-amber-100/70 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[13px] font-black text-amber-800">
                  {pendingOrders.length} طلب{pendingOrders.length > 1 ? " جديدة" : ""} بانتظار المعالجة
                </p>
                <p className="text-[11px] text-amber-600 font-medium">اضغط للانتقال إلى الطلبات</p>
              </div>
            </Link>
          )}
          {outOfStockProducts.length > 0 && (
            <Link
              to="/admin/products"
              className="flex items-center gap-3 rounded-[18px] border border-rose-200 bg-rose-50 px-5 py-4 hover:bg-rose-100/70 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <p className="text-[13px] font-black text-rose-700">
                  {outOfStockProducts.length} منتج نفذ مخزونه
                  {lowStockProducts.length > 0 && ` • ${lowStockProducts.length} منخفض`}
                </p>
                <p className="text-[11px] text-rose-500 font-medium">اضغط لعرض المنتجات</p>
              </div>
            </Link>
          )}
        </div>
      )}

      <DashboardStatsGrid
        totalSales={analytics.sales.totalRevenue}
        deliveredOrders={analytics.orders.delivered}
        totalOrders={analytics.orders.total}
        confirmRate={analytics.orders.confirmRate}
        newOrders={analytics.orders.new}
        avgOrder={analytics.sales.avgDeliveredOrderValue}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentOrdersCard orders={recentOrders} />
        <ActiveProductsCard products={activeProducts} />
      </div>
    </div>
  );
};

export default Dashboard;
