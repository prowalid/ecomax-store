import { ChevronLeft, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Product } from "@/hooks/useProducts";

interface ActiveProductsCardProps {
  products: Product[];
}

const formatPrice = (value: number) => `${value.toLocaleString("ar-DZ")} د.ج`;

type StockStatus = "متوفر" | "منخفض" | "نفذ";

const stockStatusColors: Record<StockStatus, { text: string; bar: string }> = {
  متوفر: { text: "text-emerald-600", bar: "bg-emerald-400" },
  منخفض: { text: "text-orange-500", bar: "bg-orange-400" },
  نفذ: { text: "text-rose-500", bar: "bg-rose-400" },
};

export default function ActiveProductsCard({ products }: ActiveProductsCardProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[17px] font-black text-sidebar-heading">المنتجات النشطة</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">أعلى {products.length} منتجات مفعّلة</p>
        </div>
        <Link
          to="/admin/products"
          className="text-[13px] text-primary font-bold hover:bg-primary/10 transition-colors flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-xl"
        >
          المخزون
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {products.map((product) => {
          const rawStatus: StockStatus =
            product.stock > 10 ? "متوفر" : product.stock > 0 ? "منخفض" : "نفذ";
          const maxStock = 50; // scale bar relative to this
          const barWidth = Math.min(100, Math.round((product.stock / maxStock) * 100));
          const colors = stockStatusColors[rawStatus];

          return (
            <div
              key={product.id}
              className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[13px] font-bold text-sidebar-heading truncate"
                  title={product.name}
                >
                  {product.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-[10px] font-bold", colors.text)}>{rawStatus}</span>
                  <span className="text-[13px] font-bold text-primary" dir="ltr">
                    {formatPrice(Number(product.price))}
                  </span>
                </div>
              </div>
              {/* Stock progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", colors.bar)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium shrink-0 w-10 text-left">
                  {product.stock}
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
