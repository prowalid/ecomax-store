import { useState } from "react";
import { X, User, Phone, MapPin, Home, Building2, Minus, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateCustomer } from "@/hooks/useCustomers";

type DeliveryType = "home" | "desk";

interface QuickOrderProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
}

interface QuickOrderModalProps {
  open: boolean;
  onClose: () => void;
  product: QuickOrderProduct;
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

const QuickOrderModal = ({ open, onClose, product }: QuickOrderModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(product.quantity || 1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [submitted, setSubmitted] = useState(false);

  const createOrder = useCreateOrder();
  const createCustomer = useCreateCustomer();

  const subtotal = product.price * quantity;
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let customerId: string | undefined;
    try {
      const customer = await createCustomer.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        wilaya: city.trim() || undefined,
        address: address.trim() || undefined,
      });
      customerId = customer.id;
    } catch {
      // continue even if customer creation fails
    }

    createOrder.mutate(
      {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        wilaya: city.trim() || undefined,
        address: address.trim() || undefined,
        delivery_type: deliveryType,
        subtotal,
        shipping_cost: shippingCost,
        total,
        customer_id: customerId,
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: product.price,
            total: product.price * quantity,
          },
        ],
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">اطلب الآن</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-[hsl(var(--primary))] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h3>
            <p className="text-sm text-gray-500 mb-6">سنتصل بك لتأكيد الطلب في أقرب وقت</p>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity"
            >
              إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-center text-sm text-gray-500">املأ النموذج وسنتصل بك لتأكيد الطلب</p>

            {/* Product display */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                <p className="text-sm font-bold text-[hsl(var(--primary))] mt-1">{formatPrice(product.price)}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-10 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-gray-700 text-center">للطلب، يرجى إدخال معلوماتك هنا:</p>

            {/* Name */}
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل *"
                required
                className="w-full h-11 pr-10 pl-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف *"
                required
                dir="ltr"
                className="w-full h-11 pr-10 pl-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-right transition-colors"
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* City */}
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="الولاية / المدينة"
                className="w-full h-11 pr-10 pl-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
              />
              <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Address */}
            <div className="relative">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="العنوان الكامل"
                rows={2}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent resize-none transition-colors"
              />
              <Home className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
            </div>

            {/* Delivery Type */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">طريقة التوصيل</p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "home" as DeliveryType, Icon: Home, label: "توصيل للمنزل", sub: "حتى باب البيت" },
                    { value: "desk" as DeliveryType, Icon: Building2, label: "نقطة تسليم", sub: "من مكتب الشحن" },
                  ]
                ).map(({ value, Icon, label, sub }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryType === value
                        ? "border-[hsl(var(--primary))] bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_type"
                      value={value}
                      checked={deliveryType === value}
                      onChange={() => setDeliveryType(value)}
                      className="hidden"
                    />
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        deliveryType === value ? "text-[hsl(var(--primary))]" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>المجموع الفرعي:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>الشحن:</span>
                <span className="text-[hsl(var(--primary))]">يُحدد عند التأكيد</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>المجموع الكلي:</span>
                <span className="text-[hsl(var(--primary))]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="w-full h-12 rounded-xl bg-[hsl(var(--primary))] text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                "تأكيد الطلب"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuickOrderModal;
