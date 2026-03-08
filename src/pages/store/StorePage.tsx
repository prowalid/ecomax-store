import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Phone, Truck, User, ShoppingBag, ChevronLeft, ChevronRight,
  ShieldCheck, Headphones, RotateCcw, Globe, Star, X, Flame, Tag, ArrowLeft, Grid
} from "lucide-react";

const products = [
  { id: 1, name: 'كاميرا مراقبة ذكية لاسلكية مع رؤية ليلية', price: 4500, oldPrice: 6200, rating: 5, image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=600', sale: true },
  { id: 2, name: 'سماعات رأس احترافية عازلة للضوضاء', price: 8500, oldPrice: null, rating: 4, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', sale: false },
  { id: 3, name: 'ساعة ذكية رياضية مقاومة للماء', price: 3200, oldPrice: 4500, rating: 4, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', sale: true },
  { id: 4, name: 'مجموعة العناية بالبشرة الطبيعية', price: 2900, oldPrice: 3500, rating: 5, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600', sale: true },
];

const slides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600' },
  { id: 2, image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1600' },
];

const categories = [
  { id: 1, name: 'أجهزة إلكترونية', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'أدوات المطبخ', image: 'https://images.unsplash.com/photo-1556910103-1c02745a8720?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'ألعاب الأطفال', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=600' },
];

const StorePage = () => {
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

  const openQuickOrder = (product: any = products[0]) => {
    setSelectedProduct(product);
    setQty(1);
    setIsModalOpen(true);
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
              <Link to={`/product/${product.id}`} className="relative overflow-hidden block cursor-pointer">
                {product.sale && (
                  <span className="absolute top-3 right-3 bg-[#dc3545] text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">تخفيض!</span>
                )}
                <img src={product.image} alt={product.name} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />

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
                    <Star key={i} size={16} className={i < product.rating ? "text-[#dc3545] fill-current" : "text-gray-300"} />
                  ))}
                </div>
                <div className="flex items-center justify-center mb-5 space-x-2 space-x-reverse">
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through text-sm">{product.oldPrice} دج</span>
                  )}
                  <span className="text-[#dc3545] font-black text-xl">{product.price} دج</span>
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

      {/* Categories */}
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
            {categories.map(cat => (
              <div key={cat.id} className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer shadow-sm">
                <img src={cat.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-[#7f187f]/90 transition-colors duration-500"></div>
                <div className="absolute bottom-6 right-6 left-6 flex justify-between items-end">
                  <h3 className="text-white text-2xl font-bold">{cat.name}</h3>
                  <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm group-hover:bg-white group-hover:text-[#7f187f] transition-all duration-300">
                    <ArrowLeft size={20} />
                  </div>
                </div>
              </div>
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

      {/* Quick Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">

            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-5 text-center relative">
              <h3 className="text-white font-bold text-2xl drop-shadow-md">اطلب الآن</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <p className="text-center text-gray-500 mb-6 font-medium">املأ النموذج وسنتصل بك لتأكيد الطلب</p>

              {selectedProduct && (
                <div className="flex items-center p-3 mb-6 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
                  <img src={selectedProduct.image} alt="Product" className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                  <div className="mr-4 flex-1">
                    <h4 className="text-md font-bold text-gray-800 line-clamp-1 mb-1">{selectedProduct.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[#dc3545] font-black text-lg">{selectedProduct.price} دج</span>
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} type="button" className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">-</button>
                        <input type="text" readOnly value={qty} className="w-10 text-center font-bold text-sm outline-none" />
                        <button onClick={() => setQty(qty + 1)} type="button" className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><User size={20} /></div>
                  <input type="text" placeholder="الاسم الكامل" required className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-medium" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><Phone size={20} /></div>
                  <input type="tel" placeholder="رقم الهاتف" required className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-left font-medium text-gray-800" dir="ltr" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><Globe size={20} /></div>
                  <select required className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all appearance-none text-gray-800 font-medium cursor-pointer" defaultValue="">
                    <option value="" disabled>اختر الولاية...</option>
                    <option value="16">الجزائر العاصمة</option>
                    <option value="31">وهران</option>
                    <option value="15">تيزي وزو</option>
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><Truck size={20} /></div>
                  <input type="text" placeholder="البلدية / العنوان التفصيلي" required className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-medium" />
                </div>

                <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-200 mt-6 shadow-sm">
                  <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                    <span>المجموع الفرعي ({qty} قطعة):</span>
                    <span>{selectedProduct ? selectedProduct.price * qty : '0'} دج</span>
                  </div>
                  <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                    <span>التوصيل:</span>
                    <span className="text-green-600 font-bold">مجاني</span>
                  </div>
                  <div className="flex justify-between font-black text-xl border-t border-gray-300 pt-3 mt-1 text-gray-900">
                    <span>المجموع الكلي:</span>
                    <span className="text-[#dc3545]">{selectedProduct ? selectedProduct.price * qty : '0'} دج</span>
                  </div>
                </div>

                <button type="button" className="w-full bg-[#dc3545] text-white font-bold text-xl py-4 rounded-xl hover:bg-red-700 transition-all duration-300 mt-2 shadow-[0_8px_20px_rgba(220,53,69,0.3)] hover:-translate-y-1 flex justify-center items-center">
                  تأكيد الطلب الآن <Truck size={22} className="mr-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mobile Button */}
      <div className="fixed bottom-6 left-6 md:hidden z-40">
        <button onClick={() => openQuickOrder()} className="bg-[#dc3545] text-white p-4 rounded-full shadow-[0_8px_20px_rgba(220,53,69,0.4)] flex items-center justify-center animate-bounce">
          <ShoppingBag size={24} />
        </button>
      </div>
    </>
  );
};

export default StorePage;
