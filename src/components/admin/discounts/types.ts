import type { Discount } from "@/hooks/useDiscounts";

export type QuantityBehavior = "all" | "single" | "min_quantity";
export type ApplyTo = "all" | "specific";

export interface DiscountFormState {
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

export const quantityBehaviorLabels: Record<QuantityBehavior, string> = {
  all: "على كامل الكمية",
  single: "على قطعة واحدة فقط",
  min_quantity: "عند تجاوز حد أدنى للكمية",
};

export const applyToLabels: Record<ApplyTo, string> = {
  all: "كل المنتجات",
  specific: "منتجات محددة",
};

export const emptyDiscountForm: DiscountFormState = {
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

export function discountToFormState(discount: Discount): DiscountFormState {
  return {
    code: discount.code,
    type: discount.type,
    value: String(discount.value),
    usage_limit: discount.usage_limit ? String(discount.usage_limit) : "",
    expires_at: discount.expires_at ? discount.expires_at.split("T")[0] : "",
    apply_to: discount.apply_to ?? "all",
    product_ids: discount.product_ids ?? [],
    quantity_behavior: discount.quantity_behavior ?? "all",
    min_quantity: String(discount.min_quantity ?? 1),
  };
}
