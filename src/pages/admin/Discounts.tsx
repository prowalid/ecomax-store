import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Percent, Tag, Trash2, Loader2, Edit2, Check, X, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, Discount } from "@/hooks/useDiscounts";
import { useProducts } from "@/hooks/useProducts";

type QuantityBehavior = "all" | "single" | "min_quantity";
type ApplyTo = "all" | "specific";

const QUANTITY_BEHAVIOR_LABELS: Record<QuantityBehavior, string> = {
  all: "على كامل الكمية",
  single: "على قطعة واحدة فقط",
  min_quantity: "عند تجاوز حد أدنى للكمية",
};

const APPLY_TO_LABELS: Record<ApplyTo, string> = {
  all: "كل المنتجات",
  specific: "منتجات محددة",
};

interface DiscountFormState {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  usage_limit: string;
  expires_at: string;
  apply_to: ApplyTo;
  product_ids: string[];
  quantity_behavior: QuantityBehavior;
  min_quantity: string;
}

const emptyForm: DiscountFormState = {
  code: "",
  type: "percentage",
  value: "",
  usage_limit: "",
  expires_at: "",
  apply_to: "all",
  product_ids: [],
  quantity_behavior: "all",
  min_quantity: "1",
};

const Discounts = () => {
  const { data: discounts = [], isLoading } = useDiscounts();
  const { data: products = [] } = useProducts();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<DiscountFormState>(emptyForm);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DiscountFormState>(emptyForm);

  const activeProducts = products.filter((p) => p.status === "active");

  const formToPayload = (f: DiscountFormState) => ({
    code: f.code.trim().toUpperCase(),
    type: f.type,
    value: Number(f.value),
    usage_limit: f.usage_limit ? Number(f.usage_limit) : undefined,
    expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : undefined,
    apply_to: f.apply_to,
    product_ids: f.apply_to === "specific" ? f.product_ids : [],
    quantity_behavior: f.quantity_behavior,
    min_quantity: f.quantity_behavior === "min_quantity" ? Number(f.min_quantity) : 1,
  });

  const handleAdd = () => {
    if (!form.code.trim() || !form.value) return;
    createDiscount.mutate(formToPayload(form), {
      onSuccess: () => {
        setForm(emptyForm);
        setShowAdd(false);
      },
    });
  };

  const startEdit = (d: Discount) => {
    setEditId(d.id);
    setEditForm({
      code: d.code,
      type: d.type,
      value: String(d.value),
      usage_limit: d.usage_limit ? String(d.usage_limit) : "",
      expires_at: d.expires_at ? d.expires_at.split("T")[0] : "",
      apply_to: d.apply_to ?? "all",
      product_ids: d.product_ids ?? [],
      quantity_behavior: d.quantity_behavior ?? "all",
      min_quantity: String(d.min_quantity ?? 1),
    });
  };

  const saveEdit = () => {
    if (!editId || !editForm.code.trim() || !editForm.value) return;
    updateDiscount.mutate(
      {
        id: editId,
        ...formToPayload(editForm),
        usage_limit: editForm.usage_limit ? Number(editForm.usage_limit) : null,
        expires_at: editForm.expires_at ? new Date(editForm.expires_at).toISOString() : null,
      },
      { onSuccess: () => setEditId(null) }
    );
  };

  const toggleActive = (id: string, current: boolean) => {
    updateDiscount.mutate({ id, active: !current });
  };

  const toggleProductId = (pid: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(pid) ? current.filter((x) => x !== pid) : [...current, pid]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const DiscountFormFields = ({
    f,
    set,
  }: {
    f: DiscountFormState;
    set: (patch: Partial<DiscountFormState>) => void;
  }) => (
    <div className="space-y-3">
      {/* Row 1: Code / Type / Value */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={f.code}
          onChange={(e) => set({ code: e.target.value })}
          placeholder="كود الخصم..."
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring uppercase"
          dir="ltr"
          autoFocus
        />
        <select
          value={f.type}
          onChange={(e) => set({ type: e.target.value as any })}
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
        >
          <option value="percentage">نسبة مئوية %</option>
          <option value="fixed">مبلغ ثابت د.ج</option>
        </select>
        <input
          type="number"
          value={f.value}
          onChange={(e) => set({ value: e.target.value })}
          placeholder="القيمة"
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm text-center"
        />
      </div>

      {/* Row 2: Usage limit / Expiry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          value={f.usage_limit}
          onChange={(e) => set({ usage_limit: e.target.value })}
          placeholder="حد الاستخدام (اختياري)"
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm text-center"
        />
        <input
          type="date"
          value={f.expires_at}
          onChange={(e) => set({ expires_at: e.target.value })}
          className="h-9 w-full px-3 rounded-lg border border-input bg-background text-foreground text-sm"
        />
      </div>

      {/* Section: Apply To */}
      <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">نطاق المنتجات</p>
        <div className="flex gap-3">
          {(["all", "specific"] as ApplyTo[]).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="apply_to"
                value={v}
                checked={f.apply_to === v}
                onChange={() => set({ apply_to: v })}
                className="accent-primary"
              />
              <span className="text-sm">{APPLY_TO_LABELS[v]}</span>
            </label>
          ))}
        </div>
        {f.apply_to === "specific" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 max-h-36 overflow-y-auto">
            {activeProducts.map((p) => (
              <label key={p.id} className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={f.product_ids.includes(p.id)}
                  onChange={() =>
                    toggleProductId(p.id, f.product_ids, (ids) => set({ product_ids: ids }))
                  }
                  className="accent-primary"
                />
                <span className="line-clamp-1">{p.name}</span>
              </label>
            ))}
            {activeProducts.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3">لا توجد منتجات نشطة</p>
            )}
          </div>
        )}
      </div>

      {/* Section: Quantity Behavior */}
      <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">سلوك الكمية</p>
        <div className="space-y-1.5">
          {(["all", "single", "min_quantity"] as QuantityBehavior[]).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="quantity_behavior"
                value={v}
                checked={f.quantity_behavior === v}
                onChange={() => set({ quantity_behavior: v })}
                className="accent-primary"
              />
              <span className="text-sm">{QUANTITY_BEHAVIOR_LABELS[v]}</span>
            </label>
          ))}
        </div>
        {f.quantity_behavior === "min_quantity" && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">الحد الأدنى للقطع:</label>
            <input
              type="number"
              min={1}
              value={f.min_quantity}
              onChange={(e) => set({ min_quantity: e.target.value })}
              className="h-8 w-20 px-2 rounded-lg border border-input bg-background text-foreground text-sm text-center"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الخصومات والكوبونات</h1>
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
          <DiscountFormFields
            f={form}
            set={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowAdd(false); setForm(emptyForm); }}
              className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAdd}
              disabled={createDiscount.isPending || !form.code.trim() || !form.value}
              className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {createDiscount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Edit modal overlay */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">تعديل الكوبون</h2>
              <button onClick={() => setEditId(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <DiscountFormFields
              f={editForm}
              set={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditId(null)}
                className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveEdit}
                disabled={updateDiscount.isPending}
                className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {updateDiscount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الكود</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">القيمة</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">نطاق المنتجات</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">سلوك الكمية</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">الاستخدام</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">الانتهاء</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الحالة</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <code className="text-sm font-medium text-foreground bg-muted px-2 py-0.5 rounded">{d.code}</code>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                  {d.type === "percentage" ? `${d.value}%` : `${d.value} د.ج`}
                  <span className="text-xs text-muted-foreground mr-1">
                    ({d.type === "percentage" ? "نسبة" : "ثابت"})
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {d.apply_to === "specific"
                      ? `${d.product_ids?.length ?? 0} منتج محدد`
                      : "كل المنتجات"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {d.quantity_behavior === "all" && "كامل الكمية"}
                    {d.quantity_behavior === "single" && "قطعة واحدة"}
                    {d.quantity_behavior === "min_quantity" && `من ${d.min_quantity} قطع`}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                  {d.usage_count}{d.usage_limit ? ` / ${d.usage_limit}` : " (غير محدود)"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                  {d.expires_at ? (
                    <span className={new Date(d.expires_at) < new Date() ? "text-destructive" : ""}>
                      {new Date(d.expires_at).toLocaleDateString("ar-DZ")}
                      {new Date(d.expires_at) < new Date() && " (منتهي)"}
                    </span>
                  ) : (
                    "بدون انتهاء"
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(d.id, d.active)}>
                    <Badge variant={d.active ? "success" : "muted"} className="cursor-pointer">
                      {d.active ? "نشط" : "معطّل"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(d)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDiscount.mutate(d.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
