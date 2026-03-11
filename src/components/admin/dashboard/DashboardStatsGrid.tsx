import { DollarSign, PackageOpen, TrendingUp, Users2 } from "lucide-react";

import StatCard from "@/components/admin/StatCard";

interface DashboardStatsGridProps {
  totalSales: number;
  deliveredOrders: number;
  totalOrders: number;
  confirmRate: number;
  newOrders: number;
  avgOrder: number;
}

const formatPrice = (value: number) => `${value.toLocaleString("ar-DZ")} د.ج`;

export default function DashboardStatsGrid({
  totalSales,
  deliveredOrders,
  totalOrders,
  confirmRate,
  newOrders,
  avgOrder,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        title="اجمالي المبيعات"
        value={formatPrice(totalSales)}
        change={`${deliveredOrders} طلبات مسلّمة`}
        changeType="neutral"
        subtitle=""
        variant="red"
        icon={<DollarSign className="w-6 h-6" />}
      />
      <StatCard
        title="إجمالي الطلبات"
        value={String(totalOrders)}
        change={`${confirmRate}% معدل التأكيد`}
        changeType="neutral"
        subtitle=""
        variant="orange"
        icon={<PackageOpen className="w-6 h-6" />}
      />
      <StatCard
        title="الطلبات الجديدة"
        value={String(newOrders)}
        change="بانتظار المعالجة"
        changeType="neutral"
        subtitle=""
        variant="green"
        icon={<Users2 className="w-6 h-6" />}
      />
      <StatCard
        title="متوسط سلة المشتريات"
        value={formatPrice(avgOrder)}
        change="للطلبات المسلّمة"
        changeType="neutral"
        subtitle=""
        variant="purple"
        icon={<TrendingUp className="w-6 h-6" />}
      />
    </div>
  );
}
