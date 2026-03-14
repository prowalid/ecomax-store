import type { ProductStatus } from "@/hooks/useProducts";
import type { ProductOptionGroup } from "@/lib/productOptions";

export interface ProductForm {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  stock: string;
  sku: string;
  category_id: string;
  status: ProductStatus;
  custom_options: ProductOptionGroup[];
}

export const emptyProductForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  stock: "0",
  sku: "",
  category_id: "",
  status: "active",
  custom_options: [],
};

export const productStatusLabels: Record<
  ProductStatus,
  { label: string; variant: "success" | "secondary" | "destructive" }
> = {
  active: { label: "نشط", variant: "success" },
  draft: { label: "مسودة", variant: "secondary" },
  archived: { label: "مؤرشف", variant: "destructive" },
};

export function formatProductPrice(value: number | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-DZ")} د.ج`;
}
