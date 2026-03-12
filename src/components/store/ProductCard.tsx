import { Link } from "react-router-dom";
import { ShoppingBag, Star, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useTracking } from "@/hooks/useTracking";
import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";
import { getStoreThemeTokens, hexToRgba, isDarkColor } from "@/lib/storeTheme";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  compare_price?: number | null;
  image_url?: string | null;
  category_name?: string;
  theme: AppearanceSettings;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

const ProductCard = ({ id, name, price, stock, compare_price, image_url, category_name, theme }: ProductCardProps) => {
  const { addItem, isAdding, items } = useCart();
  const { track } = useTracking();
  const hasDiscount = compare_price && compare_price > price;
  const inCart = items.some(item => item.product_id === id);
  const outOfStock = stock <= 0;
  const tokens = getStoreThemeTokens(theme);
  const buttonIsDark = isDarkColor(theme.button_color);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error("هذا المنتج غير متوفر حالياً");
      return;
    }
    addItem({
      product_id: id,
      product_name: name,
      product_price: price,
      product_image_url: image_url,
      quantity: 1,
    });
    track("AddToCart", {}, {
      content_name: name,
      content_ids: [id],
      content_type: "product",
      contents: [{ id, quantity: 1, item_price: Number(price) }],
      value: Number(price),
      currency: "DZD",
    });
    toast.success("تمت الإضافة للسلة", {
      icon: <Check className="text-green-500" />,
    });
    window.dispatchEvent(new Event("open-cart"));
  };

  return (
    <div
      className="rounded-3xl overflow-hidden group transition-all duration-500 relative hover:-translate-y-1"
      style={{
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        boxShadow: `0 4px 20px ${tokens.shadow}`,
        color: tokens.textPrimary,
      }}
    >
      <Link to={`/product/${id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/4.15] sm:aspect-[4/4.25]" style={{ backgroundColor: tokens.surfaceSoft }}>
          {hasDiscount && (
            <span
              className="absolute top-4 right-4 text-white text-xs font-black px-4 py-1.5 rounded-full z-10 backdrop-blur-sm"
              style={{ backgroundColor: theme.accent_color, boxShadow: `0 10px 20px ${hexToRgba(theme.accent_color, 0.28)}` }}
            >
              تخفيض!
            </span>
          )}
          {outOfStock && (
            <span
              className="absolute top-4 left-4 text-[11px] font-black px-3 py-1.5 rounded-full z-10 shadow-lg"
              style={{ backgroundColor: hexToRgba(theme.header_text, 0.9), color: tokens.surface }}
            >
              نفد المخزون
            </span>
          )}
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl" style={{ color: tokens.textSoft }}>📦</div>
          )}

          {/* Overlay hover button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center pb-4 hidden md:flex">
            <span
              className="font-bold py-2 px-5 rounded-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center"
              style={{ backgroundColor: hexToRgba(tokens.surface, 0.95), color: theme.accent_color, boxShadow: `0 8px 30px ${tokens.shadow}` }}
            >
              <ShoppingBag size={18} className="ml-2" /> عرض سريع
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-3 pt-2.5 pb-1 text-center sm:px-4">
          {category_name && (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textSoft }}>{category_name}</p>
          )}
          <h3 className="mb-1 line-clamp-2 min-h-[2.1rem] cursor-pointer text-[13px] font-bold leading-snug transition-colors sm:text-sm" style={{ color: tokens.textPrimary }}>
            {name}
          </h3>

          {/* Rate & Price Row */}
          <div className="flex w-full flex-col items-center justify-center space-y-0.5">
            <div className="flex items-center space-x-1 space-x-reverse">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={10} className="text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-[9px] mr-1" style={{ color: tokens.textSoft }}>(4.9)</span>
            </div>
            
            <div className="flex items-baseline justify-center space-x-2 space-x-reverse">
              <span className="font-black text-[15px] sm:text-base" style={{ color: theme.accent_color }}>{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="line-through text-[11px] font-medium" style={{ color: tokens.textSoft }}>{formatPrice(compare_price)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="shrink-0 px-3 pb-3 pt-1 sm:px-4">
        {outOfStock ? (
          <button
            disabled
            className="w-full py-2.5 rounded-xl text-[13px] sm:text-sm font-bold flex justify-center items-center cursor-not-allowed"
            style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textMuted, border: `1px solid ${tokens.border}` }}
          >
            نفد المخزون
          </button>
        ) : inCart ? (
           <button
             disabled
             className="w-full py-2.5 rounded-xl text-[13px] sm:text-sm font-bold flex justify-center items-center cursor-not-allowed"
             style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textMuted, border: `1px solid ${tokens.border}` }}
           >
             <Check size={18} className="ml-1.5 text-green-500" /> تمت الإضافة
           </button>
        ) : (
          <div className="flex gap-2">
            <Link
              to={`/product/${id}`}
              className="flex-1 py-2 rounded-xl text-[13px] sm:text-sm font-bold flex justify-center items-center transition-all duration-300 active:translate-y-0 text-center shadow-sm hover:opacity-90"
              style={{
                backgroundColor: theme.button_color,
                color: theme.button_text,
              }}
            >
              اطلب الآن
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label="أضف إلى السلة"
              className="w-10 sm:w-12 py-2 rounded-xl flex justify-center items-center transition-all duration-300 hover:opacity-80 disabled:opacity-50 shrink-0 shadow-sm"
              style={{ backgroundColor: tokens.surfaceSoft, color: theme.accent_color, border: `1px solid ${tokens.border}` }}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
