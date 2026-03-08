import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Percent, Tag, Trash2, Loader2 } from "lucide-react";
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount } from "@/hooks/useDiscounts";

const Discounts = () => {
  const { data: discounts = [], isLoading } = useDiscounts();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const handleAdd = () => {
    if (!newCode.trim() || !newValue) return;
    createDiscount.mutate(
      {
        code: newCode.trim().toUpperCase(),
        type: newType,
        value: Number(newValue),
        usage_limit: newLimit ? Number(newLimit) : undefined,
      },
      {
        onSuccess: () => {
          setNewCode("");
          setNewValue("");
          setNewLimit("");
          setShowAdd(false);
        },
      }
    );
  };

  const toggleActive = (id: string, current: boolean) => {
    updateDiscount.mutate({ id, active: !current });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الخصومات</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إنشاء خصم
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg shadow-card border border-border p-4 space-y-3 animate-slide-in">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="كود الخصم..."
              className="flex-1 min-w-[150px] h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors uppercase"
              dir="ltr"
              autoFocus
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
            >
              <option value="percentage">نسبة مئوية %</option>
              <option value="fixed">مبلغ ثابت د.ج</option>
            </select>
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="القيمة"
              className="w-24 h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm text-center"
            />
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="الحد (اختياري)"
              className="w-32 h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm text-center"
            />
            <button
              onClick={handleAdd}
              disabled={createDiscount.isPending}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {createDiscount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </button>
          </div>
        </div>
      )}

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
              <th className="w-12 px-5 py-3"></th>
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
                  {d.usage_count}{d.usage_limit ? ` / ${d.usage_limit}` : " (غير محدود)"}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {d.expires_at ? new Date(d.expires_at).toLocaleDateString("ar-DZ") : "بدون انتهاء"}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(d.id, d.active)}>
                    <Badge variant={d.active ? "success" : "muted"} className="cursor-pointer">
                      {d.active ? "نشط" : "معطّل"}
                    </Badge>
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => deleteDiscount.mutate(d.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {discounts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            لا توجد خصومات بعد — أنشئ أول كود خصم
          </div>
        )}
      </div>
    </div>
  );
};

export default Discounts;
