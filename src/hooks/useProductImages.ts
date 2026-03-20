import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

interface UploadResponse {
  url: string;
}

export function useProductImages(productId: string | null) {
  return useQuery({
    queryKey: ["product_images", productId],
    enabled: !!productId,
    queryFn: async () => {
      const data = await api.get(`/products/${productId}/images`);
      return data as ProductImage[];
    },
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, file }: { productId: string; file: File; suppressToast?: boolean }) => {
      // 1. Upload file to backend storage
      const uploadRes = (await api.upload('/upload', file)) as UploadResponse;
      
      const rootUrl = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
      const fullUrl = rootUrl.startsWith("http")
        ? `${rootUrl}${uploadRes.url}`
        : `${window.location.origin}${uploadRes.url}`;

      // 2. Add image to product
      const data = await api.post(`/products/${productId}/images`, { image_url: fullUrl });

      // Refresh products cache if this was the first image
      if (data.sort_order === 0) {
        qc.invalidateQueries({ queryKey: ["products"] });
      }

      return data;
    },
    onSuccess: (_, { productId, suppressToast }) => {
      qc.invalidateQueries({ queryKey: ["product_images", productId] });
      if (!suppressToast) {
        toast.success("تم رفع الصورة");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل رفع الصورة");
      }
    },
  });
}

export function useReorderProductImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, images }: { productId: string; images: { id: string; sort_order: number; image_url: string }[] }) => {
      await api.put(`/products/${productId}/images/reorder`, { images });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: ["product_images", productId] });
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string; suppressToast?: boolean }) => {
      await api.delete(`/products/${productId}/images/${id}`);
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onSuccess: (_, { productId, suppressToast }) => {
      qc.invalidateQueries({ queryKey: ["product_images", productId] });
      if (!suppressToast) {
        toast.success("تم حذف الصورة");
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.suppressToast) {
        toast.error(error.message || "فشل حذف الصورة");
      }
    },
  });
}
