import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compare_price?: number | null;
  image_url?: string | null;
  category_name?: string;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const ProductCard = ({ id, name, price, compare_price, image_url, category_name }: ProductCardProps) => {
  const hasDiscount = compare_price && compare_price > price;
  const discountPct = hasDiscount ? Math.round(((compare_price - price) / compare_price) * 100) : 0;

  return (
    <Link
      to={`/product/${id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            -{discountPct}%
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <div className="p-4">
        {category_name && (
          <span className="text-[11px] text-gray-400 font-medium">{category_name}</span>
        )}
        <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-base font-bold text-[hsl(var(--primary))]">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(compare_price)}</span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[hsl(var(--primary))] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>اطلب الآن</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
