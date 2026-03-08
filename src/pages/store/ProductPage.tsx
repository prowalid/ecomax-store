import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Truck, RotateCcw, CreditCard, ChevronDown, ChevronUp, Loader2, ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const features = [
  {
    key: "cod",
    icon: CreditCard,
    title: "سياسة الدفع عند الاستلام",
    content: "يمكنك الدفع عند استلام المنتج. ادفع نقداً عند التوصيل.",
  },
  {
    key: "warranty",
    icon: Shield,
    title: "ضمان 30 يوماً",
    content: "نضمن لك جودة المنتج لمدة 30 يوماً من تاريخ الشراء. في حال وجود أي عيب يمكنك استبداله.",
  },
  {
    key: "shipping",
    icon: Truck,
    title: "الشحن",
    content: "شحن مجاني لجميع الطلبات. التوصيل خلال 2-5 أيام عمل حسب موقعك.",
  },
  {
    key: "return",
    icon: RotateCcw,
    title: "سياسة الإرجاع",
    content: "يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام في حالة عدم الرضا.",
  },
];

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products = [], isLoading } = useProducts();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const product = products.find((p) => p.id === id);
  const relatedProducts = products
    .filter((p) => p.id !== id && p.status === "active" && p.category_id === product?.category_id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-500 mb-4">المنتج غير موجود</p>
        <Link to="/" className="text-[hsl(var(--primary))] font-medium hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);

  return (
    <div className="font-[Cairo]">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-[hsl(var(--primary))]">الرئيسية</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <Link to="/shop" className="hover:text-[hsl(var(--primary))]">المتجر</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-gray-600">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="aspect-square relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-50">📦</div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  تخفيض!
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-5">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

            {product.sku && (
              <p className="text-xs text-gray-400">رمز المنتج: <span className="text-gray-600">{product.sku}</span></p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[hsl(var(--primary))]">
                {formatPrice(Number(product.price))}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(Number(product.compare_price))}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Quick Order Button */}
            <button
              onClick={() => setOrderModalOpen(true)}
              className="w-full h-14 rounded-xl bg-[hsl(var(--primary))] text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--primary)/0.3)]"
            >
              🛒 اطلب الآن
            </button>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "ضمان 30 يوماً", icon: "✅" },
                { label: "شحن مجاني", icon: "✈️" },
                { label: "الدفع عند الاستلام", icon: "💰" },
              ].map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-700"
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Feature Dropdowns */}
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
              {features.map((feature) => (
                <div key={feature.key}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === feature.key ? null : feature.key)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className="w-4.5 h-4.5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">{feature.title}</span>
                    </div>
                    {openDropdown === feature.key ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {openDropdown === feature.key && (
                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
                      {feature.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Categories */}
            {product.category_name && (
              <p className="text-xs text-gray-400">
                التصنيف: <span className="text-[hsl(var(--primary))]">{product.category_name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 mt-10 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Sticky Order Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden z-50">
        <button
          onClick={() => setOrderModalOpen(true)}
          className="w-full h-12 rounded-xl bg-[hsl(var(--primary))] text-white font-bold text-base"
        >
          🛒 اطلب الآن — {formatPrice(Number(product.price))}
        </button>
      </div>

      {/* Quick Order Modal */}
      <QuickOrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          quantity: 1,
        }}
      />
    </div>
  );
};

export default ProductPage;
