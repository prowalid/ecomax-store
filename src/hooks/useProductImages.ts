import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export function useProductImages(productId: string | null) {
  return useQuery({
    queryKey: ["product_images", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ProductImage[];
    },
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, file }: { productId: string; file: File }) => {
      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      // Get current max sort_order
      const { data: existing } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      const { data, error } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          sort_order: nextOrder,
        })
        .select()
        .single();
      if (error) throw error;

      // If this is the first image, also set it as the product's main image
      if (nextOrder === 0) {
        await supabase
          .from("products")
          .update({ image_url: urlData.publicUrl })
          .eq("id", productId);
        qc.invalidateQueries({ queryKey: ["products"] });
      }

      return data;
    },
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: ["product_images", productId] });
      toast.success("تم رفع الصورة");
    },
    onError: () => toast.error("فشل رفع الصورة"),
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId, imageUrl }: { id: string; productId: string; imageUrl: string }) => {
      // Delete from storage
      try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split("/product-images/");
        if (pathParts[1]) {
          await supabase.storage.from("product-images").remove([decodeURIComponent(pathParts[1])]);
        }
      } catch {}

      // Delete from DB
      const { error } = await supabase.from("product_images").delete().eq("id", id);
      if (error) throw error;

      // Check if we need to update main image
      const { data: remaining } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .limit(1);

      await supabase
        .from("products")
        .update({ image_url: remaining?.[0]?.image_url || null })
        .eq("id", productId);

      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: ["product_images", productId] });
      toast.success("تم حذف الصورة");
    },
    onError: () => toast.error("فشل حذف الصورة"),
  });
}
