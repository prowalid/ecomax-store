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

interface DiscountLineItem {
  productId: string;
  unitPrice: number;
  quantity: number;
}

interface DiscountContext {
  productId?: string;
  quantity?: number;
  lineItems?: DiscountLineItem[];
}

export function useValidateDiscount() {
  const [discount, setDiscount] = useState<ValidatedDiscount | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateCode = async (code: string, context?: DiscountContext): Promise<ValidatedDiscount | null> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("أدخل كود الخصم");
      return null;
    }

    setIsValidating(true);
    try {
      const data = await api.post('/discounts/validate', { code: trimmed });

      const applyTo = (data.apply_to as string) ?? "all";
      const productIds = (data.product_ids as string[]) ?? [];
      if (applyTo === "specific") {
        const singleProductMismatch = context?.productId && !productIds.includes(context.productId);
        const cartMismatch = context?.lineItems?.length
          ? !context.lineItems.some((item) => productIds.includes(item.productId))
          : false;

        if (singleProductMismatch || cartMismatch) {
          toast.error("هذا الكود لا ينطبق على المنتجات المحددة");
          setDiscount(null);
          return null;
        }
      }

      const quantityBehavior = (data.quantity_behavior as string) ?? "all";
      const minQty = (data.min_quantity as number) ?? 1;
      if (quantityBehavior === "min_quantity") {
        const relevantQuantity = context?.lineItems?.length
          ? context.lineItems
              .filter((item) => applyTo !== "specific" || productIds.includes(item.productId))
              .reduce((sum, item) => sum + item.quantity, 0)
          : (context?.quantity ?? 0);

        if (relevantQuantity < minQty) {
          toast.error(`هذا الكود يتطلب طلب ${minQty} قطعة على الأقل`);
          setDiscount(null);
          return null;
        }
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
    } catch (err: unknown) {
      // The backend returns appropriate 400/404 errors with err.message set by our wrapper
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء التحقق من الكود";
      toast.error(message);
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
  const calculateDiscount = (
    subtotal: number,
    context?: { unitPrice?: number; quantity?: number; lineItems?: DiscountLineItem[] }
  ): number => {
    if (!discount) return 0;

    const behavior = discount.quantity_behavior;
    const applicableLineItems = context?.lineItems?.length
      ? context.lineItems.filter((item) => discount.apply_to !== "specific" || discount.product_ids.includes(item.productId))
      : [];

    const applicableSubtotal = applicableLineItems.length
      ? applicableLineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      : subtotal;

    if (behavior === "single" && context?.unitPrice !== undefined) {
      if (discount.type === "percentage") {
        return Math.round((context.unitPrice * discount.value) / 100);
      }
      return Math.min(discount.value, context.unitPrice);
    }

    if (behavior === "single" && applicableLineItems.length > 0) {
      const maxUnitPrice = Math.max(...applicableLineItems.map((item) => item.unitPrice));
      if (discount.type === "percentage") {
        return Math.round((maxUnitPrice * discount.value) / 100);
      }
      return Math.min(discount.value, maxUnitPrice);
    }

    if (behavior === "min_quantity") {
      const qty = applicableLineItems.length
        ? applicableLineItems.reduce((sum, item) => sum + item.quantity, 0)
        : (context?.quantity ?? 1);
      if (qty < discount.min_quantity) return 0;
    }

    if (discount.type === "percentage") {
      return Math.round((applicableSubtotal * discount.value) / 100);
    }
    return Math.min(discount.value, applicableSubtotal);
  };

  const incrementUsage = async () => {
    // Discount usage is now consumed atomically by the backend during order creation.
    return;
  };

  return { discount, isValidating, validateCode, clearDiscount, calculateDiscount, incrementUsage };
}
