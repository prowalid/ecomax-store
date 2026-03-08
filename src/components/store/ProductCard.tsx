import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compare_price?: number | null;
  image_url?: string | null;
  category_name?: string;
  onQuickOrder?: (id: string) => void;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " د.ج";

const ProductCard = ({ id, name, price, compare_price, image_url, category_name, onQuickOrder }: ProductCardProps) => {
  const hasDiscount = compare_price && compare_price > price;

  return (
    <li className="group list-none">
      <Link to={`/product/${id}`} className="block bg-white rounded-none overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
        {/* Image - 3:4 ratio like WooCommerce */}
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100">📦</div>
          )}
          {hasDiscount && (
            <span className="absolute top-0 right-0 text-white text-[11px] font-bold px-2 py-1 rounded-none" style={{ background: 'rgba(167, 4, 4, 0.8)' }}>
              تخفيض!
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 text-center">
          <h2 className="text-[14px] font-semibold text-[#000] leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] font-[Cairo]">
            {name}
          </h2>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-[14px] h-[14px] text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {hasDiscount && (
              <del className="text-[13px] text-gray-400">{formatPrice(compare_price)}</del>
            )}
            <ins className="text-[15px] font-bold text-primary no-underline">{formatPrice(price)}</ins>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onQuickOrder?.(id);
        }}
        className="w-full h-[42px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-0 rounded-none"
      >
        <ShoppingCart className="w-4 h-4" />
        إضافة إلى السلة
      </button>
    </li>
  );
};

export default ProductCard;
