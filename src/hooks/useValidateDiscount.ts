import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("code", trimmed)
        .eq("active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("كود الخصم غير صالح");
        setDiscount(null);
        return null;
      }

      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("كود الخصم منتهي الصلاحية");
        setDiscount(null);
        return null;
      }

      // Check usage limit
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        toast.error("تم استنفاد الحد الأقصى لاستخدام هذا الكود");
        setDiscount(null);
        return null;
      }

      // Check product scope
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
    } catch {
      toast.error("حدث خطأ أثناء التحقق من الكود");
      setDiscount(null);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const clearDiscount = () => setDiscount(null);

  /**
   * احسب قيمة الخصم بناءً على سلوك الكمية
   * @param subtotal - المجموع الفرعي الكلي
   * @param unitPrice - سعر الوحدة (للحساب على قطعة واحدة)
   * @param quantity - الكمية
   */
  const calculateDiscount = (subtotal: number, unitPrice?: number, quantity?: number): number => {
    if (!discount) return 0;

    const behavior = discount.quantity_behavior;

    // تطبيق على قطعة واحدة فقط
    if (behavior === "single" && unitPrice !== undefined) {
      if (discount.type === "percentage") {
        return Math.round((unitPrice * discount.value) / 100);
      }
      return Math.min(discount.value, unitPrice);
    }

    // تطبيق على الكمية الكلية فقط إذا تجاوزت الحد الأدنى
    if (behavior === "min_quantity") {
      const qty = quantity ?? 1;
      if (qty < discount.min_quantity) return 0;
    }

    // تطبيق على كامل المبلغ (all أو min_quantity بعد التحقق)
    if (discount.type === "percentage") {
      return Math.round((subtotal * discount.value) / 100);
    }
    return Math.min(discount.value, subtotal);
  };

  const incrementUsage = async () => {
    if (!discount) return;
    const { data } = await supabase
      .from("discounts")
      .select("usage_count")
      .eq("id", discount.id)
      .single();
    if (data) {
      await supabase
        .from("discounts")
        .update({ usage_count: data.usage_count + 1 })
        .eq("id", discount.id);
    }
  };

  return { discount, isValidating, validateCode, clearDiscount, calculateDiscount, incrementUsage };
}
