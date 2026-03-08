import { useState } from "react";
import { CreditCard, Headphones, RotateCcw, Globe, Flame, Tag, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/store/ProductCard";

const trustBadges = [
  { icon: CreditCard, title: "دفع آمن", subtitle: "الدفع عند الاستلام", color: "hsl(0, 80%, 70%)" },
  { icon: Headphones, title: "دعم العملاء", subtitle: "متاح 24/7", color: "hsl(210, 80%, 65%)" },
  { icon: RotateCcw, title: "إرجاع سهل", subtitle: "خلال 14 يوم", color: "hsl(40, 80%, 60%)" },
  { icon: Globe, title: "شحن مجاني", subtitle: "لجميع الولايات", color: "hsl(160, 70%, 45%)" },
];

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeProducts = products.filter((p) => p.status === "active");
  const saleProducts = activeProducts.filter((p) => p.compare_price && p.compare_price > p.price);
  const displayProducts = selectedCategory
    ? activeProducts.filter((p) => p.category_id === selectedCategory)
    : activeProducts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="font-[Cairo]">
      {/* Hero Banner */}
      <section className="bg-gradient-to-bl from-[hsl(var(--primary))] via-[hsl(160,70%,30%)] to-[hsl(160,60%,20%)] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            تسوّق بأمان<br />
            <span className="text-white/80">ادفع عند الاستلام</span>
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-8">
            اكتشف أفضل المنتجات بأسعار تنافسية مع خدمة توصيل سريعة لجميع الولايات
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-white text-[hsl(var(--primary))] font-bold px-8 py-3 rounded-full hover:shadow-lg transition-shadow text-sm"
          >
            تصفح المنتجات
          </a>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: badge.color + "20" }}
              >
                <badge.icon className="w-5 h-5" style={{ color: badge.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{badge.title}</p>
                <p className="text-[11px] text-gray-500">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 mt-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section id="products" className="container mx-auto px-4 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
            <Flame className="w-3.5 h-3.5" />
            <span>الأكثر مبيعاً</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">منتجاتنا</h2>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                compare_price={p.compare_price ? Number(p.compare_price) : null}
                image_url={p.image_url}
                category_name={p.category_name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">لا توجد منتجات حالياً</p>
          </div>
        )}
      </section>

      {/* Sale Products Section */}
      {saleProducts.length > 0 && !selectedCategory && (
        <section className="container mx-auto px-4 mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
              <Tag className="w-3.5 h-3.5" />
              <span>عروض حصرية</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">تخفيضات</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {saleProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                compare_price={p.compare_price ? Number(p.compare_price) : null}
                image_url={p.image_url}
                category_name={p.category_name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StorePage;
