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
    <div className="xl:col-span-2 bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[17px] font-black text-sidebar-heading">آخر الطلبات</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">أحدث {orders.length} طلبات مستلمة</p>
        </div>
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
              <th className="text-[12px] font-semibold text-slate-400 pb-3"># الطلب</th>
              <th className="text-[12px] font-semibold text-slate-400 pb-3">التاريخ</th>
              <th className="text-[12px] font-semibold text-slate-400 pb-3">الزبون</th>
              <th className="text-[12px] font-semibold text-slate-400 pb-3 text-center">الحالة</th>
              <th className="text-[12px] font-semibold text-slate-400 pb-3 text-left">المبلغ</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const status = orderStatusConfig[order.status];
              return (
                <tr
                  key={order.id}
                  className={cn(
                    "group transition-colors hover:bg-slate-50/60",
                    idx !== orders.length - 1 && "border-b border-slate-50"
                  )}
                >
                  <td className="py-3.5">
                    <span className="text-sm font-bold text-sidebar-heading">#{order.order_number}</span>
                  </td>
                  <td className="py-3.5 text-[12px] text-slate-500 font-medium">
                    {formatOrderRelativeDate(order.created_at)}
                  </td>
                  <td className="py-3.5 text-[13px] text-sidebar-heading font-semibold">
                    {order.customer_name}
                  </td>
                  <td className="py-3.5 text-center">
                    <Badge
                      variant={status.variant}
                      className="rounded-full px-3 py-0.5 font-bold shadow-none border-none text-[11px]"
                    >
                      {status.label}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-[14px] font-bold text-sidebar-heading text-left" dir="ltr">
                    {formatOrderPrice(Number(order.total))}
                  </td>
                  <td className="py-3.5">
                    <Link
                      to="/admin/orders"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold text-primary bg-primary/8 hover:bg-primary/15 px-2.5 py-1 rounded-lg"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 font-medium text-slate-400 text-sm">
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
