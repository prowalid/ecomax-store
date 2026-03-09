import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, User, MapPin, Truck, Loader2, ShoppingBag, Home, Building2, Tag, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useValidateDiscount } from "@/hooks/useValidateDiscount";
import { useTracking } from "@/hooks/useTracking";
import { ALGERIA_WILAYAS } from "@/data/algeriaWilayas";

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

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "الاسم قصير جداً").max(100, "الاسم طويل جداً"),
  customer_phone: z
    .string()
    .trim()
    .regex(/^0[5-7][0-9]{8}$/, { message: "رقم الهاتف غير صالح" }),
  wilaya: z.string().min(1, "الرجاء اختيار الولاية"),
  commune: z.string().min(1, "الرجاء اختيار البلدية"),
  delivery_type: z.enum(["home", "desk"]),
  note: z.string().trim().max(500).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const formatPrice = (n: number) => `${n.toLocaleString("ar-DZ")} دج`;

const selectClass =
  "w-full pr-11 pl-8 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold appearance-none cursor-pointer";

const inputClass =
  "w-full pr-11 pl-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const createCustomer = useCreateCustomer();
  const { settings: shippingSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });
  const { discount, isValidating, validateCode, clearDiscount, calculateDiscount, incrementUsage } = useValidateDiscount();

  const [couponCode, setCouponCode] = useState("");
  const { track } = useTracking();

  // Track InitiateCheckout when page loads with items
  useEffect(() => {
    if (items.length > 0) {
      track("InitiateCheckout", {}, {
        content_ids: items.map((i) => i.product_id),
        num_items: items.length,
        value: totalPrice,
        currency: "DZD",
      });
    }
  }, []);

  // Merge shipping settings prices with ALGERIA_WILAYAS defaults
  const wilayasWithPrices = useMemo(() => {
    const settingsMap = new Map(shippingSettings.wilayas?.map((w) => [w.name, w]) ?? []);
    return ALGERIA_WILAYAS.map((w) => {
      const override = settingsMap.get(w.name);
      return {
        ...w,
        homePrice: override?.homePrice ?? w.priceHome,
        deskPrice: override?.deskPrice ?? w.priceDesk,
      };
    });
  }, [shippingSettings]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      wilaya: "",
      commune: "",
      delivery_type: "home",
      note: "",
    },
  });

  const wilayaValue = watch("wilaya");
  const communeValue = watch("commune");
  const deliveryTypeValue = watch("delivery_type") as DeliveryType;

  const selectedWilaya = useMemo(
    () => wilayasWithPrices.find((w) => w.name === wilayaValue),
    [wilayasWithPrices, wilayaValue]
  );

  const availableCommunes = useMemo(
    () => selectedWilaya?.communes ?? [],
    [selectedWilaya]
  );

  // Reset commune when wilaya changes
  useEffect(() => {
    setValue("commune", "");
  }, [wilayaValue, setValue]);

  const shippingCost = useMemo(() => {
    if (!selectedWilaya) return 0;
    return deliveryTypeValue === "home" ? selectedWilaya.homePrice : selectedWilaya.deskPrice;
  }, [selectedWilaya, deliveryTypeValue]);

  const subtotal = totalPrice;
  const discountAmount = calculateDiscount(subtotal);
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = async () => {
    await validateCode(couponCode);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!items.length) {
      toast.error("السلة فارغة، أضف منتجات أولاً");
      return;
    }

    try {
      let customerId: string | undefined;
      try {
        const customer = await createCustomer.mutateAsync({
          name: values.customer_name,
          phone: values.customer_phone,
          wilaya: values.wilaya,
          commune: values.commune,
        });
        customerId = customer.id;
      } catch {
        // Continue even if customer creation fails
      }

      const order = await createOrder.mutateAsync({
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        wilaya: values.wilaya,
        commune: values.commune,
        delivery_type: values.delivery_type as DeliveryType,
        subtotal,
        shipping_cost: shippingCost,
        total,
        note: values.note || null,
        customer_id: customerId,
        discount_code: discount?.code || undefined,
        discount_amount: discountAmount > 0 ? discountAmount : undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.product_price,
          total: item.product_price * item.quantity,
        })),
      });

      // Increment discount usage
      if (discount) {
        await incrementUsage();
      }

      clearCart();

      // Track Purchase event
      track("Purchase", {
        phone: values.customer_phone,
        firstName: values.customer_name,
        city: values.wilaya,
      }, {
        value: total,
        currency: "DZD",
        content_ids: items.map((i) => i.product_id),
        num_items: items.length,
      });

      toast.success(`تم إرسال طلبك بنجاح، رقم الطلب #${order.order_number}`);
      navigate("/", { replace: true });
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#dc3545]" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4" dir="rtl">
        <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
        <p className="text-gray-500 text-sm">السلة فارغة حالياً، أضف منتجات للمتابعة</p>
        <button
          onClick={() => navigate("/shop")}
          className="inline-block bg-[#dc3545] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          الذهاب إلى المتجر
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[2fr,1.2fr]" dir="rtl">
      {/* Form */}
      <div className="bg-white border-2 border-[#dc3545]/20 shadow-[0_8px_30px_rgba(220,53,69,0.1)] rounded-3xl p-5 md:p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#dc3545] to-orange-400" />

        <div className="text-center mb-6 mt-2">
          <h1 className="text-2xl font-black text-gray-900">إتمام الطلب</h1>
          <p className="text-gray-500 text-sm mt-1">والدفع يكون عند الاستلام</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  {...register("customer_name")}
                  className={inputClass}
                />
              </div>
              {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="رقم الهاتف"
                  {...register("customer_phone")}
                  className={inputClass + " text-left"}
                />
              </div>
              {errors.customer_phone && <p className="text-xs text-red-500 mt-1">{errors.customer_phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wilaya Select */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <MapPin size={18} />
                </div>
                <select {...register("wilaya")} className={selectClass}>
                  <option value="">اختر الولاية</option>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.id} value={w.name}>
                      {String(w.id).padStart(2, "0")} - {w.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
              {errors.wilaya && <p className="text-xs text-red-500 mt-1">{errors.wilaya.message}</p>}
            </div>

            {/* Commune Select */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <Truck size={18} />
                </div>
                <select
                  {...register("commune")}
                  disabled={!wilayaValue}
                  className={selectClass + (!wilayaValue ? " opacity-50 cursor-not-allowed" : "")}
                >
                  <option value="">اختر البلدية</option>
                  {availableCommunes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
              {errors.commune && <p className="text-xs text-red-500 mt-1">{errors.commune.message}</p>}
            </div>
          </div>

          {/* Shipping Cost Display */}
          {selectedWilaya ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900 text-sm">أسعار التوصيل - {selectedWilaya.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">🏠 للمنزل:</span>
                  <span className="font-bold text-blue-900">{formatPrice(selectedWilaya.homePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">🏢 للمكتب:</span>
                  <span className="font-bold text-blue-900">{formatPrice(selectedWilaya.deskPrice)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">اختر الولاية لعرض أسعار التوصيل</span>
              </div>
            </div>
          )}


          {/* Delivery Type */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
            <p className="font-bold text-gray-700 mb-3">طريقة التوصيل:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold cursor-pointer transition-all ${
                  deliveryTypeValue === "home"
                    ? "border-[#dc3545] bg-white text-[#dc3545]"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#dc3545]/40"
                }`}
              >
                <input type="radio" value="home" {...register("delivery_type")} className="hidden" />
                <Home size={18} />
                توصيل للمنزل
                {selectedWilaya && (
                  <span className="text-xs font-medium opacity-70">({formatPrice(selectedWilaya.homePrice)})</span>
                )}
              </label>

              <label
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold cursor-pointer transition-all ${
                  deliveryTypeValue === "desk"
                    ? "border-[#dc3545] bg-white text-[#dc3545]"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#dc3545]/40"
                }`}
              >
                <input type="radio" value="desk" {...register("delivery_type")} className="hidden" />
                <Building2 size={18} />
                نقطة تسليم / مكتب
                {selectedWilaya && (
                  <span className="text-xs font-medium opacity-70">({formatPrice(selectedWilaya.deskPrice)})</span>
                )}
              </label>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Tag size={16} />
              كود الخصم
            </p>
            {discount ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-green-600" />
                  <span className="text-sm font-bold text-green-700">
                    {discount.code} — خصم {discount.type === "percentage" ? `${discount.value}%` : `${discount.value} د.ج`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { clearDiscount(); setCouponCode(""); }}
                  className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="أدخل كود الخصم"
                  dir="ltr"
                  className="flex-1 h-11 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-bold text-center uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidating || !couponCode.trim()}
                  className="h-11 px-5 rounded-xl bg-[#dc3545] text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <textarea
              rows={2}
              placeholder="ملاحظات إضافية (اختياري)"
              {...register("note")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#dc3545]/50 focus:border-[#dc3545] outline-none transition-all text-gray-800 font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full bg-gradient-to-r from-[#dc3545] to-[#e84a59] text-white font-black py-3 rounded-xl hover:shadow-[0_8px_25px_rgba(220,53,69,0.35)] transition-all duration-300 flex justify-center items-center disabled:opacity-50"
          >
            {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الطلب"}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <aside className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
        <div>
          <h2 className="text-base font-black text-gray-900">ملخص الطلب</h2>
          <p className="text-xs text-gray-500 mt-0.5">تحقق من المنتجات قبل تأكيد الطلب</p>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center text-lg">
                  {item.product_image_url ? (
                    <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 line-clamp-2 max-w-[140px]">{item.product_name}</p>
                  <p className="text-[11px] text-gray-400">الكمية: {item.quantity}</p>
                </div>
              </div>
              <p className="font-black text-[#dc3545]">{formatPrice(item.product_price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
            <span>المجموع الفرعي:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between mb-3 text-sm text-green-600 font-bold">
              <span>الخصم ({discount?.code}):</span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
            <span>سعر التوصيل:</span>
            <span className={shippingCost > 0 ? "text-gray-900 font-bold" : "text-gray-500"}>
              {shippingCost > 0 ? formatPrice(shippingCost) : "يُحسب حسب الولاية"}
            </span>
          </div>
          <div className="flex justify-between font-black text-xl border-t border-gray-300 pt-3 mt-1 text-gray-900">
            <span>المجموع الكلي:</span>
            <span className="text-[#dc3545]">{formatPrice(total)}</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">سيتم الاتصال بك هاتفياً لتأكيد الطلب قبل الشحن، والدفع يكون عند الاستلام.</p>
      </aside>
    </div>
  );
}
