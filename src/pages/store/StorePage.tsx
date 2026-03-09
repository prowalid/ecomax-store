import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Phone, Truck, User, ShoppingBag, ChevronLeft, ChevronRight,
  ShieldCheck, Headphones, RotateCcw, Globe, Star, Flame, Tag, ArrowLeft, Grid, Loader2, Check
} from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/hooks/useCart";
import { useAppearanceSettings, defaultAppearance } from "@/hooks/useAppearanceSettings";
import { useTracking } from "@/hooks/useTracking";

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { addItem, isAdding } = useCart();
  const { settings: t, loading: themeLoading } = useAppearanceSettings();
  const theme = themeLoading ? defaultAppearance : t;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const slides = theme.slides?.length ? theme.slides : defaultAppearance.slides;
  const defaultCatImages = defaultAppearance.category_images;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeProducts = products.filter((p) => p.status === "active");
  const filteredProducts = selectedCategory
    ? activeProducts.filter((p) => p.category_id === selectedCategory)
    : activeProducts;
  const saleProducts = activeProducts.filter((p) => p.compare_price && Number(p.compare_price) > Number(p.price));

  const handleAddToCart = (product: any) => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_price: Number(product.price),
      product_image_url: product.image_url,
      quantity: 1,
    });
    toast.success("تمت الإضافة للسلة", { icon: <Check className="text-green-500" /> });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accent_color }} />
      </div>
    );
  }

  return (
    <>
      {/* Hero Slider */}
      <section className="container mx-auto py-6 px-4">
        <div className="relative rounded-2xl overflow-hidden h-[250px] md:h-[450px] shadow-lg group">
          {slides.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
              <img src={image} alt="Slide" className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[10s]" />
            </div>
          ))}
          <button
            onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: theme.accent_color }}
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: theme.accent_color }}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2 space-x-reverse">
            {slides.map((_, idx) => (
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
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: 'دفع آمن', sub: 'عند الاستلام 100%' },
            { icon: Headphones, title: 'دعم العملاء', sub: 'دعم فني متواصل' },
            { icon: RotateCcw, title: 'إرجاع سهل', sub: 'استبدال خلال 7 أيام' },
            { icon: Globe, title: 'شحن مجاني', sub: 'لكل الولايات' },
          ].map((badge, idx) => (
            <div key={idx} className="p-5 rounded-2xl flex items-center space-x-4 space-x-reverse border border-transparent hover:-translate-y-1 transition-all duration-300 cursor-pointer group" style={{ backgroundColor: theme.badge_bg }}>
              <div className="p-4 rounded-xl text-white transition-colors" style={{ backgroundColor: theme.accent_color + '66' }} >
                <badge.icon size={26} style={{ color: theme.button_text }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: theme.badge_text }}>{badge.title}</h3>
                <p className="text-sm text-gray-500">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section id="products" className="container mx-auto px-4 py-10 scroll-mt-20">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
            <Flame size={16} className="ml-2" /> الأكثر مبيعاً
          </div>
          <div className="relative inline-block">
            <h2 className="text-3xl font-bold text-gray-900 z-10 relative">الأكثر طلبا</h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
          </div>
          <p className="text-gray-500 mt-4">قائمة بالمنتجات التي تباع بكثرة حاليا</p>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
              style={selectedCategory === null
                ? { backgroundColor: theme.accent_color, color: '#fff', boxShadow: `0 4px 6px ${theme.accent_color}33` }
                : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
                style={selectedCategory === cat.id
                  ? { backgroundColor: theme.accent_color, color: '#fff', boxShadow: `0 4px 6px ${theme.accent_color}33` }
                  : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                <Link to={`/product/${product.id}`} className="relative overflow-hidden block cursor-pointer">
                  {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                    <span className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md" style={{ backgroundColor: theme.accent_color }}>تخفيض!</span>
                  )}
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center" style={{ color: theme.accent_color }}>
                      <ShoppingBag size={18} className="ml-2" /> عرض سريع
                    </span>
                  </div>
                </Link>
                <div className="p-5 text-center">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-gray-900 font-bold mb-3 line-clamp-2 h-12 transition-colors cursor-pointer hover:opacity-80">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-current" style={{ color: theme.accent_color }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center mb-5 space-x-2 space-x-reverse">
                    {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                      <span className="text-gray-400 line-through text-sm">{Number(product.compare_price).toLocaleString("ar-DZ")} دج</span>
                    )}
                    <span className="font-black text-xl" style={{ color: theme.accent_color }}>{Number(product.price).toLocaleString("ar-DZ")} دج</span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                    disabled={isAdding}
                    className="w-full text-white py-3 rounded-xl font-bold flex justify-center items-center transition-colors shadow-md disabled:opacity-50"
                    style={{ backgroundColor: theme.button_color, color: theme.button_text, boxShadow: `0 4px 6px ${theme.button_color}33` }}
                  >
                    <ShoppingBag size={20} className="ml-2" /> أضف إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">لا توجد منتجات حالياً</p>
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 flex flex-col items-center">
              <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
                <Grid size={16} className="ml-2" /> التصنيفات
              </div>
              <div className="relative inline-block">
                <h2 className="text-3xl font-bold text-gray-900 z-10 relative">منتجات مختارة</h2>
                <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {categories.slice(0, 3).map((cat, idx) => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer shadow-sm block w-full text-right">
                  <img src={cat.image_url || defaultCatImages[idx] || defaultCatImages[0]} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-500"></div>
                  <div className="absolute bottom-6 right-6 left-6 flex justify-between items-end">
                    <h3 className="text-white text-2xl font-bold">{cat.name}</h3>
                    <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm transition-all duration-300">
                      <ArrowLeft size={20} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Featured Banner */}
            <div className="relative rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-md mt-6">
              <img src={categories[3]?.image_url || defaultCatImages[0]} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Special Offers" />
              <div className="absolute inset-0 transition-colors duration-500" style={{ background: `linear-gradient(to top right, ${theme.accent_color}e6, ${theme.accent_color}66)` }}></div>
              <div className="absolute inset-0 flex flex-col justify-center items-start p-10">
                <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 inline-flex items-center border border-white/30">
                  <Tag size={16} className="ml-2" /> عروض حصرية
                </div>
                <h3 className="text-white text-4xl font-black mb-4">تخفيضات تصل لـ 50%</h3>
                <a href="/#offers" className="bg-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow flex items-center" style={{ color: theme.accent_color }}>
                  اكتشف العروض <ArrowLeft size={18} className="mr-2" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sale Products / Offers */}
      {saleProducts.length > 0 && (
        <section id="offers" className="container mx-auto px-4 py-10 scroll-mt-20">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md mb-4 inline-flex items-center" style={{ backgroundColor: theme.accent_color, boxShadow: `0 4px 6px ${theme.accent_color}33` }}>
              <Tag size={16} className="ml-2" /> عروض حصرية
            </div>
            <div className="relative inline-block">
              <h2 className="text-3xl font-bold text-gray-900 z-10 relative">تخفيضات</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-1.5 opacity-60 rounded-full w-full" style={{ backgroundColor: theme.accent_color }}></div>
            </div>
            <p className="text-gray-500 mt-4">تخفيضات خيالية كل أسبوع</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                <Link to={`/product/${product.id}`} className="relative overflow-hidden block cursor-pointer">
                  <span className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md" style={{ backgroundColor: theme.accent_color }}>تخفيض!</span>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center" style={{ color: theme.accent_color }}>
                      <ShoppingBag size={18} className="ml-2" /> عرض سريع
                    </span>
                  </div>
                </Link>
                <div className="p-5 text-center">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-gray-900 font-bold mb-3 line-clamp-2 h-12 transition-colors cursor-pointer">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-current" style={{ color: theme.accent_color }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center mb-5 space-x-2 space-x-reverse">
                    <span className="text-gray-400 line-through text-sm">{Number(product.compare_price).toLocaleString("ar-DZ")} دج</span>
                    <span className="font-black text-xl" style={{ color: theme.accent_color }}>{Number(product.price).toLocaleString("ar-DZ")} دج</span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                    disabled={isAdding}
                    className="w-full py-3 rounded-xl font-bold flex justify-center items-center transition-colors shadow-md disabled:opacity-50"
                    style={{ backgroundColor: theme.button_color, color: theme.button_text, boxShadow: `0 4px 6px ${theme.button_color}33` }}
                  >
                    <ShoppingBag size={20} className="ml-2" /> أضف إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default StorePage;

