import { useState } from "react";
import { CreditCard, Headphones, RotateCcw, Globe, Flame, Tag, Loader2, Grid3X3, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";

const trustBadges = [
  { icon: CreditCard, title: "دفع آمن", subtitle: "دفع آمن" },
  { icon: Headphones, title: "دعم العملاء", subtitle: "دعم العملاء" },
  { icon: RotateCcw, title: "إرجاع سهل", subtitle: "إرجاع سهل" },
  { icon: Globe, title: "شحن مجاني", subtitle: "شحن مجاني" },
];

const heroSlides = [
  { image: "/images/slide-1.png", alt: "عروض حصرية" },
  { image: "/images/slide-2.png", alt: "تسوق الآن" },
];

const defaultCatImages = [
  "/images/cat-electronics.png",
  "/images/cat-kitchen.png",
  "/images/cat-toys.png",
  "/images/cat-bags.png",
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="font-[Cairo]">
      {/* Hero Carousel */}
      <section className="container mx-auto px-4 pt-4 pb-5">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <div className="relative">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].alt}
              className="w-full object-cover block"
            />
          </div>
          {/* Carousel Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
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
              className="rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary/20 relative overflow-hidden"
              style={{ background: '#f4f6f8', color: '#111827' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#f99898' }}
              >
                <badge.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[16px] font-bold" style={{ color: '#111827' }}>{badge.title}</div>
                <div className="text-[12px]" style={{ color: '#111827' }}>{badge.subtitle}</div>
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

        {displayProducts.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 mt-4 list-none p-0" style={{ margin: 0 }}>
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
          </ul>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">لا توجد منتجات حالياً</p>
          </div>
        )}
      </section>

      {/* Categories Section */}
      {categories.length > 0 && !selectedCategory && (
        <section className="py-5">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<Grid3X3 className="w-4 h-4" />}
              badge="التصنيفات"
              title="منتجات مختارة"
              desc="هذه مجموعة من المنتجات التي ننصح بها"
            />

            {/* First row: 3 equal cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {categories.slice(0, 3).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group relative rounded-2xl overflow-hidden h-52"
                >
                  <img
                    src={defaultCatImages[idx] || defaultCatImages[0]}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 group-hover:from-primary/90 group-hover:via-primary/50 group-hover:to-black/20 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-white text-lg font-bold">{cat.name}</h3>
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 group-hover:text-primary transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Second row: 1 small + 1 featured wide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {categories[3] && (
                <button
                  onClick={() => setSelectedCategory(categories[3].id)}
                  className="group relative rounded-2xl overflow-hidden h-52"
                >
                  <img
                    src={defaultCatImages[3]}
                    alt={categories[3].name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 group-hover:from-primary/90 group-hover:via-primary/50 group-hover:to-black/20 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-white text-lg font-bold">{categories[3].name}</h3>
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 group-hover:text-primary transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>
              )}

              {/* Featured category card */}
              <button
                onClick={() => setSelectedCategory(null)}
                className="group relative rounded-2xl overflow-hidden h-52 md:col-span-2"
              >
                <img
                  src="/images/cat-special-offers.png"
                  alt="عروض حصرية"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(220,53,69,0.85) 0%, rgba(220,53,69,0.75) 100%)' }} />
                <div className="absolute inset-0 flex items-end p-5">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                        <Zap className="w-3 h-3" />
                        <span>عروض حصرية</span>
                      </div>
                      <h3 className="text-white text-lg font-bold">عروض حصرية</h3>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 group-hover:text-primary transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            </div>
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
            desc="تخفيضات خيالية كل أسبوع"
            subdesc="اشتري الآن قبل نفاذ الكمية، العرض متوفر في حدود المخزون"
          />
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 mt-4 list-none p-0">
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
          </ul>
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

/* Section Header Component - matches outerluxe exactly */
const SectionHeader = ({ icon, badge, title, desc, subdesc }: { icon: React.ReactNode; badge: string; title: string; desc: string; subdesc?: string }) => (
  <div className="text-center mb-2">
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg mb-3"
      style={{ background: 'linear-gradient(135deg, #dc3545 0%, #dc3545 100%)', boxShadow: '0 4px 12px rgba(220, 53, 69, 0.25)' }}
    >
      {icon}
      <span>{badge}</span>
    </div>
    <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
    {subdesc && <p className="text-sm text-gray-500">{subdesc}</p>}
  </div>
);

export default StorePage;
