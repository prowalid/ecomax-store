import { useState, useEffect } from "react";
import { CreditCard, Headphones, RotateCcw, Globe, Flame, Tag, Loader2, Grid3X3, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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

/* ============ Animated Section Wrapper ============ */
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <div ref={ref} className={`animate-on-scroll ${isVisible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
};

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      <AnimatedSection>
        <section className="container mx-auto px-4 pt-4 pb-5">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100">
            <div className="relative">
              {heroSlides.map((slide, i) => (
                <img
                  key={i}
                  src={slide.image}
                  alt={slide.alt}
                  className={`w-full object-cover block carousel-slide absolute inset-0 ${i === currentSlide ? "opacity-100 relative" : "opacity-0"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
              className="carousel-ctrl absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
              className="carousel-ctrl absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-white scale-125 shadow-md" : "bg-white/50 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Trust Badges */}
      <AnimatedSection>
        <section className="container mx-auto px-4 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="stagger-child trust-badge-card rounded-xl p-4 flex items-center gap-3 border border-transparent relative overflow-hidden"
                style={{ background: 'var(--store-card-bg, #f4f6f8)', color: '#111827' }}
              >
                <div
                  className="trust-badge-icon w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--store-badge-bg, #f99898)' }}
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
      </AnimatedSection>

      {/* Popular Products Section */}
      <AnimatedSection>
        <section className="container mx-auto px-4 py-5">
          <SectionHeader
            icon={<Flame className="w-4 h-4" />}
            badge="الأكثر مبيعاً"
            title="الأكثر طلبا"
            desc="قائمة بالمنتجات التي تباع بكثرة حاليا"
          />

          {displayProducts.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 mt-4 list-none p-0" style={{ margin: 0 }}>
              {displayProducts.map((p, idx) => (
                <li key={p.id} className="stagger-child list-none">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    price={Number(p.price)}
                    compare_price={p.compare_price ? Number(p.compare_price) : null}
                    image_url={p.image_url}
                    category_name={p.category_name}
                    onQuickOrder={handleQuickOrder}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">لا توجد منتجات حالياً</p>
            </div>
          )}
        </section>
      </AnimatedSection>

      {/* Categories Section */}
      {categories.length > 0 && !selectedCategory && (
        <AnimatedSection>
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
                    className="stagger-child group relative rounded-2xl overflow-hidden h-52"
                  >
                    <img
                      src={defaultCatImages[idx] || defaultCatImages[0]}
                      alt={cat.name}
                      className="category-card-img w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 group-hover:from-primary/90 group-hover:via-primary/50 group-hover:to-black/20 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-end p-5">
                      <div className="flex items-center justify-between w-full">
                        <h3 className="text-white text-lg font-bold">{cat.name}</h3>
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 group-hover:text-primary group-hover:rotate-[-360deg] transition-all duration-500">
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
                    className="stagger-child group relative rounded-2xl overflow-hidden h-52"
                  >
                    <img
                      src={defaultCatImages[3]}
                      alt={categories[3].name}
                      className="category-card-img w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 group-hover:from-primary/90 group-hover:via-primary/50 group-hover:to-black/20 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-end p-5">
                      <div className="flex items-center justify-between w-full">
                        <h3 className="text-white text-lg font-bold">{categories[3].name}</h3>
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 group-hover:text-primary group-hover:rotate-[-360deg] transition-all duration-500">
                          <ChevronLeft className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                )}

                {/* Featured category card */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="stagger-child group relative rounded-2xl overflow-hidden h-52 md:col-span-2 featured-shimmer"
                >
                  <img
                    src="/images/cat-special-offers.png"
                    alt="عروض حصرية"
                    className="category-card-img w-full h-full object-cover"
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
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 group-hover:text-primary group-hover:rotate-[-360deg] transition-all duration-500">
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Sale Products Section */}
      {saleProducts.length > 0 && !selectedCategory && (
        <AnimatedSection>
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
                <li key={p.id} className="stagger-child list-none">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    price={Number(p.price)}
                    compare_price={p.compare_price ? Number(p.compare_price) : null}
                    image_url={p.image_url}
                    category_name={p.category_name}
                    onQuickOrder={handleQuickOrder}
                  />
                </li>
              ))}
            </ul>
          </section>
        </AnimatedSection>
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
const SectionHeader = ({ icon, badge, title, desc, subdesc }: { icon: React.ReactNode; badge: string; title: string; desc: string; subdesc?: string }) => (
  <div className="text-center mb-2">
    <div
      className="badge-glow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg mb-3"
      style={{ background: 'linear-gradient(135deg, var(--store-sale-badge, #dc3545) 0%, var(--store-sale-badge, #dc3545) 100%)' }}
    >
      {icon}
      <span>{badge}</span>
    </div>
    <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    {subdesc && <p className="text-sm text-muted-foreground">{subdesc}</p>}
  </div>
);

export default StorePage;
