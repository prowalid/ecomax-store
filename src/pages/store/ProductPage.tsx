import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Truck, RotateCcw, CreditCard, ChevronDown, ChevronUp, Loader2, ArrowLeft, Star, ShoppingCart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/store/ProductCard";
import QuickOrderModal from "@/components/store/QuickOrderModal";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const features = [
  {
    key: "cod",
    icon: CreditCard,
    title: "سياسة الدفع عند الاستلام",
    content: "يمكنك الدفع عند استلام المنتج. ادفع نقداً أو ببطاقة الائتمان عند التوصيل.",
  },
  {
    key: "warranty",
    icon: Shield,
    title: "ضمان 30 يوماً",
    content: "نضمن لك جودة المنتج لمدة 30 يوماً من تاريخ الشراء. في حال وجود أي عيب في التصنيع، يمكنك استبداله أو استرداد قيمته.",
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
    content: "يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام في حالة عدم الرضا أو وجود عيب. المنتج يجب أن يكون في حالته الأصلية.",
  },
];

const trustBadges = [
  { label: "ضمان 30 يوماً", icon: "✅" },
  { label: "شحن مجاني", icon: "✈️" },
  { label: "الدفع عند الاستلام", icon: "💰" },
];

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products = [], isLoading } = useProducts();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "info">("description");

  const product = products.find((p) => p.id === id);
  const relatedProducts = products
    .filter((p) => p.id !== id && p.status === "active" && p.category_id === product?.category_id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground mb-4">المنتج غير موجود</p>
        <Link to="/" className="text-primary font-medium hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <div className="font-[Cairo]">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowLeft className="w-3 h-3" />
            <Link to="/shop" className="hover:text-primary transition-colors">المتجر</Link>
            <ArrowLeft className="w-3 h-3" />
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden relative group">
              <div className="aspect-square">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-muted/20">📦</div>
                )}
              </div>
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full sale-badge">
                  تخفيض!
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.name}</h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">(تقييم العملاء)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-primary">
                {formatPrice(Number(product.price))}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(Number(product.compare_price))}
                  </span>
                  <span className="text-xs font-bold text-destructive-foreground bg-destructive px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-muted-foreground">
                رمز المنتج: <span className="text-foreground font-medium">{product.sku}</span>
              </p>
            )}

            {/* Quick Order Button - Large & Prominent */}
            <button
              onClick={() => setOrderModalOpen(true)}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 add-to-cart-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              اطلب الآن
            </button>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/50 rounded-full text-xs font-medium text-foreground"
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Feature Dropdowns */}
            <div className="border border-border/50 rounded-xl overflow-hidden divide-y divide-border/50">
              {features.map((feature) => {
                const isOpen = openDropdown === feature.key;
                return (
                  <div key={feature.key}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : feature.key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <feature.icon className="w-[18px] h-[18px] text-foreground/70" />
                        <span className="text-sm font-medium text-foreground">{feature.title}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {feature.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Categories & Meta */}
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              {product.category_name && (
                <p className="text-xs text-muted-foreground">
                  التصنيف: <Link to={`/shop?category=${product.category_id}`} className="text-primary hover:underline">{product.category_name}</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Description */}
      {product.description && (
        <div className="container mx-auto px-4 mt-4 mb-8">
          <div className="border border-border/50 rounded-xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-border/50">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${activeTab === "description" ? "text-primary border-b-2 border-primary bg-muted/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                الوصف
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${activeTab === "info" ? "text-primary border-b-2 border-primary bg-muted/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                معلومات إضافية
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" ? (
                <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
                  <h2 className="text-base font-bold text-foreground mb-3">الوصف</h2>
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-base font-bold text-foreground mb-3">معلومات إضافية</h2>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border/30">
                        <td className="py-2.5 text-muted-foreground font-medium w-1/3">الحالة</td>
                        <td className="py-2.5 text-foreground">{product.status === "active" ? "متوفر" : "غير متوفر"}</td>
                      </tr>
                      {product.sku && (
                        <tr className="border-b border-border/30">
                          <td className="py-2.5 text-muted-foreground font-medium">رمز المنتج</td>
                          <td className="py-2.5 text-foreground">{product.sku}</td>
                        </tr>
                      )}
                      {product.category_name && (
                        <tr className="border-b border-border/30">
                          <td className="py-2.5 text-muted-foreground font-medium">التصنيف</td>
                          <td className="py-2.5 text-foreground">{product.category_name}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2.5 text-muted-foreground font-medium">المخزون</td>
                        <td className="py-2.5 text-foreground">{product.stock > 0 ? `${product.stock} قطعة` : "نفذ المخزون"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 mt-6 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-6 relative inline-block pb-2">
            منتجات ذات صلة
            <span className="absolute bottom-0 right-0 left-0 h-1.5 bg-primary/60 rounded-full" />
          </h2>
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
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden z-50">
        <button
          onClick={() => setOrderModalOpen(true)}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          اطلب الآن — {formatPrice(Number(product.price))}
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
