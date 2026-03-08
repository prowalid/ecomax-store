import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Phone, Truck, User, ShoppingBag, ChevronLeft, ChevronRight,
  ShieldCheck, Headphones, RotateCcw, Globe, Star, X, Flame, Tag, ArrowLeft, Grid, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import QuickOrderModal from "@/components/store/QuickOrderModal";

const slides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600' },
  { id: 2, image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1600' },
];

const defaultCatImages = [
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1556910103-1c02745a8720?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=600',
];

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeProducts = products.filter((p) => p.status === "active");
  const saleProducts = activeProducts.filter((p) => p.compare_price && Number(p.compare_price) > Number(p.price));

  const openQuickOrder = useCallback((product: any) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url || product.image,
      quantity: 1,
    });
    setQty(1);
    setIsModalOpen(true);
  }, []);

  const showNoProductsQuickOrderToast = useCallback(() => {
    toast.error("لا توجد منتجات متاحة حالياً للطلب السريع");
  }, []);

  const handleCloseQuickOrder = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);

    if (searchParams.get("quickOrder") === "1") {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("quickOrder");
      nextParams.delete("ts");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const openHeaderQuickOrder = useCallback(() => {
    if (activeProducts.length === 0) {
      showNoProductsQuickOrderToast();
      return false;
    }

    openQuickOrder(activeProducts[0]);
    return true;
  }, [activeProducts, openQuickOrder, showNoProductsQuickOrderToast]);

  useEffect(() => {
    if (searchParams.get("quickOrder") !== "1" || isModalOpen) return;

    const opened = openHeaderQuickOrder();

    if (!opened) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("quickOrder");
      nextParams.delete("ts");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, isModalOpen, openHeaderQuickOrder, setSearchParams]);

  useEffect(() => {
    const handleHeaderQuickOrder = () => {
      openHeaderQuickOrder();
    };

    window.addEventListener("store:open-quick-order", handleHeaderQuickOrder as EventListener);
    return () => {
      window.removeEventListener("store:open-quick-order", handleHeaderQuickOrder as EventListener);
    };
  }, [openHeaderQuickOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#dc3545]" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Slider */}
      <section className="container mx-auto py-6 px-4">
        <div className="relative rounded-2xl overflow-hidden h-[250px] md:h-[450px] shadow-lg group">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
              <img src={slide.image} alt="Slide" className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[10s]" />
            </div>
          ))}

          <button
            onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full text-[#7f187f] shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full text-[#7f187f] shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2 space-x-reverse">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 bg-[#dc3545]' : 'w-2 bg-white/70 hover:bg-white'}`}
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
            <div key={idx} className="bg-[#f4f6f8] p-5 rounded-2xl flex items-center space-x-4 space-x-reverse border border-transparent hover:border-[#7f187f]/20 hover:shadow-[0_12px_32px_rgba(127,24,127,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className="bg-[#f99898] p-4 rounded-xl text-white group-hover:bg-[#dc3545] transition-colors">
                <badge.icon size={26} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{badge.title}</h3>
                <p className="text-sm text-gray-500">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="container mx-auto px-4 py-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="bg-gradient-to-r from-[#dc3545] to-[#dc3545] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-red-200 mb-4 inline-flex items-center">
            <Flame size={16} className="ml-2" /> الأكثر مبيعاً
          </div>
          <div className="relative inline-block">
            <h2 className="text-3xl font-bold text-gray-900 z-10 relative">الأكثر طلبا</h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#dc3545] opacity-60 rounded-full w-full"></div>
          </div>
          <p className="text-gray-500 mt-4">قائمة بالمنتجات التي تباع بكثرة حاليا</p>
        </div>

        {activeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                <Link to={`/product/${product.id}`} className="relative overflow-hidden block cursor-pointer">
                  {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                    <span className="absolute top-3 right-3 bg-[#dc3545] text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">تخفيض!</span>
                  )}
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-[#dc3545] font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center">
                      <ShoppingBag size={18} className="ml-2" /> عرض سريع
                    </span>
                  </div>
                </Link>

                <div className="p-5 text-center">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-gray-900 font-bold mb-3 line-clamp-2 h-12 hover:text-[#dc3545] transition-colors cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-[#dc3545] fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center justify-center mb-5 space-x-2 space-x-reverse">
                    {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                      <span className="text-gray-400 line-through text-sm">{Number(product.compare_price).toLocaleString("ar-DZ")} دج</span>
                    )}
                    <span className="text-[#dc3545] font-black text-xl">{Number(product.price).toLocaleString("ar-DZ")} دج</span>
                  </div>
                  <button
                    onClick={() => openQuickOrder(product)}
                    className="w-full bg-[#dc3545] text-white py-3 rounded-xl font-bold flex justify-center items-center hover:bg-red-700 transition-colors shadow-md shadow-red-200"
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
              <div className="bg-gradient-to-r from-[#dc3545] to-[#dc3545] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-red-200 mb-4 inline-flex items-center">
                <Grid size={16} className="ml-2" /> التصنيفات
              </div>
              <div className="relative inline-block">
                <h2 className="text-3xl font-bold text-gray-900 z-10 relative">منتجات مختارة</h2>
                <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#dc3545] opacity-60 rounded-full w-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {categories.slice(0, 3).map((cat, idx) => (
                <Link key={cat.id} to={`/shop?category=${cat.id}`} className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer shadow-sm block">
                  <img src={defaultCatImages[idx] || defaultCatImages[0]} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-[#7f187f]/90 transition-colors duration-500"></div>
                  <div className="absolute bottom-6 right-6 left-6 flex justify-between items-end">
                    <h3 className="text-white text-2xl font-bold">{cat.name}</h3>
                    <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm group-hover:bg-white group-hover:text-[#7f187f] transition-all duration-300">
                      <ArrowLeft size={20} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Featured Banner */}
            <div className="relative rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-md mt-6">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Special Offers" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#dc3545]/90 to-[#dc3545]/40 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-start p-10">
                <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 inline-flex items-center border border-white/30">
                  <Tag size={16} className="ml-2" /> عروض حصرية
                </div>
                <h3 className="text-white text-4xl font-black mb-4">تخفيضات تصل لـ 50%</h3>
                <Link to="/shop" className="bg-white text-[#dc3545] px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow flex items-center">
                  اكتشف العروض <ArrowLeft size={18} className="mr-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="bg-gradient-to-r from-[#dc3545] to-[#dc3545] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-red-200 mb-4 inline-flex items-center">
              <Tag size={16} className="ml-2" /> عروض حصرية
            </div>
            <div className="relative inline-block">
              <h2 className="text-3xl font-bold text-gray-900 z-10 relative">تخفيضات</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#dc3545] opacity-60 rounded-full w-full"></div>
            </div>
            <p className="text-gray-500 mt-4">تخفيضات خيالية كل أسبوع</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                <Link to={`/product/${product.id}`} className="relative overflow-hidden block cursor-pointer">
                  <span className="absolute top-3 right-3 bg-[#dc3545] text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">تخفيض!</span>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-6xl">📦</div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-[#dc3545] font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center">
                      <ShoppingBag size={18} className="ml-2" /> عرض سريع
                    </span>
                  </div>
                </Link>
                <div className="p-5 text-center">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-gray-900 font-bold mb-3 line-clamp-2 h-12 hover:text-[#dc3545] transition-colors cursor-pointer">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-[#dc3545] fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center justify-center mb-5 space-x-2 space-x-reverse">
                    <span className="text-gray-400 line-through text-sm">{Number(product.compare_price).toLocaleString("ar-DZ")} دج</span>
                    <span className="text-[#dc3545] font-black text-xl">{Number(product.price).toLocaleString("ar-DZ")} دج</span>
                  </div>
                  <button
                    onClick={() => openQuickOrder(product)}
                    className="w-full bg-[#dc3545] text-white py-3 rounded-xl font-bold flex justify-center items-center hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                  >
                    <ShoppingBag size={20} className="ml-2" /> أضف إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Order Modal */}
      {selectedProduct && isModalOpen && (
        <QuickOrderModal
          open={isModalOpen}
          onClose={handleCloseQuickOrder}
          product={selectedProduct}
        />
      )}

      {/* Floating Mobile Button */}
      <div className="fixed bottom-6 left-6 md:hidden z-40">
        <button
          onClick={() => activeProducts[0] && openQuickOrder(activeProducts[0])}
          className="bg-[#dc3545] text-white p-4 rounded-full shadow-[0_8px_20px_rgba(220,53,69,0.4)] flex items-center justify-center animate-bounce"
        >
          <ShoppingBag size={24} />
        </button>
      </div>
    </>
  );
};

export default StorePage;
