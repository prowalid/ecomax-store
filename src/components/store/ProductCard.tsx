import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compare_price?: number | null;
  image_url?: string | null;
  category_name?: string;
  onQuickOrder?: (id: string) => void;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

const ProductCard = ({ id, name, price, compare_price, image_url, category_name, onQuickOrder }: ProductCardProps) => {
  const hasDiscount = compare_price && compare_price > price;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
      <Link to={`/product/${id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden">
          {hasDiscount && (
            <span className="absolute top-3 right-3 bg-[#dc3545] text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
              تخفيض!
            </span>
          )}
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-72 flex items-center justify-center text-6xl bg-gray-100">📦</div>
          )}

          {/* Overlay hover button */}
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white text-[#dc3545] font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center">
              <ShoppingBag size={18} className="ml-2" /> عرض سريع
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          <h3 className="text-gray-900 font-bold mb-3 line-clamp-2 h-12 hover:text-[#dc3545] transition-colors cursor-pointer font-[Cairo]">
            {name}
          </h3>

          {/* Star rating */}
          <div className="flex items-center justify-center mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} className="text-[#dc3545] fill-current" />
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center mb-5 space-x-2 space-x-reverse">
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm">{formatPrice(compare_price)}</span>
            )}
            <span className="text-[#dc3545] font-black text-xl">{formatPrice(price)}</span>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-5 pb-5">
        <button
          onClick={(e) => {
            e.preventDefault();
            onQuickOrder?.(id);
          }}
          className="w-full bg-[#dc3545] text-white py-3 rounded-xl font-bold flex justify-center items-center hover:bg-red-700 transition-colors shadow-md shadow-red-200"
        >
          <ShoppingBag size={20} className="ml-2" /> أضف إلى السلة
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
