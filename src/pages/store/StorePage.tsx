import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Phone, Truck, User, ShoppingBag, ChevronLeft, ChevronRight,
  ShieldCheck, Headphones, RotateCcw, Globe, Star, Flame, Tag, ArrowLeft, Grid, Loader2, Search, SlidersHorizontal, X, CheckCircle2, BadgePercent
} from "lucide-react";
import { usePaginatedProducts, type Product, type ProductSort } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/hooks/useCart";
import { useAppearanceSettings, defaultAppearance, type AppearanceSlide } from "@/hooks/useAppearanceSettings";
import { useTracking } from "@/hooks/useTracking";
import ProductCard from "@/components/store/ProductCard";
import { ProductCardSkeleton, CategorySkeleton, HeroSkeleton, FilterBarSkeleton } from "@/components/store/StoreSkeleton";
import { getStoreThemeTokens } from "@/lib/storeTheme";
import { useSEO } from "@/hooks/useSEO";

const SEARCH_DEBOUNCE_MS = 350;
const StorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("q") || "";
  const sortFromUrl = (searchParams.get("sort") as ProductSort | null) || "newest";
  const inStockFromUrl = searchParams.get("in_stock") === "1";
  const onSaleFromUrl = searchParams.get("on_sale") === "1";
  const deferredSearch = useDeferredValue(searchFromUrl);

  // Local search input state with debounce
  const [localSearch, setLocalSearch] = useState(searchFromUrl);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync local state from URL (backward navigation, etc.)
  useEffect(() => {
    setLocalSearch(searchFromUrl);
  }, [searchFromUrl]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        const nextParams = new URLSearchParams(searchParams);
        const trimmed = value.trim();
        if (!trimmed) nextParams.delete("q");
        else nextParams.set("q", trimmed);
        setSearchParams(nextParams, { replace: true });
      }, SEARCH_DEBOUNCE_MS);
    },
    [searchParams, setSearchParams],
  );

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(searchTimerRef.current), []);
  const { data: categories = [] } = useCategories();
  const storefrontCategories = categories.filter((category) => Boolean(category?.id));
  const selectedCategoryEntry = useMemo(
    () => storefrontCategories.find((category) => category.slug === categorySlug) ?? null,
    [storefrontCategories, categorySlug]
  );
  const categoryFromRoute = selectedCategoryEntry?.id ?? null;

  const [currentPage, setCurrentPage] = useState(1);
  const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);
  const { data: paginatedProducts, isLoading, isFetching } = usePaginatedProducts({
    categoryId: categoryFromRoute,
    search: deferredSearch,
    sort: sortFromUrl,
    inStockOnly: inStockFromUrl,
    onSaleOnly: onSaleFromUrl,
  }, { page: currentPage, limit: 12 });
  const { addItem, isAdding } = useCart();
  const { settings: theme } = useAppearanceSettings();
  const tokens = getStoreThemeTokens(theme);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedSlideIndexes, setFailedSlideIndexes] = useState<number[]>([]);
  const activeSlides = (theme.slides || []).filter((slide): slide is AppearanceSlide => Boolean(slide?.image_url));
  const resolvedSlides = activeSlides;
  useEffect(() => {
    setFailedSlideIndexes([]);
  }, [theme.slides]);

  useEffect(() => {
    setCurrentPage(1);
    setLoadedProducts([]);
  }, [searchParams, location.pathname]);

  useEffect(() => {
    if (!paginatedProducts) {
      return;
    }

    setLoadedProducts((previous) => {
      if (currentPage === 1) {
        return paginatedProducts.items;
      }

      const existingIds = new Set(previous.map((product) => product.id));
      const nextItems = paginatedProducts.items.filter((product) => !existingIds.has(product.id));
      return [...previous, ...nextItems];
    });
  }, [currentPage, paginatedProducts]);

  useEffect(() => {
    // Reset slide index if it exceeds new active slides boundary
    setCurrentSlide(prev => prev >= resolvedSlides.length ? 0 : prev);
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= resolvedSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [resolvedSlides.length]);

  const selectedCategory = categoryFromRoute;
  const activeProducts = loadedProducts.filter((p) => p.status === "active");
  const featuredCategories = storefrontCategories.filter((category) => Boolean(category?.image_url));
  const filteredProducts = activeProducts;
  const saleProducts = activeProducts.filter((p) => p.compare_price && Number(p.compare_price) > Number(p.price));
  const maxDiscount = saleProducts.reduce((max, p) => {
    const percent = Math.round(((Number(p.compare_price) - Number(p.price)) / Number(p.compare_price)) * 100);
    return percent > max ? percent : max;
  }, 0);
  const selectedCategoryName = useMemo(
    () => storefrontCategories.find((category) => category.id === selectedCategory)?.name ?? null,
    [selectedCategory, storefrontCategories]
  );
  const hasDiscoveryFilters = Boolean(searchFromUrl.trim() || categorySlug || sortFromUrl !== "newest" || inStockFromUrl || onSaleFromUrl);
  const isLandingMode = location.pathname === "/" && !hasDiscoveryFilters;
  const resultsHeading = selectedCategoryName
    ? `منتجات ${selectedCategoryName}`
    : searchFromUrl.trim()
      ? `نتائج البحث عن "${searchFromUrl.trim()}"`
      : "كل المنتجات";
  const resultsDescription = selectedCategoryName
    ? `تصفح منتجات تصنيف ${selectedCategoryName} بسهولة مع فلترة وترتيب أوضح للعثور على الأنسب بسرعة.`
    : searchFromUrl.trim()
      ? `نتائج مطابقة لعبارة ${searchFromUrl.trim()} مع خيارات ترتيب وفلترة تساعد الزبون على الوصول للمنتج المناسب بسرعة.`
      : "تصفح الكتالوج الكامل مع أدوات اكتشاف أبسط وروابط أوضح للتصنيفات والنتائج.";

  const { track } = useTracking();

  // Dynamic SEO meta tags for store / category pages
  useSEO({
    title: selectedCategoryName
      ? `${selectedCategoryName} | ${theme.store_name || "المتجر"}`
      : searchFromUrl.trim()
        ? `بحث: ${searchFromUrl.trim()} | ${theme.store_name || "المتجر"}`
        : undefined,
    description: selectedCategoryName
      ? `تصفح منتجات ${selectedCategoryName} بأفضل الأسعار مع التوصيل لكل الولايات`
      : undefined,
    ogImage: selectedCategoryEntry?.image_url || undefined,
    canonicalPath: categorySlug ? `/category/${categorySlug}` : "/shop",
  });

  const getSlideSrc = (image: string, index: number) => {
    if (!failedSlideIndexes.includes(index)) {
      return image;
    }
    return image;
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

  const updateDiscoveryParams = (
    updates: { categorySlug?: string | null; q?: string | null; sort?: ProductSort | null; inStock?: boolean | null; onSale?: boolean | null },
    shouldScroll = false,
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.q !== undefined) {
      const nextQuery = updates.q?.trim();
      if (!nextQuery) nextParams.delete("q");
      else nextParams.set("q", nextQuery);
    }

    if (updates.sort !== undefined) {
      if (!updates.sort || updates.sort === "newest") nextParams.delete("sort");
      else nextParams.set("sort", updates.sort);
    }

    if (updates.inStock !== undefined) {
      if (updates.inStock) nextParams.set("in_stock", "1");
      else nextParams.delete("in_stock");
    }

    if (updates.onSale !== undefined) {
      if (updates.onSale) nextParams.set("on_sale", "1");
      else nextParams.delete("on_sale");
    }

    const targetPath = updates.categorySlug !== undefined
      ? (updates.categorySlug ? `/category/${updates.categorySlug}` : (nextParams.toString() ? "/shop" : "/"))
      : location.pathname;

    navigate(
      {
        pathname: targetPath,
        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
      },
      { replace: true, preventScrollReset: true }
    );
    
    if (shouldScroll) {
      setTimeout(() => {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const applyCategoryFilter = (slug: string | null, shouldScroll = false) => {
    updateDiscoveryParams({ categorySlug: slug }, shouldScroll);
  };

  useEffect(() => {
    if (!categorySlug) {
      return;
    }

    const categoryExists = storefrontCategories.some((category) => category.slug === categorySlug);
    if (!categoryExists && storefrontCategories.length > 0) {
      navigate({ pathname: "/shop", search: searchParams.toString() ? `?${searchParams.toString()}` : "" }, { replace: true });
    }
  }, [categorySlug, storefrontCategories, navigate, searchParams]);

  useEffect(() => {
    const baseTitle = selectedCategoryName
      ? `${selectedCategoryName} | ${theme.store_name || "Ecomax Store"}`
      : searchFromUrl.trim()
        ? `نتائج البحث: ${searchFromUrl.trim()} | ${theme.store_name || "Ecomax Store"}`
        : location.pathname === "/shop"
          ? `كل المنتجات | ${theme.store_name || "Ecomax Store"}`
          : `${theme.store_name || "Ecomax Store"} | متجر إلكتروني`;

    document.title = baseTitle;

    const description = resultsDescription;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute("content", description);

    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute("href", `${window.location.origin}${location.pathname}${location.search}`);
  }, [location.pathname, location.search, resultsDescription, searchFromUrl, selectedCategoryName, theme.store_name]);

  const scrollToOffers = () => {
    document.getElementById("offers")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "/#offers");
  };

  if (isLoading) {
    return (
      <>
        {/* Skeleton Hero */}
        <section className="container mx-auto py-4 sm:py-6 px-4">
          <HeroSkeleton />
        </section>
        {/* Skeleton Trust Badges */}
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <CategorySkeleton count={4} />
        </section>
        {/* Skeleton Products */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex justify-center mb-8"><div className="bg-slate-200 animate-pulse rounded-full h-8 w-40" /></div>
          <FilterBarSkeleton />
          <div className="mt-6">
            <ProductCardSkeleton count={8} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {isLandingMode && resolvedSlides.length > 0 && (
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
      </>
      )}

      {/* Popular Products */}
      <section id="products" className="container mx-auto px-4 py-8 sm:py-10 scroll-mt-20 overflow-x-clip">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
            {isLandingMode ? <Flame size={16} className="ml-2" /> : <Search size={16} className="ml-2" />}
            {isLandingMode ? "الأكثر مبيعاً" : "اكتشف المنتجات"}
          </div>
          <div className="relative inline-block">
                <h1 className="text-2xl sm:text-3xl font-bold z-10 relative" style={{ color: tokens.textPrimary }}>
                  {isLandingMode ? "الأكثر طلبا" : resultsHeading}
                </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
          </div>
          <p className="mt-4" style={{ color: tokens.textMuted }}>
            {isLandingMode ? "قائمة بالمنتجات التي تباع بكثرة حاليا" : resultsDescription}
          </p>
        </div>

        <div
          className="mb-8 rounded-[2rem] p-4 sm:p-5"
          style={{ backgroundColor: tokens.surface, border: `1px solid ${tokens.border}` }}
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.7fr)]">
            <label
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }}
            >
              <Search className="h-5 w-5 shrink-0" style={{ color: theme.accent_color }} />
              <input
                value={localSearch}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="ابحث باسم المنتج أو الوصف أو التصنيف"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                style={{ color: tokens.textPrimary }}
              />
            </label>

            <label
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }}
            >
              <SlidersHorizontal className="h-5 w-5 shrink-0" style={{ color: theme.accent_color }} />
              <select
                value={sortFromUrl}
                onChange={(event) => updateDiscoveryParams({ sort: event.target.value as ProductSort })}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: tokens.textPrimary }}
              >
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="name_asc">الاسم: أبجديًا</option>
                <option value="discount_desc">الأكثر تخفيضًا</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateDiscoveryParams({ inStock: !inStockFromUrl })}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all"
              style={inStockFromUrl
                ? { backgroundColor: theme.accent_color, color: "#fff" }
                : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}
            >
              <CheckCircle2 className="h-4 w-4" />
              المتاح فقط
            </button>

            <button
              type="button"
              onClick={() => updateDiscoveryParams({ onSale: !onSaleFromUrl })}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all"
              style={onSaleFromUrl
                ? { backgroundColor: theme.accent_color, color: "#fff" }
                : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}
            >
              <BadgePercent className="h-4 w-4" />
              العروض فقط
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategoryName && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-bold"
                  style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary }}
                >
                  {selectedCategoryName}
                  <button type="button" onClick={() => updateDiscoveryParams({ categorySlug: null })} aria-label="إزالة التصنيف">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {searchFromUrl.trim() && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-bold"
                  style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary }}
                >
                  "{searchFromUrl.trim()}"
                  <button type="button" onClick={() => updateDiscoveryParams({ q: null })} aria-label="إزالة البحث">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {inStockFromUrl && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-bold"
                  style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary }}
                >
                  المتاح فقط
                  <button type="button" onClick={() => updateDiscoveryParams({ inStock: false })} aria-label="إزالة فلتر المتاح">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {onSaleFromUrl && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-bold"
                  style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary }}
                >
                  العروض فقط
                  <button type="button" onClick={() => updateDiscoveryParams({ onSale: false })} aria-label="إزالة فلتر العروض">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {(selectedCategoryName || searchFromUrl.trim() || sortFromUrl !== "newest" || inStockFromUrl || onSaleFromUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    navigate("/", { replace: true });
                  }}
                  className="text-sm font-bold transition-opacity hover:opacity-80"
                  style={{ color: theme.accent_color }}
                >
                  تصفير الفلاتر
                </button>
              )}
              <span style={{ color: tokens.textMuted }}>
                {isFetching && currentPage > 1
                  ? "جاري تحميل المزيد..."
                  : `${paginatedProducts?.pagination.total ?? filteredProducts.length} منتج`}
              </span>
            </div>
          </div>
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
                onClick={() => applyCategoryFilter(cat.slug || null)}
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
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

            {Boolean(paginatedProducts?.pagination.hasNextPage) && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={isFetching}
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-bold shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:shadow-md hover:ring-gray-300 active:scale-95"
                  style={{ color: tokens.textPrimary }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]" 
                    style={{ backgroundColor: theme.accent_color }} 
                  />
                  <span>{isFetching ? "جاري تحميل المزيد..." : "عرض المزيد من المنتجات"}</span>
                  <span 
                    className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-gray-100 px-1.5 text-[11px] font-black text-gray-500 transition-colors duration-300 group-hover:bg-gray-200 group-hover:text-gray-900"
                  >
                    +{Math.max((paginatedProducts?.pagination.total ?? filteredProducts.length) - filteredProducts.length, 0)}
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: tokens.textSoft }} />
            <p className="text-lg font-bold mb-2" style={{ color: tokens.textMuted }}>لا توجد نتائج مطابقة الآن</p>
            <p className="text-sm" style={{ color: tokens.textSoft }}>
              جرّب تغيير التصنيف أو تقليل كلمات البحث أو العودة إلى عرض كل المنتجات.
            </p>
          </div>
        )}
      </section>

      {/* Categories + Featured Banner */}
      {isLandingMode && (
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
                    onClick={() => applyCategoryFilter(cat.slug || null, true)}
                    className="group relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl border text-right shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}
                  >
                    <img loading="lazy" src={cat.image_url || ""} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
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

          {theme.offers_banner_url?.trim() && (
            <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 group cursor-pointer shadow-md mt-6">
              <img loading="lazy" src={theme.offers_banner_url} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Special Offers" />
              <div className="absolute inset-0 transition-colors duration-500" style={{ background: `linear-gradient(to top right, ${theme.accent_color}e6, ${theme.accent_color}66)` }}></div>
              <div className="absolute inset-0 flex flex-col justify-center items-start p-5 sm:p-10">
                <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 inline-flex items-center border border-white/30">
                  <Tag size={16} className="ml-2" /> عروض حصرية
                </div>
                <h3 className="text-white text-2xl sm:text-4xl font-black mb-4 leading-tight">
                  {maxDiscount > 0 ? `تخفيضات تصل لـ ${maxDiscount}%` : "عروض وتخفيضات مميزة"}
                </h3>
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
          )}
        </div>
      </section>
      )}

      {/* Sale Products / Offers */}
      {isLandingMode && saleProducts.length > 0 && (
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
                slug={product.slug}
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
