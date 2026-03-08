import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Percent, Tag } from "lucide-react";

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usageCount: number;
  usageLimit: number | null;
  active: boolean;
  expiresAt: string | null;
}

const initialDiscounts: Discount[] = [
  { id: "D1", code: "WELCOME10", type: "percentage", value: 10, usageCount: 45, usageLimit: 100, active: true, expiresAt: "2026-04-01" },
  { id: "D2", code: "SUMMER500", type: "fixed", value: 500, usageCount: 12, usageLimit: 50, active: true, expiresAt: null },
  { id: "D3", code: "FLASH20", type: "percentage", value: 20, usageCount: 30, usageLimit: 30, active: false, expiresAt: "2026-03-01" },
];

const Discounts = () => {
  const [discounts] = useState(initialDiscounts);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الخصومات</h1>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إنشاء خصم
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الكود</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">النوع</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">القيمة</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الاستخدام</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">تاريخ الانتهاء</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <code className="text-sm font-medium text-foreground bg-muted px-2 py-0.5 rounded">{d.code}</code>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {d.type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">
                  {d.type === "percentage" ? `${d.value}%` : `${d.value} د.ج`}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {d.usageCount}{d.usageLimit ? ` / ${d.usageLimit}` : " (غير محدود)"}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {d.expiresAt || "بدون انتهاء"}
                </td>
                <td className="px-5 py-3">
                  <Badge variant={d.active ? "success" : "muted"}>
                    {d.active ? "نشط" : "معطّل"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Discounts;
