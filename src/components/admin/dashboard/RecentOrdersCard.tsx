import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Order } from "@/hooks/useOrders";

import { orderStatusConfig } from "@/components/admin/orders/constants";
import { formatOrderPrice, formatOrderRelativeDate } from "@/components/admin/orders/utils";

interface RecentOrdersCardProps {
  orders: Order[];
}

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <div className="xl:col-span-2 bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-bold text-sidebar-heading">آخر الطلبات</h2>
        <Link
          to="/admin/orders"
          className="text-[13px] text-primary font-bold hover:bg-primary/10 transition-colors flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-xl"
        >
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-right" dir="rtl">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="text-[13px] font-semibold text-slate-400 pb-4 font-sans"># الطلب</th>
              <th className="text-[13px] font-semibold text-slate-400 pb-4 font-sans">التاريخ</th>
              <th className="text-[13px] font-semibold text-slate-400 pb-4 font-sans">الاسم</th>
              <th className="text-[13px] font-semibold text-slate-400 pb-4 font-sans text-center">الحالة</th>
              <th className="text-[13px] font-semibold text-slate-400 pb-4 font-sans text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const status = orderStatusConfig[order.status];
              return (
                <tr key={order.id} className={cn("group transition-colors", idx !== orders.length - 1 && "border-b border-slate-50")}>
                  <td className="py-4">
                    <span className="text-sm font-bold text-sidebar-heading">#{order.order_number}</span>
                  </td>
                  <td className="py-4 text-[13px] text-slate-500 font-medium">{formatOrderRelativeDate(order.created_at)}</td>
                  <td className="py-4 text-[13px] text-sidebar-heading font-semibold">{order.customer_name}</td>
                  <td className="py-4 text-center">
                    <Badge variant={status.variant} className="rounded-full px-3 py-1 font-bold shadow-none border-none text-[11px]">
                      {status.label}
                    </Badge>
                  </td>
                  <td className="py-4 text-[14px] font-bold text-sidebar-heading text-left" dir="ltr">
                    {formatOrderPrice(Number(order.total))}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 font-medium text-slate-400 text-sm">
                  لا توجد طلبات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
