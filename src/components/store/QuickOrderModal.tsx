import { useState, useMemo } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Home,
  Building2,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  Truck,
  Tag,
} from "lucide-react";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useValidateDiscount } from "@/hooks/useValidateDiscount";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useTracking } from "@/hooks/useTracking";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

interface ShippingSettings {
  wilayas: WilayaShipping[];
}

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

const inputClass =
  "w-full pr-11 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold";

const QuickOrderModal = ({ open, onClose, product }: QuickOrderModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(product.quantity || 1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const createOrder = useCreateOrder();
  const createCustomer = useCreateCustomer();
  const { settings: shippingSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });
  const { discount, isValidating, validateCode, clearDiscount, calculateDiscount, incrementUsage } = useValidateDiscount();

  const wilayas = useMemo(() => shippingSettings.wilayas ?? [], [shippingSettings]);

  const selectedWilaya = useMemo(
    () => wilayas.find((w) => w.name === city),
    [wilayas, city]
  );

  const shippingCost = useMemo(() => {
    if (!selectedWilaya) return 0;
    return deliveryType === "home" ? selectedWilaya.homePrice : selectedWilaya.deskPrice;
  }, [selectedWilaya, deliveryType]);

  const subtotal = product.price * quantity;
  const discountAmount = calculateDiscount(subtotal);
  const total = subtotal - discountAmount + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    // Create customer
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

    // Create order
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
        discount_code: discount?.code || undefined,
        discount_amount: discountAmount > 0 ? discountAmount : undefined,
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
        onSuccess: async () => {
          if (discount) {
            await incrementUsage();
          }
          track("Purchase", {
            phone: phone,
            firstName: name,
            city: city || undefined,
          }, {
            value: total,
            currency: "DZD",
            content_ids: [product.id],
            content_name: product.name,
            num_items: quantity,
          });
          setSubmitted(true);
        },
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
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h3>
            <p className="text-sm text-gray-500 mb-6">سنتصل بك لتأكيد الطلب في أقرب وقت</p>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[#dc3545] text-white font-bold hover:bg-red-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-center text-sm text-gray-500">املأ النموذج وسنتصل بك لتأكيد الطلب</p>

            {/* Product display */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</p>
                <p className="text-sm font-black text-[#dc3545] mt-1">{formatPrice(product.price)}</p>
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
              <span className="text-lg font-black w-10 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-bold text-gray-700 text-center">للطلب، يرجى إدخال معلوماتك هنا:</p>

            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل *"
                required
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف *"
                required
                dir="ltr"
                className={inputClass + " text-left"}
              />
            </div>

            {/* City */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                list="quick-order-wilayas"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="الولاية"
                className={inputClass}
              />
              <datalist id="quick-order-wilayas">
                {wilayas.map((w) => (
                  <option key={w.id} value={w.name} />
                ))}
              </datalist>
            </div>

            {/* Address */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Truck size={18} />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="البلدية / العنوان"
                className={inputClass}
              />
            </div>

            {/* Delivery Type */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-1">
              <p className="font-bold text-gray-700 mb-3">طريقة التوصيل:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType("home")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                    deliveryType === "home"
                      ? "border-[#dc3545] bg-white text-[#dc3545]"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[#dc3545]/40"
                  }`}
                >
                  <Home size={18} />
                  توصيل للمنزل
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("desk")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${
                    deliveryType === "desk"
                      ? "border-[#dc3545] bg-white text-[#dc3545]"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[#dc3545]/40"
                  }`}
                >
                  <Building2 size={18} />
                  نقطة تسليم / مكتب
                </button>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <Tag size={14} />
                كود الخصم (اختياري)
              </p>
              {discount ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <span className="text-xs font-bold text-green-700">
                    {discount.code} — خصم {discount.type === "percentage" ? `${discount.value}%` : `${discount.value} د.ج`}
                  </span>
                  <button
                    type="button"
                    onClick={() => { clearDiscount(); setCouponCode(""); }}
                    className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="أدخل الكود"
                    dir="ltr"
                    className="flex-1 h-10 px-3 bg-white border border-gray-300 rounded-xl text-sm font-bold text-center uppercase focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => validateCode(couponCode)}
                    disabled={isValidating || !couponCode.trim()}
                    className="h-10 px-4 rounded-xl bg-[#dc3545] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                  </button>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-200 mt-1 shadow-sm">
              <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                <span>المجموع الفرعي ({quantity} قطعة):</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between mb-3 text-sm text-green-600 font-bold">
                  <span>الخصم ({discount?.code}):</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                <span>التوصيل:</span>
                <span className={shippingCost > 0 ? "text-gray-900 font-bold" : "text-gray-500"}>
                  {shippingCost > 0 ? formatPrice(shippingCost) : "يُحسب حسب الولاية"}
                </span>
              </div>
              <div className="flex justify-between font-black text-xl border-t border-gray-300 pt-3 mt-1 text-gray-900">
                <span>المجموع الكلي:</span>
                <span className="text-[#dc3545]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="w-full bg-gradient-to-r from-[#dc3545] to-[#e84a59] text-white font-black py-3 rounded-xl hover:shadow-[0_8px_25px_rgba(220,53,69,0.35)] transition-all duration-300 flex justify-center items-center disabled:opacity-50"
            >
              {createOrder.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
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
