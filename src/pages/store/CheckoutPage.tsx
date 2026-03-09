import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, MapPin, Home, Building2, Loader2, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

interface ShippingSettings {
  wilayas: WilayaShipping[];
}

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "الاسم قصير جداً").max(100, "الاسم طويل جداً"),
  customer_phone: z
    .string()
    .trim()
    .regex(/^0[5-7][0-9]{8}$/, { message: "رقم الهاتف غير صالح" }),
  wilaya: z.string().trim().min(1, "الولاية مطلوبة"),
  commune: z.string().trim().min(2, "البلدية مطلوبة"),
  address: z.string().trim().min(5, "العنوان مفصل أكثر"),
  delivery_type: z.enum(["home", "desk"]),
  note: z.string().trim().max(500).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const formatPrice = (n: number) => `${n.toLocaleString("ar-DZ")} دج`;

const fieldClass = (hasError: boolean) =>
  `w-full h-11 pr-10 pl-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-white ${
    hasError
      ? "border-red-400 focus:ring-red-400"
      : "border-gray-200 focus:ring-[hsl(var(--primary))]"
  }`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const { settings: shippingSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });

  const wilayas = useMemo(() => shippingSettings.wilayas ?? [], [shippingSettings]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      wilaya: "",
      commune: "",
      address: "",
      delivery_type: "home",
      note: "",
    },
  });

  const wilayaValue = watch("wilaya");
  const deliveryTypeValue = watch("delivery_type");

  const selectedWilaya = useMemo(
    () => wilayas.find((w) => w.name === wilayaValue),
    [wilayas, wilayaValue]
  );

  const shippingCost = useMemo(() => {
    if (!selectedWilaya) return 0;
    return deliveryTypeValue === "home" ? selectedWilaya.homePrice : selectedWilaya.deskPrice;
  }, [selectedWilaya, deliveryTypeValue]);

  const subtotal = totalPrice;
  const total = subtotal + shippingCost;

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!items.length) {
      toast.error("السلة فارغة، أضف منتجات أولاً");
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        wilaya: values.wilaya,
        commune: values.commune,
        address: values.address,
        delivery_type: values.delivery_type,
        subtotal,
        shipping_cost: shippingCost,
        total,
        note: values.note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.product_price,
          total: item.product_price * item.quantity,
        })),
      });
      clearCart();
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
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
        <p className="text-gray-500 text-sm">السلة فارغة حالياً، أضف منتجات للمتابعة</p>
        <button
          onClick={() => navigate("/shop")}
          className="h-11 px-8 rounded-xl bg-[hsl(var(--primary))] text-white font-bold hover:opacity-90 transition-opacity"
        >
          الذهاب إلى المتجر
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[2fr,1.2fr]" dir="rtl">
      {/* ── Form ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إتمام الطلب</h1>
          <p className="text-xs text-gray-500 mt-0.5">أدخل بياناتك بدقة لضمان توصيل سريع وسلس</p>
        </div>

        <p className="text-center text-sm text-gray-500">املأ النموذج وسنتصل بك لتأكيد الطلب</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <div className="relative">
              <input
                {...register("customer_name")}
                type="text"
                placeholder="الاسم الكامل *"
                className={fieldClass(!!errors.customer_name)}
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.customer_name && (
              <p className="text-xs text-red-500 mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="relative">
              <input
                {...register("customer_phone")}
                type="tel"
                dir="ltr"
                placeholder="07XXXXXXXX *"
                className={fieldClass(!!errors.customer_phone) + " text-right"}
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.customer_phone && (
              <p className="text-xs text-red-500 mt-1">{errors.customer_phone.message}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">سيتم الاتصال بك لتأكيد الطلب</p>
          </div>

          {/* Wilaya + Commune */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                {...register("wilaya")}
                className={`w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-white ${
                  errors.wilaya
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:ring-[hsl(var(--primary))]"
                }`}
              >
                <option value="">اختر الولاية *</option>
                {wilayas.length > 0
                  ? wilayas.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.id.toString().padStart(2, "0")} - {w.name}
                      </option>
                    ))
                  : Array.from({ length: 58 }).map((_, idx) => {
                      const name = `ولاية ${idx + 1}`;
                      return (
                        <option key={name} value={name}>
                          {String(idx + 1).padStart(2, "0")} - {name}
                        </option>
                      );
                    })}
              </select>
              {errors.wilaya && (
                <p className="text-xs text-red-500 mt-1">{errors.wilaya.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("commune")}
                type="text"
                placeholder="البلدية *"
                className={fieldClass(!!errors.commune)}
              />
              {errors.commune && (
                <p className="text-xs text-red-500 mt-1">{errors.commune.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="relative">
              <input
                {...register("address")}
                type="text"
                placeholder="العنوان بالتفصيل (الحي، رقم المنزل...) *"
                className={fieldClass(!!errors.address)}
              />
              <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Delivery Type */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">طريقة التوصيل</p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "home", Icon: Home, label: "توصيل للمنزل", sub: "حتى باب البيت" },
                  { value: "desk", Icon: Building2, label: "نقطة تسليم", sub: "من مكتب الشحن" },
                ] as const
              ).map(({ value, Icon, label, sub }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryTypeValue === value
                      ? "border-[hsl(var(--primary))] bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register("delivery_type")}
                    className="hidden"
                  />
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      deliveryTypeValue === value ? "text-[hsl(var(--primary))]" : "text-gray-400"
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

          {/* Note */}
          <div>
            <input
              {...register("note")}
              type="text"
              placeholder="ملاحظات إضافية (اختياري)"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full h-12 rounded-xl bg-[hsl(var(--primary))] text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري إرسال الطلب...
              </>
            ) : (
              "إتمام الطلب والدفع عند الاستلام"
            )}
          </button>
        </form>
      </div>

      {/* ── Order Summary ── */}
      <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
        <div>
          <h2 className="text-base font-bold text-gray-900">ملخص الطلب</h2>
          <p className="text-xs text-gray-500 mt-0.5">تحقق من المنتجات قبل تأكيد الطلب</p>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs border-b border-gray-100 pb-2 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center text-lg">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 line-clamp-2 max-w-[140px]">
                    {item.product_name}
                  </p>
                  <p className="text-[11px] text-gray-400">الكمية: {item.quantity}</p>
                </div>
              </div>
              <p className="font-bold text-[hsl(var(--primary))]">
                {formatPrice(item.product_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>المجموع الفرعي:</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>سعر التوصيل:</span>
            <span className="font-medium">
              {shippingCost > 0 ? formatPrice(shippingCost) : "يُحسب حسب الولاية"}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
            <span>المجموع النهائي:</span>
            <span className="text-[hsl(var(--primary))]">{formatPrice(total)}</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">
          سيتم الاتصال بك هاتفياً لتأكيد الطلب قبل الشحن، والدفع يكون عند الاستلام.
        </p>
      </aside>
    </div>
  );
}
