import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, MapPin, Home, Building2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  delivery_type: z.enum(["home", "desk"], { required_error: "نوع التوصيل مطلوب" }),
  note: z.string().trim().max(500).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const formatPrice = (n: number) => `${n.toLocaleString("ar-DZ")} دج`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const { settings: shippingSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });

  const wilayas = useMemo(() => shippingSettings.wilayas ?? [], [shippingSettings]);

  const form = useForm<CheckoutFormValues>({
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

  const wilayaValue = form.watch("wilaya");
  const deliveryTypeValue = form.watch("delivery_type");

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground text-sm">السلة فارغة حالياً، أضف منتجات للمتابعة</p>
        <Button onClick={() => navigate("/shop")}>الذهاب إلى المتجر</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[2fr,1.2fr]">
      <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">إتمام الطلب</h1>
          <p className="text-xs text-muted-foreground">أدخل بياناتك بدقة لضمان توصيل سريع وسلس</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="اكتب اسمك الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input dir="ltr" className="pr-8" placeholder="07XXXXXXXX" {...field} />
                    </div>
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground mt-1">سيتم الاتصال بك لتأكيد الطلب</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wilaya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الولاية</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        {...field}
                      >
                        <option value="">اختر الولاية</option>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commune"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البلدية</FormLabel>
                    <FormControl>
                      <Input placeholder="اكتب اسم البلدية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان بالتفصيل</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pr-8" placeholder="الحي، رقم المنزل، أقرب معلم ..." {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طريقة التوصيل</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <label className="flex items-center gap-3 border border-input rounded-xl p-3 cursor-pointer hover:border-ring transition-colors bg-background">
                        <RadioGroupItem value="home" />
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">توصيل للمنزل</p>
                            <p className="text-xs text-muted-foreground">توصيل حتى باب البيت</p>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 border border-input rounded-xl p-3 cursor-pointer hover:border-ring transition-colors bg-background">
                        <RadioGroupItem value="desk" />
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">نقطة تسليم / مكتب</p>
                            <p className="text-xs text-muted-foreground">تستلم من مكتب الشحن</p>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="أي تفاصيل إضافية للتوصيل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={createOrder.isPending}>
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري إرسال الطلب...
                </>
              ) : (
                <>إتمام الطلب والدفع عند الاستلام</>
              )}
            </Button>
          </form>
        </Form>
      </div>

      <aside className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4 h-fit">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">ملخص الطلب</h2>
          <p className="text-xs text-muted-foreground">تحقق من المنتجات قبل تأكيد الطلب</p>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs border-b border-border pb-2 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center text-lg">
                  {item.product_image_url ? (
                    <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground line-clamp-2 max-w-[160px]">{item.product_name}</p>
                  <p className="text-[11px] text-muted-foreground">الكمية: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-foreground">{formatPrice(item.product_price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">سعر التوصيل</span>
            <span className="font-medium">{shippingCost ? formatPrice(shippingCost) : "يُحسب حسب الولاية"}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">المجموع النهائي</span>
          <span className="text-base font-bold text-primary">{formatPrice(total)}</span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          سيتم الاتصال بك هاتفياً لتأكيد الطلب قبل الشحن، والدفع يكون عند الاستلام.
        </p>
      </aside>
    </div>
  );
}
