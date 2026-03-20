import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/hooks/useProducts";

import { formatProductPrice, productStatusLabels } from "./types";

interface ProductsTableProps {
  products: Product[];
  selectedProducts: string[];
  allProductsCount: number;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (product: Product) => void;
  onRequestDelete: (id: string) => void;
}

export default function ProductsTable({
  products,
  selectedProducts,
  allProductsCount,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onRequestDelete,
}: ProductsTableProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden animate-slide-in">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-right" dir="rtl">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-slate-50 bg-slate-50/95 backdrop-blur">
            <th className="w-10 px-4 py-4">
              <input
                type="checkbox"
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-input accent-primary"
              />
            </th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">المنتج</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الحالة</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">المخزون</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">السعر</th>
            <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">التصنيف</th>
            <th className="text-center text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = productStatusLabels[product.status];
            const isSelected = selectedProducts.includes(product.id);

            return (
              <tr
                key={product.id}
                data-testid={`product-row-${product.id}`}
                className={cn(
                  "border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group",
                  isSelected && "bg-primary/5"
                )}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(product.id)}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-sm">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-sidebar-heading group-hover:text-primary transition-colors block">
                        {product.name}
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        {product.slug ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5" dir="ltr">
                            /product/{product.slug}
                          </span>
                        ) : null}
                        {product.variants_count > 0 ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                            {product.variants_count} خيارات
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge
                    variant={status.variant}
                    className="rounded-full px-3 py-1 font-bold shadow-none border-none text-[11px]"
                  >
                    {status.label}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "text-[13px] px-2 py-1 rounded-md font-bold",
                      product.stock === 0
                        ? "text-red-500 bg-red-50"
                        : product.stock < 15
                          ? "text-orange-500 bg-orange-50"
                          : "text-emerald-500 bg-emerald-50"
                    )}
                  >
                    {product.stock === 0 ? "نفذ" : `${product.stock} متوفر`}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-sidebar-heading" dir="ltr">
                      {formatProductPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <span className="text-[11px] font-semibold text-slate-400 line-through" dir="ltr">
                        {formatProductPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[13px] font-medium text-slate-500">{product.category_name || "—"}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(product)}
                      data-testid={`product-edit-${product.id}`}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRequestDelete(product.id)}
                      data-testid={`product-delete-${product.id}`}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {allProductsCount === 0 ? "لا توجد منتجات بعد — أضف أول منتج" : "لا توجد منتجات مطابقة"}
        </div>
      )}
    </div>
  );
}
