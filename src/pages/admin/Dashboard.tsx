import { useAnalytics } from "@/hooks/useAnalytics";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import ActiveProductsCard from "@/components/admin/dashboard/ActiveProductsCard";
import DashboardStatsGrid from "@/components/admin/dashboard/DashboardStatsGrid";
import RecentOrdersCard from "@/components/admin/dashboard/RecentOrdersCard";
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

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل لوحة التحكم" description="يتم جمع مؤشرات المبيعات والطلبات والمنتجات." />;
  }

  if (analyticsError || !analytics) {
    return (
      <AdminDataState
        type="error"
        title="تعذر تحميل مؤشرات لوحة التحكم"
        description={error instanceof Error ? error.message : "تعذر تحميل مؤشرات لوحة التحكم"}
        actionLabel="إعادة المحاولة"
        actionDisabled={isFetching}
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="لوحة التحكم"
        description="نظرة تنفيذية سريعة على المبيعات، الطلبات، والمنتجات الأكثر أهمية اليوم."
        meta={`آخر ${recentOrders.length} طلبات`}
      />

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
