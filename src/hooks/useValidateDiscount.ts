import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface ValidatedDiscount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  apply_to: "all" | "specific";
  product_ids: string[];
  quantity_behavior: "all" | "single" | "min_quantity";
  min_quantity: number;
}

export function useValidateDiscount() {
  const [discount, setDiscount] = useState<ValidatedDiscount | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateCode = async (
    code: string,
    context?: { productId?: string; quantity?: number }
  ): Promise<ValidatedDiscount | null> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("أدخل كود الخصم");
      return null;
    }

    setIsValidating(true);
    try {
      const data = await api.post('/discounts/validate', { code: trimmed });

      // Check product scope (this could also be moved to backend entirely, but client logic is fine)
      const applyTo = (data.apply_to as string) ?? "all";
      const productIds = (data.product_ids as string[]) ?? [];
      if (applyTo === "specific" && context?.productId && !productIds.includes(context.productId)) {
        toast.error("هذا الكود لا ينطبق على هذا المنتج");
        setDiscount(null);
        return null;
      }

      // Check min quantity
      const quantityBehavior = (data.quantity_behavior as string) ?? "all";
      const minQty = (data.min_quantity as number) ?? 1;
      if (quantityBehavior === "min_quantity" && context?.quantity !== undefined && context.quantity < minQty) {
        toast.error(`هذا الكود يتطلب طلب ${minQty} قطعة على الأقل`);
        setDiscount(null);
        return null;
      }

      const validated: ValidatedDiscount = {
        id: data.id,
        code: data.code,
        type: data.type as "percentage" | "fixed",
        value: data.value,
        apply_to: applyTo as "all" | "specific",
        product_ids: productIds,
        quantity_behavior: quantityBehavior as "all" | "single" | "min_quantity",
        min_quantity: minQty,
      };

      setDiscount(validated);
      toast.success(`تم تطبيق كود الخصم: ${data.type === "percentage" ? `${data.value}%` : `${data.value} د.ج`}`);
      return validated;
    } catch (err: any) {
      // The backend returns appropriate 400/404 errors with err.message set by our wrapper
      toast.error(err.message || "حدث خطأ أثناء التحقق من الكود");
      setDiscount(null);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const clearDiscount = () => setDiscount(null);

  /**
   * احسب قيمة الخصم بناءً على سلوك الكمية
   */
  const calculateDiscount = (subtotal: number, unitPrice?: number, quantity?: number): number => {
    if (!discount) return 0;

    const behavior = discount.quantity_behavior;

    if (behavior === "single" && unitPrice !== undefined) {
      if (discount.type === "percentage") {
        return Math.round((unitPrice * discount.value) / 100);
      }
      return Math.min(discount.value, unitPrice);
    }

    if (behavior === "min_quantity") {
      const qty = quantity ?? 1;
      if (qty < discount.min_quantity) return 0;
    }

    if (discount.type === "percentage") {
      return Math.round((subtotal * discount.value) / 100);
    }
    return Math.min(discount.value, subtotal);
  };

  const incrementUsage = async () => {
    if (!discount) return;
    try {
      await api.post(`/discounts/${discount.id}/increment`, {});
    } catch (err) {
      console.error("Failed to increment discount usage", err);
    }
  };

  return { discount, isValidating, validateCode, clearDiscount, calculateDiscount, incrementUsage };
}
