import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, type ProductStatus } from "@/hooks/useProducts";

const statusLabels: Record<ProductStatus, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  active: { label: "نشط", variant: "success" },
  draft: { label: "مسودة", variant: "secondary" },
  archived: { label: "مؤرشف", variant: "destructive" },
};

const formatPrice = (n: number) => Number(n).toLocaleString("ar-DZ") + " د.ج";

const Products = () => {
  const { data: products = [], isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | ProductStatus>("all");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.includes(search) || (p.category_name || "").includes(search);
    const matchTab = activeTab === "all" || p.status === activeTab;
    return matchSearch && matchTab;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">المنتجات</h1>
        <button className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {(["all", "active", "draft", "archived"] as const).map((tab) => {
          const labels = { all: "الكل", active: "نشط", draft: "مسودة", archived: "مؤرشف" };
          const count = tab === "all" ? products.length : products.filter((p) => p.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {labels[tab]} <span className="text-xs text-muted-foreground mr-1">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
        />
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-slide-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">المنتج</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الحالة</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">المخزون</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">السعر</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">التصنيف</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const s = statusLabels[product.status];
              return (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center text-lg shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-md" />
                        ) : (
                          "📦"
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-sm",
                      product.stock === 0 ? "text-destructive font-medium" : product.stock < 15 ? "text-orange-500 font-medium" : "text-foreground"
                    )}>
                      {product.stock === 0 ? "نفذ المخزون" : `${product.stock} وحدة`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                      {product.compare_price && (
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{product.category_name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {products.length === 0 ? "لا توجد منتجات بعد — أضف أول منتج" : "لا توجد منتجات مطابقة"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
