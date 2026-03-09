import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ValidatedDiscount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
}

export function useValidateDiscount() {
  const [discount, setDiscount] = useState<ValidatedDiscount | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateCode = async (code: string): Promise<ValidatedDiscount | null> => {
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

      const validated: ValidatedDiscount = {
        id: data.id,
        code: data.code,
        type: data.type as "percentage" | "fixed",
        value: data.value,
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

  const calculateDiscount = (subtotal: number): number => {
    if (!discount) return 0;
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
