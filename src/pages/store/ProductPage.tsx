import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Phone, User, Truck, MapPin, ShoppingBag, Star, ChevronRight,
  CheckCircle2, AlertOctagon, TrendingUp, Clock, Package, Flame,
  ShieldCheck, Headphones, RotateCcw, Globe, Loader2, Check
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";
import { toast } from "sonner";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products = [], isLoading } = useProducts();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWilaya, setFormWilaya] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createOrder = useCreateOrder();
  const createCustomer = useCreateCustomer();
  const { addItem, isAdding } = useCart();

  const product = products.find((p) => p.id === id);
  const relatedProducts = products
    .filter((p) => p.id !== id && p.status === "active" && p.category_id === product?.category_id)
    .slice(0, 4);

  // Set active image when product loads
  useEffect(() => {
    if (product?.image_url) {
      setActiveImage(product.image_url);
    }
  }, [product]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !product) return;

    const subtotal = Number(product.price) * qty;

    let customerId: string | undefined;
    try {
      const customer = await createCustomer.mutateAsync({
        name: formName.trim(),
        phone: formPhone.trim(),
        wilaya: formWilaya.trim() || undefined,
        address: formAddress.trim() || undefined,
      });
      customerId = customer.id;
    } catch {}

    createOrder.mutate(
      {
        customer_name: formName.trim(),
        customer_phone: formPhone.trim(),
        wilaya: formWilaya.trim() || undefined,
        address: formAddress.trim() || undefined,
        subtotal,
        shipping_cost: 0,
        total: subtotal,
        customer_id: customerId,
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity: qty,
            unit_price: Number(product.price),
            total: subtotal,
          },
        ],
      },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_price: Number(product.price),
      product_image_url: product.image_url,
      quantity: qty,
    });
    toast.success(`تمت إضافة ${qty} قطعة للسلة`, {
      icon: <Check className="text-green-500" />,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#dc3545]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-500 mb-4">المنتج غير موجود</p>
        <Link to="/" className="text-[#dc3545] font-medium hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  const productImages = product.image_url ? [product.image_url] : [];

  return (
    <div className="font-[Cairo] pb-20 md:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 hidden md:block">
        <div className="container mx-auto px-4 text-sm text-gray-500 flex items-center">
          <Link to="/" className="hover:text-[#dc3545]">الرئيسية</Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <Link to="/shop" className="hover:text-[#dc3545]">المتجر</Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          {product.category_name && (
            <>
              <Link to={`/shop?category=${product.category_id}`} className="hover:text-[#dc3545]">{product.category_name}</Link>
              <ChevronRight size={14} className="mx-2 text-gray-400" />
            </>
          )}
          <span className="text-gray-800 font-semibold line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Images */}
          <div className="w-full lg:w-5/12">
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 mb-4 group cursor-zoom-in shadow-sm">
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-[#dc3545] text-white text-sm font-bold px-4 py-1.5 rounded-full z-10 shadow-md flex items-center">
                  <TrendingUp size={16} className="ml-1" /> وفر {discountPercent}%
                </span>
              )}
              {(activeImage || product.image_url) ? (
                <img
                  src={activeImage || product.image_url || ""}
                  alt={product.name}
                  className="w-full h-[400px] md:h-[500px] object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center text-8xl bg-gray-100">📦</div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img ? "border-[#dc3545] shadow-md scale-105" : "border-transparent hover:border-gray-300"}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-20 md:h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & COD Form */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>

            {/* Rating & sold */}
            <div className="flex items-center space-x-4 space-x-reverse mb-5 flex-wrap gap-y-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-current" />
                ))}
                <span className="text-gray-500 text-sm font-medium mr-2">(تقييم العملاء)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded flex items-center">
                <Flame size={14} className="ml-1 text-orange-500" /> منتج رائج
              </span>
            </div>

            {/* Price & Timer */}
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-end space-x-3 space-x-reverse mb-1">
                  <span className="text-4xl font-black text-[#dc3545] tracking-tight">{formatPrice(Number(product.price))}</span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through mb-1 font-semibold">{formatPrice(Number(product.compare_price))}</span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-[#dc3545] font-bold flex items-center">
                    <Clock size={14} className="ml-1" /> ينتهي العرض خلال: <span className="mr-1 bg-[#dc3545] text-white px-2 py-0.5 rounded text-xs">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>

              {/* Urgency Stock Bar */}
              {product.stock > 0 && product.stock <= 20 && (
                <div className="w-full md:w-48">
                  <p className="text-xs text-gray-600 font-bold mb-2 flex justify-between">
                    <span className="flex items-center text-red-600"><AlertOctagon size={14} className="ml-1" /> أسرع! الكمية محدودة</span>
                    <span>{product.stock} قطع فقط</span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-[#dc3545] h-2.5 rounded-full" style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {product.description && (
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-3 flex items-center border-b border-gray-100 pb-2">
                  <Package size={20} className="ml-2 text-gray-500" /> وصف المنتج:
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* In-Page Order Form */}
            <div id="order-form" className="bg-white border-2 border-[#dc3545]/20 shadow-[0_8px_30px_rgba(220,53,69,0.1)] rounded-3xl p-5 md:p-7 mt-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#dc3545] to-orange-400" />

              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h3>
                  <p className="text-sm text-gray-500 mb-6">سنتصل بك لتأكيد الطلب في أقرب وقت</p>
                  <Link to="/" className="inline-block bg-[#dc3545] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                    العودة للرئيسية
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900">للطلب أدخل معلوماتك هنا</h2>
                    <p className="text-gray-500 text-sm mt-1">والدفع يكون عند الاستلام (التوصيل مجاني)</p>
                  </div>

                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="الاسم الكامل"
                          required
                          className="w-full pr-11 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="رقم الهاتف"
                          required
                          className="w-full pr-11 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-left font-bold text-gray-800"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><MapPin size={18} /></div>
                        <input
                          type="text"
                          value={formWilaya}
                          onChange={(e) => setFormWilaya(e.target.value)}
                          placeholder="الولاية"
                          className="w-full pr-11 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400"><Truck size={18} /></div>
                        <input
                          type="text"
                          value={formAddress}
                          onChange={(e) => setFormAddress(e.target.value)}
                          placeholder="البلدية / العنوان"
                          className="w-full pr-11 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold"
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
                      <span className="font-bold text-gray-700">الكمية المطلوبة:</span>
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors">-</button>
                        <input type="text" readOnly value={qty} className="w-12 text-center font-bold text-gray-900 outline-none" />
                        <button type="button" onClick={() => setQty(qty + 1)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors">+</button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-200 mt-2 shadow-sm">
                      <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                        <span>المجموع الفرعي ({qty} قطعة):</span>
                        <span>{formatPrice(Number(product.price) * qty)}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                        <span>التوصيل:</span>
                        <span className="text-green-600 font-bold">مجاني</span>
                      </div>
                      <div className="flex justify-between font-black text-xl border-t border-gray-300 pt-3 mt-1 text-gray-900">
                        <span>المجموع الكلي:</span>
                        <span className="text-[#dc3545]">{formatPrice(Number(product.price) * qty)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={createOrder.isPending}
                      className="w-full bg-gradient-to-r from-[#dc3545] to-[#e84a59] text-white font-black text-xl py-4 rounded-xl hover:shadow-[0_8px_25px_rgba(220,53,69,0.35)] transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center mt-4 disabled:opacity-50"
                    >
                      {createOrder.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>اضغط هنا للطلب الآن <ShoppingBag size={24} className="mr-3 animate-pulse" /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      {product.description && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 inline-block border-b-4 border-[#dc3545] pb-2">وصف المنتج</h2>
            <div className="prose max-w-none text-gray-600 font-medium leading-relaxed text-lg">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "دفع آمن", sub: "عند الاستلام 100%" },
            { icon: Headphones, title: "دعم العملاء", sub: "دعم فني متواصل" },
            { icon: RotateCcw, title: "إرجاع سهل", sub: "استبدال خلال 7 أيام" },
            { icon: Globe, title: "شحن مجاني", sub: "لكل الولايات" },
          ].map((badge, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl flex items-center space-x-4 space-x-reverse border border-gray-100 hover:border-[#dc3545]/30 hover:shadow-lg transition-all duration-300">
              <div className="bg-red-50 p-4 rounded-xl text-[#dc3545]">
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 mt-6 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 inline-block border-b-4 border-[#dc3545] pb-2">منتجات ذات صلة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
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

      {/* Mobile Sticky Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 md:hidden z-50">
        <button
          onClick={() => document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full bg-[#dc3545] text-white font-bold text-lg py-3.5 rounded-xl shadow-[0_5px_15px_rgba(220,53,69,0.3)] flex justify-center items-center"
        >
          اطلب الآن والدفع عند الاستلام <ChevronRight size={20} className="mr-2" />
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
