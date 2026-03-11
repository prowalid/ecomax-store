import { ChevronLeft, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import type { Product } from "@/hooks/useProducts";

interface ActiveProductsCardProps {
  products: Product[];
}

const formatPrice = (value: number) => `${value.toLocaleString("ar-DZ")} د.ج`;

export default function ActiveProductsCard({ products }: ActiveProductsCardProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-bold text-sidebar-heading">المنتجات النشطة</h2>
        <Link
          to="/admin/products"
          className="text-[13px] text-primary font-bold hover:bg-primary/10 transition-colors flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-xl"
        >
          المخزون
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {products.map((product) => {
          const stockStatus = product.stock > 10 ? "متوفر" : product.stock > 0 ? "منخفض" : "نفذ";
          const stockColors = {
            متوفر: "text-emerald-500 bg-emerald-50",
            منخفض: "text-orange-500 bg-orange-50",
            نفذ: "text-red-500 bg-red-50",
          } as const;

          return (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-primary/20 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-sidebar-heading truncate w-[160px]" title={product.name}>
                  {product.name}
                </span>
                <span className="text-[12px] text-slate-500 font-medium">المخزون: {product.stock}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[13px] font-bold text-primary" dir="ltr">
                  {formatPrice(Number(product.price))}
                </span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", stockColors[stockStatus])}>
                  {stockStatus}
                </span>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <PackageOpen className="w-10 h-10 mb-3 opacity-20" />
            <span className="font-medium text-sm">لا توجد منتجات نشطة حالياً</span>
          </div>
        )}
      </div>
    </div>
  );
}
