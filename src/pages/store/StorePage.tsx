import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Headphones, RotateCcw, Globe, Flame, Tag,
  Loader2, Grid, ChevronLeft, ChevronRight, ArrowLeft, ShoppingBag
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";

const heroSlides = [
  { image: "/images/slide-1.png", alt: "عروض حصرية" },
  { image: "/images/slide-2.png", alt: "تسوق الآن" },
];

const defaultCatImages = [
  "/images/cat-electronics.png",
  "/images/cat-kitchen.png",
  "/images/cat-toys.png",
];

const trustBadges = [
  { icon: ShieldCheck, title: "دفع آمن", sub: "عند الاستلام 100%" },
  { icon: Headphones, title: "دعم العملاء", sub: "دعم فني متواصل" },
  { icon: RotateCcw, title: "إرجاع سهل", sub: "استبدال خلال 7 أيام" },
  { icon: Globe, title: "شحن مجاني", sub: "لكل الولايات" },
];

const StorePage = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
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

  const handleQuickOrder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
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
        <Loader2 className="w-8 h-8 animate-spin text-[#dc3545]" />
      </div>
    );
  }

  return (
    <div className="font-[Cairo]">
      {/* Hero Slider */}
      <section className="container mx-auto py-6 px-4">
        <div className="relative rounded-2xl overflow-hidden h-[250px] md:h-[450px] shadow-lg group">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
              <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[10s]" />
            </div>
          ))}

          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2 space-x-reverse">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? "w-8 bg-[#dc3545]" : "w-2 bg-white/70 hover:bg-white"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="bg-[#f4f6f8] p-5 rounded-2xl flex items-center space-x-4 space-x-reverse border border-transparent hover:border-[#dc3545]/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
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
          <div className="bg-[#dc3545] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-red-200 mb-4 inline-flex items-center">
            <Flame size={16} className="ml-2" /> الأكثر مبيعاً
          </div>
          <div className="relative inline-block">
            <h2 className="text-3xl font-bold text-gray-900 z-10 relative">الأكثر طلبا</h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#dc3545] opacity-60 rounded-full w-full" />
          </div>
          <p className="text-gray-500 mt-4">قائمة بالمنتجات التي تباع بكثرة حاليا</p>
        </div>

        {activeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeProducts.map((p) => (
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

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 flex flex-col items-center">
              <div className="bg-[#dc3545] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-red-200 mb-4 inline-flex items-center">
                <Grid size={16} className="ml-2" /> التصنيفات
              </div>
              <div className="relative inline-block">
                <h2 className="text-3xl font-bold text-gray-900 z-10 relative">منتجات مختارة</h2>
                <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#dc3545] opacity-60 rounded-full w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {categories.slice(0, 3).map((cat, idx) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer shadow-sm block"
                >
                  <img src={defaultCatImages[idx] || defaultCatImages[0]} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-[#dc3545]/90 transition-colors duration-500" />
                  <div className="absolute bottom-6 right-6 left-6 flex justify-between items-end">
                    <h3 className="text-white text-2xl font-bold">{cat.name}</h3>
                    <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm group-hover:bg-white group-hover:text-[#dc3545] transition-all duration-300">
                      <ArrowLeft size={20} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Featured Banner */}
            <div className="relative rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-md mt-6">
              <img src="/images/cat-special-offers.png" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="عروض حصرية" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#dc3545]/90 to-[#dc3545]/40 transition-colors duration-500" />
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
            <div className="bg-[#dc3545] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-red-200 mb-4 inline-flex items-center">
              <Tag size={16} className="ml-2" /> عروض حصرية
            </div>
            <div className="relative inline-block">
              <h2 className="text-3xl font-bold text-gray-900 z-10 relative">تخفيضات</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#dc3545] opacity-60 rounded-full w-full" />
            </div>
            <p className="text-gray-500 mt-4">تخفيضات خيالية كل أسبوع</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Floating Mobile Cart Button */}
      <div className="fixed bottom-6 left-6 md:hidden z-40">
        <button
          onClick={() => activeProducts[0] && handleQuickOrder(activeProducts[0].id)}
          className="bg-[#dc3545] text-white p-4 rounded-full shadow-[0_8px_20px_rgba(220,53,69,0.4)] flex items-center justify-center animate-bounce"
        >
          <ShoppingBag size={24} />
        </button>
      </div>

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

export default StorePage;
