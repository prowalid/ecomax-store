import { ChevronDown, Loader2, MapPin, Package2, Phone, Receipt, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOrderItems, type Order, type OrderStatus } from "@/hooks/useOrders";

import { orderStatusConfig, orderStatusFlow } from "./constants";
import { formatOrderDateTime, formatOrderPrice, formatOrderRelativeDate, getDeliveryLabel } from "./utils";

interface OrdersTableProps {
  orders: Order[];
  allOrdersCount: number;
  selectedOrders: string[];
  expandedOrder: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleExpand: (id: string) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export default function OrdersTable({
  orders,
  allOrdersCount,
  selectedOrders,
  expandedOrder,
  onToggleSelect,
  onToggleSelectAll,
  onToggleExpand,
  onStatusChange,
}: OrdersTableProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden animate-slide-in">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-right" dir="rtl">
        <thead>
          <tr className="border-b border-slate-50 bg-slate-50/30">
            <th className="w-10 px-4 py-4">
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-input accent-primary"
              />
            </th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الطلب</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الزبون والتواصل</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الشحن</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الملخص المالي</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الحالة</th>
            <th className="w-10 px-4 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const isSelected = selectedOrders.includes(order.id);

            return (
              <OrderTableRow
                key={order.id}
                order={order}
                isExpanded={isExpanded}
                isSelected={isSelected}
                onToggleExpand={() => onToggleExpand(order.id)}
                onToggleSelect={() => onToggleSelect(order.id)}
                onStatusChange={onStatusChange}
              />
            );
          })}
        </tbody>
      </table>
      </div>
      {orders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {allOrdersCount === 0 ? "لا توجد طلبات بعد" : "لا توجد طلبات مطابقة"}
        </div>
      )}
    </div>
  );
}

interface OrderTableRowProps {
  order: Order;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

function OrderTableRow({
  order,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onStatusChange,
}: OrderTableRowProps) {
  const status = orderStatusConfig[order.status];
  const nextStatuses = orderStatusFlow[order.status];
  const { data: items = [], isLoading } = useOrderItems(order.id, isExpanded);

  return (
    <>
      <tr
        className={cn(
          "border-b border-slate-50 transition-colors cursor-pointer group",
          isSelected ? "bg-primary/5" : "hover:bg-slate-50/50"
        )}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-input accent-primary"
          />
        </td>
        <td className="px-4 py-4">
          <div className="space-y-1.5">
            <div className="text-[14px] font-bold text-sidebar-heading group-hover:text-primary transition-colors">
              #{order.order_number}
            </div>
            <div className="text-[12px] text-slate-500 whitespace-nowrap">
              {formatOrderDateTime(order.created_at)}
            </div>
            <div className="text-[12px] text-slate-400 whitespace-nowrap">
              {formatOrderRelativeDate(order.created_at)}
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="space-y-1.5">
            <div className="text-[13px] text-sidebar-heading font-semibold">{order.customer_name}</div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span dir="ltr">{order.customer_phone}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="space-y-1.5 text-[12px] font-medium text-slate-600">
            <div>{[order.commune, order.wilaya].filter(Boolean).join("، ") || "—"}</div>
            <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
              {getDeliveryLabel(order.delivery_type)}
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="space-y-1.5">
            <div className="text-[14px] font-bold text-sidebar-heading" dir="ltr">
              {formatOrderPrice(order.total)}
            </div>
            <div className="text-[12px] text-slate-500">
              فرعي: {formatOrderPrice(order.subtotal)}
            </div>
            {order.discount_amount > 0 && (
              <div className="text-[12px] font-semibold text-emerald-600">
                خصم: -{formatOrderPrice(order.discount_amount)}
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          <Badge variant={status.variant} className={cn("rounded-full px-3 py-1 font-bold shadow-none text-[11px]", status.className)}>
            {status.label}
          </Badge>
        </td>
        <td className="px-4 py-4">
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50/50 animate-slide-in">
          <td colSpan={7} className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-[11px] font-semibold text-slate-400">الإجمالي النهائي</p>
                  <p className="text-lg font-black text-slate-900" dir="ltr">{formatOrderPrice(order.total)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-[11px] font-semibold text-slate-400">المجموع الفرعي</p>
                  <p className="text-base font-bold text-slate-900" dir="ltr">{formatOrderPrice(order.subtotal)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-[11px] font-semibold text-slate-400">الشحن</p>
                  <p className="text-base font-bold text-slate-900" dir="ltr">{formatOrderPrice(order.shipping_cost)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-[11px] font-semibold text-slate-400">الخصم</p>
                  <p className={cn("text-base font-bold", order.discount_amount > 0 ? "text-emerald-600" : "text-slate-500")} dir="ltr">
                    {order.discount_amount > 0 ? `- ${formatOrderPrice(order.discount_amount)}` : "لا يوجد"}
                  </p>
                  {order.discount_code && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                      <Tag className="h-3 w-3" />
                      {order.discount_code}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-[11px] font-semibold text-slate-400">محاولات الاتصال</p>
                  <p className="text-base font-bold text-slate-900">{order.call_attempts || 0}</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900">محتوى الطلب</h3>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : items.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr className="text-slate-500">
                            <th className="px-3 py-3 text-right font-semibold">المنتج</th>
                            <th className="px-3 py-3 text-center font-semibold">الكمية</th>
                            <th className="px-3 py-3 text-center font-semibold">سعر الوحدة</th>
                            <th className="px-3 py-3 text-center font-semibold">الإجمالي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                              <td className="px-3 py-3 font-medium text-slate-800">{item.product_name}</td>
                              <td className="px-3 py-3 text-center text-slate-600">{item.quantity}</td>
                              <td className="px-3 py-3 text-center text-slate-600" dir="ltr">
                                {formatOrderPrice(item.unit_price)}
                              </td>
                              <td className="px-3 py-3 text-center font-semibold text-slate-900" dir="ltr">
                                {formatOrderPrice(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                      لم يتم العثور على عناصر الطلب
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-slate-500" />
                      <h3 className="text-sm font-bold text-slate-900">معلومات الطلب</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">رقم الطلب</span>
                        <span className="font-semibold text-slate-900">#{order.order_number}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">تاريخ الإنشاء</span>
                        <span className="font-semibold text-slate-900">{formatOrderDateTime(order.created_at)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-500">العنوان</span>
                        <span className="max-w-[220px] text-left font-semibold text-slate-900">
                          {[order.address, order.commune, order.wilaya].filter(Boolean).join("، ") || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">نوع التوصيل</span>
                        <span className="font-semibold text-slate-900">{getDeliveryLabel(order.delivery_type)}</span>
                      </div>
                    </div>
                  </div>

                  {order.note && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="mb-2 text-sm font-bold text-slate-900">ملاحظة الطلب</h3>
                      <p className="text-sm leading-6 text-slate-600">{order.note}</p>
                    </div>
                  )}

                  {nextStatuses.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="mb-3 text-sm font-bold text-slate-900">إجراءات سريعة</h3>
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(order.id, status);
                            }}
                            className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 transition-opacity"
                          >
                            {orderStatusConfig[status].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
