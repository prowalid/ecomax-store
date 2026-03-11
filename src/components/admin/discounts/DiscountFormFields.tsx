import type { Product } from "@/hooks/useProducts";

import { applyToLabels, quantityBehaviorLabels, type ApplyTo, type DiscountFormState, type QuantityBehavior } from "./types";

interface DiscountFormFieldsProps {
  form: DiscountFormState;
  activeProducts: Product[];
  autoFocus?: boolean;
  onPatch: (patch: Partial<DiscountFormState>) => void;
}

export default function DiscountFormFields({
  form,
  activeProducts,
  autoFocus = false,
  onPatch,
}: DiscountFormFieldsProps) {
  const toggleProductId = (productId: string) => {
    onPatch({
      product_ids: form.product_ids.includes(productId)
        ? form.product_ids.filter((id) => id !== productId)
        : [...form.product_ids, productId],
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={form.code}
          onChange={(e) => onPatch({ code: e.target.value })}
          placeholder="كود الخصم..."
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring uppercase"
          dir="ltr"
          autoFocus={autoFocus}
        />
        <select
          value={form.type}
          onChange={(e) => onPatch({ type: e.target.value as "percentage" | "fixed" })}
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
        >
          <option value="percentage">نسبة مئوية %</option>
          <option value="fixed">مبلغ ثابت د.ج</option>
        </select>
        <input
          type="number"
          value={form.value}
          onChange={(e) => onPatch({ value: e.target.value })}
          placeholder="القيمة"
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm text-center"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          value={form.usage_limit}
          onChange={(e) => onPatch({ usage_limit: e.target.value })}
          placeholder="حد الاستخدام (اختياري)"
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm text-center"
        />
        <input
          type="date"
          value={form.expires_at}
          onChange={(e) => onPatch({ expires_at: e.target.value })}
          className="h-9 w-full px-3 rounded-lg border border-input bg-background text-foreground text-sm"
        />
      </div>

      <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">نطاق المنتجات</p>
        <div className="flex gap-3">
          {(["all", "specific"] as ApplyTo[]).map((value) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="apply_to"
                value={value}
                checked={form.apply_to === value}
                onChange={() => onPatch({ apply_to: value })}
                className="accent-primary"
              />
              <span className="text-sm">{applyToLabels[value]}</span>
            </label>
          ))}
        </div>
        {form.apply_to === "specific" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 max-h-36 overflow-y-auto">
            {activeProducts.map((product) => (
              <label key={product.id} className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={form.product_ids.includes(product.id)}
                  onChange={() => toggleProductId(product.id)}
                  className="accent-primary"
                />
                <span className="line-clamp-1">{product.name}</span>
              </label>
            ))}
            {activeProducts.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3">لا توجد منتجات نشطة</p>
            )}
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">سلوك الكمية</p>
        <div className="space-y-1.5">
          {(["all", "single", "min_quantity"] as QuantityBehavior[]).map((value) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="quantity_behavior"
                value={value}
                checked={form.quantity_behavior === value}
                onChange={() => onPatch({ quantity_behavior: value })}
                className="accent-primary"
              />
              <span className="text-sm">{quantityBehaviorLabels[value]}</span>
            </label>
          ))}
        </div>
        {form.quantity_behavior === "min_quantity" && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">الحد الأدنى للقطع:</label>
            <input
              type="number"
              min={1}
              value={form.min_quantity}
              onChange={(e) => onPatch({ min_quantity: e.target.value })}
              className="h-8 w-20 px-2 rounded-lg border border-input bg-background text-foreground text-sm text-center"
            />
          </div>
        )}
      </div>
    </div>
  );
}
