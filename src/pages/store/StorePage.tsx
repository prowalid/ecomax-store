import { useState } from "react";
import { CreditCard, Headphones, RotateCcw, Globe, Flame, Tag, Loader2, Grid3X3, ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";

const trustBadges = [
  { icon: CreditCard, title: "دفع آمن", subtitle: "الدفع عند الاستلام", bgColor: "#f99898" },
  { icon: Headphones, title: "دعم العملاء", subtitle: "متاح 24/7", bgColor: "#f99898" },
  { icon: RotateCcw, title: "إرجاع سهل", subtitle: "خلال 14 يوم", bgColor: "#f99898" },
  { icon: Globe, title: "شحن مجاني", subtitle: "لجميع الولايات", bgColor: "#f99898" },
];

const heroSlides = [
  { image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop", alt: "عروض حصرية" },
  { image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=500&fit=crop", alt: "تسوق الآن" },
];

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const activeProducts = products.filter((p) => p.status === "active");
  const saleProducts = activeProducts.filter((p) => p.compare_price && p.compare_price > p.price);
  const displayProducts = selectedCategory
    ? activeProducts.filter((p) => p.category_id === selectedCategory)
    : activeProducts;

  const handleQuickOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity: 1,
      });
      setOrderModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="font-[Cairo]">
      {/* Hero Carousel */}
      <section className="container mx-auto px-4 pt-4 pb-5">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <div className="aspect-[2.4/1] relative">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-20">
              <div className="text-white text-right">
                <h2 className="text-2xl md:text-4xl font-extrabold mb-2 drop-shadow-lg">تسوّق بأمان</h2>
                <p className="text-sm md:text-lg text-white/90 drop-shadow">ادفع عند الاستلام</p>
              </div>
            </div>
          </div>
          {/* Carousel Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-[hsl(var(--primary))]" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-[hsl(var(--primary))]" />
          </button>
          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? "bg-white scale-110" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="bg-[#f4f6f8] rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[hsl(var(--primary)/0.2)]"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: badge.bgColor }}
              >
                <badge.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="container mx-auto px-4 py-5">
        <SectionHeader
          icon={<Flame className="w-4 h-4" />}
          badge="الأكثر مبيعاً"
          title="الأكثر طلبا"
          desc="قائمة بالمنتجات التي تباع بكثرة حاليا"
        />

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mt-4 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                !selectedCategory
                  ? "bg-[hsl(var(--primary))] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                compare_price={p.compare_price ? Number(p.compare_price) : null}
                image_url={p.image_url}
                category_name={p.category_name}
                onQuickOrder={handleQuickOrder}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">لا توجد منتجات حالياً</p>
          </div>
        )}
      </section>

      {/* Categories Section */}
      {categories.length > 0 && !selectedCategory && (
        <section className="container mx-auto px-4 py-5">
          <SectionHeader
            icon={<Grid3X3 className="w-4 h-4" />}
            badge="التصنيفات"
            title="منتجات مختارة"
            desc="هذه مجموعة من المنتجات التي ننصح بها"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {categories.slice(0, 3).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="group relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]"
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-[hsl(var(--primary)/0.8)] transition-all duration-300" />
                <div className="absolute inset-0 flex items-end p-5">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-white text-lg font-bold">{cat.name}</h3>
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:text-[hsl(var(--primary))] text-gray-700 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Sale Products Section */}
      {saleProducts.length > 0 && !selectedCategory && (
        <section className="container mx-auto px-4 py-5 pb-10">
          <SectionHeader
            icon={<Tag className="w-4 h-4" />}
            badge="عروض حصرية"
            title="تخفيضات"
            desc="تخفيضات خيالية كل أسبوع — اشتري الآن قبل نفاذ الكمية"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {saleProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                compare_price={p.compare_price ? Number(p.compare_price) : null}
                image_url={p.image_url}
                category_name={p.category_name}
                onQuickOrder={handleQuickOrder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Order Modal */}
      {selectedProduct && (
        <QuickOrderModal
          open={orderModalOpen}
          onClose={() => {
            setOrderModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

/* Section Header Component */
const SectionHeader = ({ icon, badge, title, desc }: { icon: React.ReactNode; badge: string; title: string; desc: string }) => (
  <div className="text-center mb-2">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg mb-3"
      style={{ background: 'linear-gradient(135deg, #dc3545 0%, #dc3545 100%)', boxShadow: '0 4px 12px rgba(220, 53, 69, 0.25)' }}>
      {icon}
      <span>{badge}</span>
    </div>
    <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
  </div>
);

export default StorePage;
