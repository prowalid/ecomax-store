import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, isLoading } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col" dir="rtl">
        <SheetHeader className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="text-store-primary" size={24} />
              سلة التسوق
              {totalCount > 0 && (
                <span className="bg-store-primary text-white text-sm px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X size={20} />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-store-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">سلتك فارغة</h3>
            <p className="text-gray-500 mb-6">لم تضف أي منتجات بعد</p>
            <SheetClose asChild>
              <Link
                to="/"
                className="bg-store-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                تصفح المنتجات
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">
                          {item.product_name}
                        </h4>
                        <p className="text-store-primary font-bold text-sm mt-1">
                          {formatPrice(item.product_price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-200 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-200 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t bg-white p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">المجموع:</span>
                <span className="text-xl font-black text-store-primary">{formatPrice(totalPrice)}</span>
              </div>

              <SheetClose asChild>
                <Link
                  to="/checkout"
                  className="block w-full bg-store-primary text-white text-center py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
                >
                  إتمام الطلب
                </Link>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
