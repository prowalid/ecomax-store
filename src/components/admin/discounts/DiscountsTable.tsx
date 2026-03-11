import { Edit2, Tag, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Discount } from "@/hooks/useDiscounts";

interface DiscountsTableProps {
  discounts: Discount[];
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (discount: Discount) => void;
  onDelete: (id: string) => void;
}

export default function DiscountsTable({
  discounts,
  onToggleActive,
  onEdit,
  onDelete,
}: DiscountsTableProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden animate-slide-in">
      <table className="w-full text-right" dir="rtl">
        <thead>
          <tr className="border-b border-slate-50 bg-slate-50/30">
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الكود</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">القيمة</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans hidden md:table-cell">نطاق المنتجات</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans hidden md:table-cell">سلوك الكمية</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans hidden lg:table-cell">الاستخدام</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans hidden lg:table-cell">الانتهاء</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الحالة</th>
            <th className="w-20 px-4 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount) => {
            const isExpired = discount.expires_at ? new Date(discount.expires_at) < new Date() : false;

            return (
              <tr key={discount.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-primary transition-colors" />
                    <code className="text-[14px] font-bold text-sidebar-heading tracking-wide bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                      {discount.code}
                    </code>
                  </div>
                </td>
                <td className="px-4 py-4 text-[14px] font-bold text-sidebar-heading whitespace-nowrap">
                  {discount.type === "percentage" ? `${discount.value}%` : `${discount.value} د.ج`}
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">
                    ({discount.type === "percentage" ? "نسبة" : "ثابت"})
                  </span>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-[13px] font-medium text-slate-500">
                    {discount.apply_to === "specific" ? `${discount.product_ids?.length ?? 0} منتج محدد` : "كل المنتجات"}
                  </span>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-[13px] font-medium text-slate-500">
                    {discount.quantity_behavior === "all" && "كامل الكمية"}
                    {discount.quantity_behavior === "single" && "قطعة واحدة"}
                    {discount.quantity_behavior === "min_quantity" && `من ${discount.min_quantity} قطع`}
                  </span>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell text-[13px] font-medium text-slate-500">
                  {discount.usage_count}
                  {discount.usage_limit ? ` / ${discount.usage_limit}` : " (غير محدود)"}
                </td>
                <td className="px-4 py-4 hidden lg:table-cell text-[13px] font-medium text-slate-500">
                  {discount.expires_at ? (
                    <span className={isExpired ? "text-red-500 font-bold" : ""}>
                      {new Date(discount.expires_at).toLocaleDateString("ar-DZ")}
                      {isExpired && " (منتهي)"}
                    </span>
                  ) : (
                    "بدون انتهاء"
                  )}
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => onToggleActive(discount.id, discount.active)}>
                    <Badge
                      variant={discount.active ? "success" : "muted"}
                      className="cursor-pointer rounded-full px-3 py-1 font-bold shadow-none border-none text-[11px]"
                    >
                      {discount.active ? "نشط" : "معطّل"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => onEdit(discount)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(discount.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {discounts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">لا توجد خصومات بعد — أنشئ أول كود خصم</div>
      )}
    </div>
  );
}
