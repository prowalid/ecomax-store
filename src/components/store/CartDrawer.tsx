import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import { formatSelectedOptions } from "@/lib/productOptions";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { getStoreThemeTokens } from "@/lib/storeTheme";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, isLoading } = useCart();
  const { settings: theme } = useAppearanceSettings();
  const tokens = getStoreThemeTokens(theme);


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" showCloseButton={false} className="w-full sm:max-w-md p-0 flex flex-col" dir="rtl" style={{ backgroundColor: tokens.surface }}>
        <SheetHeader className="p-4 border-b" style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-2" style={{ color: tokens.textPrimary }}>
              <ShoppingBag size={24} style={{ color: theme.accent_color }} />
              سلة التسوق
              {totalCount > 0 && (
                <span className="text-white text-sm px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.accent_color }}>
                  {totalCount}
                </span>
              )}
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full" style={{ color: tokens.textPrimary }}>
                <X size={20} />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.accent_color }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={64} className="mb-4" style={{ color: tokens.textSoft }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: tokens.textPrimary }}>سلتك فارغة</h3>
            <p className="mb-6" style={{ color: tokens.textMuted }}>لم تضف أي منتجات بعد</p>
            <SheetClose asChild>
              <Link
                to="/"
                className="text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-sm"
                style={{ backgroundColor: theme.button_color, color: theme.button_text }}
              >
                تصفح المنتجات
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-xl p-3 flex gap-3 shadow-sm animate-in fade-in slide-in-from-right-4 transition-all duration-300"
                    style={{ 
                      backgroundColor: tokens.surface, 
                      borderColor: tokens.border,
                      animationFillMode: "both", 
                      animationDelay: `${index * 75}ms` 
                    }}
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: tokens.surfaceSoft }}>
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
                        <h4 className="font-bold text-sm line-clamp-2 leading-tight" style={{ color: tokens.textPrimary }}>
                          {item.product_name}
                        </h4>
                        {formatSelectedOptions(item.selected_options) && (
                          <p className="mt-1 text-[11px] font-medium" style={{ color: tokens.textMuted }}>
                            {formatSelectedOptions(item.selected_options)}
                          </p>
                        )}
                        <p className="font-bold text-sm mt-1" style={{ color: theme.accent_color }}>
                          {formatPrice(item.product_price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: tokens.surfaceSoft }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 transition-colors"
                            style={{ color: tokens.textPrimary }}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 font-bold text-sm" style={{ color: tokens.textPrimary }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 transition-colors"
                            style={{ color: tokens.textPrimary }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 transition-colors hover:bg-red-500/10"
                          style={{ color: tokens.textMuted }}
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
            <div className="border-t p-4 space-y-4" style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}>
              <div className="flex justify-between items-center">
                <span className="font-medium" style={{ color: tokens.textMuted }}>المجموع:</span>
                <span className="text-xl font-black" style={{ color: theme.accent_color }}>{formatPrice(totalPrice)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SheetClose asChild>
                  <button
                    className="w-full text-center py-3 rounded-xl font-bold transition-colors"
                    style={{ backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary }}
                  >
                    متابعة التسوق
                  </button>
                </SheetClose>
                
                <SheetClose asChild>
                  <Link
                    to="/checkout"
                    className="block w-full text-center py-3 rounded-xl font-bold hover:brightness-110 hover:shadow-lg transition-all"
                    style={{ backgroundColor: theme.button_color, color: theme.button_text }}
                  >
                    إتمام الطلب
                  </Link>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
