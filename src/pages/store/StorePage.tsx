import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Phone, Truck, User, ShoppingBag, ChevronLeft, ChevronRight,
  ShieldCheck, Headphones, RotateCcw, Globe, Star, Flame, Tag, ArrowLeft, Grid, Loader2
} from "lucide-react";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/hooks/useCart";
import { useAppearanceSettings, defaultAppearance, type AppearanceSlide } from "@/hooks/useAppearanceSettings";
import { useTracking } from "@/hooks/useTracking";
import ProductCard from "@/components/store/ProductCard";
import { getStoreThemeTokens } from "@/lib/storeTheme";

const fallbackSlides = [...defaultAppearance.slides];

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { addItem, isAdding } = useCart();
  const { settings: t, loading: themeLoading } = useAppearanceSettings();
  const theme = themeLoading ? defaultAppearance : t;
  const tokens = getStoreThemeTokens(theme);
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [failedSlideIndexes, setFailedSlideIndexes] = useState<number[]>([]);
  const activeSlides = (theme.slides || []).filter((slide): slide is AppearanceSlide => Boolean(slide?.image_url));
  const resolvedSlides = activeSlides.length > 0 ? activeSlides : defaultAppearance.slides;
  useEffect(() => {
    setFailedSlideIndexes([]);
  }, [theme.slides]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    setSelectedCategory(categoryFromUrl || null);
  }, [searchParams]);

  useEffect(() => {
    // Reset slide index if it exceeds new active slides boundary
    setCurrentSlide(prev => prev >= resolvedSlides.length ? 0 : prev);
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= resolvedSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [resolvedSlides.length]);

  const activeProducts = products.filter((p) => p.status === "active");
  const storefrontCategories = categories.filter((category) => Boolean(category?.id));
  const featuredCategories = storefrontCategories.filter((category) => Boolean(category?.image_url));
  const filteredProducts = selectedCategory
    ? activeProducts.filter((p) => p.category_id === selectedCategory)
    : activeProducts;
  const saleProducts = activeProducts.filter((p) => p.compare_price && Number(p.compare_price) > Number(p.price));

  const { track } = useTracking();

  const getSlideSrc = (image: string, index: number) => {
    if (!failedSlideIndexes.includes(index)) {
      return image;
    }

    return fallbackSlides[index % fallbackSlides.length]?.image_url || defaultAppearance.slides[0].image_url;
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_price: Number(product.price),
      product_image_url: product.image_url,
      quantity: 1,
    });
    track("AddToCart", {}, {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      contents: [{ id: product.id, quantity: 1, item_price: Number(product.price) }],
      value: Number(product.price),
      currency: "DZD",
    });
  };

  const applyCategoryFilter = (categoryId: string | null, shouldScroll = false) => {
    if (!categoryId) {
      setSearchParams({}, { replace: true, preventScrollReset: true });
    } else {
      setSearchParams({ category: categoryId }, { replace: true, preventScrollReset: true });
    }
    
    if (shouldScroll) {
      setTimeout(() => {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    const categoryExists = storefrontCategories.some((category) => category.id === selectedCategory);
    if (!categoryExists) {
      setSearchParams({}, { replace: true, preventScrollReset: true });
    }
  }, [selectedCategory, storefrontCategories, setSearchParams]);

  const scrollToOffers = () => {
    document.getElementById("offers")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "/#offers");
  };

  if (isLoading) {
    return (
      <>
        {/* Skeleton Hero */}
        <section className="container mx-auto py-4 sm:py-6 px-4">
          <div className="rounded-2xl bg-gray-200 animate-pulse h-[190px] sm:h-[250px] md:h-[450px]" />
        </section>
        {/* Skeleton Trust Badges */}
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-20 sm:h-24" />
            ))}
          </div>
        </section>
        {/* Skeleton Products */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex justify-center mb-8"><div className="bg-gray-200 animate-pulse rounded-full h-8 w-40" /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="aspect-[4/4.65] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3 mx-auto" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3 mx-auto" />
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2 mx-auto" />
                  <div className="h-10 bg-gray-100 animate-pulse rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Slider */}
      <section className="container mx-auto py-4 sm:py-6 px-4 overflow-x-clip">
        <div className="relative rounded-2xl overflow-hidden h-[190px] sm:h-[250px] md:h-[450px] shadow-lg group">
          {resolvedSlides.map((slide: AppearanceSlide, index: number) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 z-10 pointer-events-none"></div>
              {slide.href ? (
                <Link to={slide.href} className="relative z-20 block h-full w-full">
                  <img
                    src={getSlideSrc(slide.image_url, index)}
                    alt={`Slide ${index + 1}`}
                    loading={index === currentSlide ? 'eager' : 'lazy'}
                    onError={() => {
                      setFailedSlideIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]));
                    }}
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform [transition-duration:10s]"
                  />
                </Link>
              ) : (
                <img
                  src={getSlideSrc(slide.image_url, index)}
                  alt={`Slide ${index + 1}`}
                  loading={index === currentSlide ? 'eager' : 'lazy'}
                  onError={() => {
                    setFailedSlideIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]));
                  }}
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform [transition-duration:10s]"
                />
              )}
            </div>
          ))}
          <button
            onClick={() => setCurrentSlide(prev => prev === 0 ? resolvedSlides.length - 1 : prev - 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100 hidden md:flex"
            style={{ color: theme.accent_color, backgroundColor: tokens.surface }}
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => prev === resolvedSlides.length - 1 ? 0 : prev + 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100 hidden md:flex"
            style={{ color: theme.accent_color, backgroundColor: tokens.surface }}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2 space-x-reverse">
            {resolvedSlides.map((_, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8' : 'w-2 bg-white/70 hover:bg-white'}`}
                style={currentSlide === idx ? { backgroundColor: theme.accent_color } : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-6 sm:py-8 overflow-x-clip">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { icon: ShieldCheck, title: "دفع آمن", sub: "100% عند الاستلام" },
            { icon: Headphones, title: "دعم العملاء", sub: "متوفر 24/7" },
            { icon: RotateCcw, title: "إرجاع سهل", sub: "ضمان 7 أيام" },
            { icon: Globe, title: "شحن سريع", sub: "لكل الولايات" },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-3 rounded-2xl p-3 text-right transition-all duration-300 hover:-translate-y-1 sm:gap-4 sm:rounded-3xl sm:p-6"
              style={{ backgroundColor: tokens.surface, border: `1px solid ${tokens.border}` }}
            >
              <div className="transition-colors p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shrink-0" style={{ backgroundColor: tokens.surfaceSoft, color: theme.accent_color }}>
                <badge.icon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[13px] sm:text-lg mb-0.5 truncate" style={{ color: tokens.textPrimary }}>{badge.title}</h3>
                <p className="text-[10px] sm:text-sm truncate" style={{ color: tokens.textMuted }}>{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section id="products" className="container mx-auto px-4 py-8 sm:py-10 scroll-mt-20 overflow-x-clip">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
            <Flame size={16} className="ml-2" /> الأكثر مبيعاً
          </div>
          <div className="relative inline-block">
                <h2 className="text-2xl sm:text-3xl font-bold z-10 relative" style={{ color: tokens.textPrimary }}>الأكثر طلبا</h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
          </div>
          <p className="mt-4" style={{ color: tokens.textMuted }}>قائمة بالمنتجات التي تباع بكثرة حاليا</p>
        </div>

        {/* Category Filter Tabs */}
        {storefrontCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => applyCategoryFilter(null)}
              className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
              style={selectedCategory === null
                ? { backgroundColor: theme.accent_color, color: '#fff', boxShadow: `0 4px 6px ${theme.accent_color}33` }
                : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}
            >
              الكل
            </button>
            {storefrontCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => applyCategoryFilter(cat.id)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
                style={selectedCategory === cat.id
                  ? { backgroundColor: theme.accent_color, color: '#fff', boxShadow: `0 4px 6px ${theme.accent_color}33` }
                  : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                stock={Number(product.stock)}
                compare_price={product.compare_price ? Number(product.compare_price) : null}
                image_url={product.image_url}
                category_name={product.category_name}
                custom_options={product.custom_options}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: tokens.textSoft }} />
            <p className="text-lg font-bold mb-2" style={{ color: tokens.textMuted }}>لا توجد منتجات حالياً</p>
            <p className="text-sm" style={{ color: tokens.textSoft }}>ترقب منتجاتنا الجديدة قريباً!</p>
          </div>
        )}
      </section>

      {/* Categories + Featured Banner */}
      <section className="py-10 sm:py-12 border-t overflow-x-clip" style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}>
        <div className="container mx-auto px-4">
          {featuredCategories.length > 0 && (
            <>
              <div className="text-center mb-10 flex flex-col items-center">
                <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
                  <Grid size={16} className="ml-2" /> التصنيفات
                </div>
                <div className="relative inline-block">
                  <h2 className="text-2xl sm:text-3xl font-bold z-10 relative" style={{ color: tokens.textPrimary }}>منتجات مختارة</h2>
                  <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                {featuredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => applyCategoryFilter(cat.id, true)}
                    className="group relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl border text-right shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}
                  >
                    <img src={cat.image_url || ""} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-500"></div>
                    <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-6 flex justify-between items-end gap-3">
                      <h3 className="text-white text-xl sm:text-2xl font-bold leading-tight">{cat.name}</h3>
                      <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm transition-all duration-300 shrink-0">
                        <ArrowLeft size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Featured Banner */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 group cursor-pointer shadow-md mt-6">
            <img src={theme.offers_banner_url || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200"} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Special Offers" />
            <div className="absolute inset-0 transition-colors duration-500" style={{ background: `linear-gradient(to top right, ${theme.accent_color}e6, ${theme.accent_color}66)` }}></div>
            <div className="absolute inset-0 flex flex-col justify-center items-start p-5 sm:p-10">
              <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 inline-flex items-center border border-white/30">
                <Tag size={16} className="ml-2" /> عروض حصرية
              </div>
              <h3 className="text-white text-2xl sm:text-4xl font-black mb-4 leading-tight">تخفيضات تصل لـ 50%</h3>
              <button
                type="button"
                onClick={scrollToOffers}
                className="bg-white px-6 sm:px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow inline-flex items-center"
                style={{ color: theme.accent_color }}
              >
                اكتشف العروض <ArrowLeft size={18} className="mr-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sale Products / Offers */}
      {saleProducts.length > 0 && (
        <section id="offers" className="container mx-auto px-4 py-8 sm:py-10 scroll-mt-20 overflow-x-clip">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
              <Tag size={16} className="ml-2" /> عروض حصرية
            </div>
            <div className="relative inline-block">
              <h2 className="text-2xl sm:text-3xl font-bold z-10 relative" style={{ color: tokens.textPrimary }}>تخفيضات</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
            </div>
            <p className="mt-4" style={{ color: tokens.textMuted }}>تخفيضات خيالية كل أسبوع</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {saleProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                stock={Number(product.stock)}
                compare_price={product.compare_price ? Number(product.compare_price) : null}
                image_url={product.image_url}
                category_name={product.category_name}
                custom_options={product.custom_options}
                theme={theme}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default StorePage;
