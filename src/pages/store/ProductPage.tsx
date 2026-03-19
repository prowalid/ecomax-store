import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useProductImages } from "@/hooks/useProductImages";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useCart } from "@/hooks/useCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { ALGERIA_WILAYAS, normalizeAlgeriaLocationName } from "@/data/algeriaWilayas";
import ProductCard from "@/components/store/ProductCard";
import { toast } from "sonner";
import { useTracking } from "@/hooks/useTracking";
import ProductHero from "@/components/store/product-page/ProductHero";
import ProductTrustBadges from "@/components/store/product-page/ProductTrustBadges";
import { saveTrackingProfile } from "@/lib/trackingProfile";
import { getStoreThemeTokens } from "@/lib/storeTheme";
import { sanitizeProductDescription } from "@/lib/productDescription";
import { formatSelectedOptions, getFirstMissingSelection, hasRequiredSelections, normalizeProductOptions, normalizeSelectedOptions, type SelectedProductOptions } from "@/lib/productOptions";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

interface ShippingSettings {
  wilayas: WilayaShipping[];
}

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

type DeliveryType = "home" | "desk";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products = [], isLoading } = useProducts();
  const { data: galleryImages = [] } = useProductImages(id || null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [timeLeft, setTimeLeft] = useState(() => {
    const key = `offer_timer_${id}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const remaining = Math.max(0, Math.floor((Number(stored) - Date.now()) / 1000));
      return remaining;
    }
    // First visit in this session: set timer to 2 hours
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000;
    sessionStorage.setItem(key, String(expiresAt));
    return 2 * 60 * 60;
  });

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWilaya, setFormWilaya] = useState("");
  const [formCommune, setFormCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedProductOptions>({});
  const [missingOptionName, setMissingOptionName] = useState<string | null>(null);
  const [honeypotValue, setHoneypotValue] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const { settings: securitySettings } = useStoreSettings<{ turnstile_enabled: boolean; site_key: string; honeypot_enabled: boolean }>("security", { 
    turnstile_enabled: false, 
    site_key: "",
    honeypot_enabled: true 
  });

  // Dynamically load Turnstile script if enabled
  useEffect(() => {
    if (securitySettings.turnstile_enabled && securitySettings.site_key) {
      const scriptId = "cf-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      // Define callback globally for Turnstile
      (window as any).onTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
      };

      // Handle expiring token
      (window as any).onTurnstileExpire = () => {
        setTurnstileToken(null);
      };
    }
  }, [securitySettings.turnstile_enabled, securitySettings.site_key]);

  const createOrder = useCreateOrder();
  const createCustomer = useCreateCustomer();
  const { addItem, isAdding, items, removeItemAsync } = useCart();
  const { settings: shippingSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });
  const { settings: theme } = useAppearanceSettings();
  const tokens = getStoreThemeTokens(theme);
  const { track } = useTracking();
  const leadTrackedRef = useRef(false);

  const product = products.find((p) => p.id === id);
  const productOptions = normalizeProductOptions(product?.custom_options);
  const relatedProducts = products
    .filter((p) => p.id !== id && p.status === "active" && p.category_id === product?.category_id)
    .slice(0, 4);

  // Merge shipping settings prices with ALGERIA_WILAYAS defaults
  const wilayasWithPrices = useMemo(() => {
    const settingsMap = new Map(
      shippingSettings.wilayas?.map((w) => [normalizeAlgeriaLocationName(w.name), w]) ?? []
    );
    return ALGERIA_WILAYAS.map((w) => {
      const override = settingsMap.get(normalizeAlgeriaLocationName(w.name));
      return {
        ...w,
        homePrice: override?.homePrice ?? w.priceHome,
        deskPrice: override?.deskPrice ?? w.priceDesk,
      };
    });
  }, [shippingSettings]);

  const selectedWilaya = useMemo(
    () => wilayasWithPrices.find((w) => w.name === formWilaya),
    [wilayasWithPrices, formWilaya]
  );

  const availableCommunes = useMemo(
    () => selectedWilaya?.communes ?? [],
    [selectedWilaya]
  );

  // Reset commune when wilaya changes
  useEffect(() => {
    setFormCommune("");
  }, [formWilaya]);

  const shippingCost = useMemo(() => {
    if (!selectedWilaya) return 0;
    return deliveryType === "home" ? selectedWilaya.homePrice : selectedWilaya.deskPrice;
  }, [selectedWilaya, deliveryType]);

  const subtotal = useMemo(() => (product ? Number(product.price) * qty : 0), [product, qty]);
  const total = useMemo(() => subtotal + shippingCost, [shippingCost, subtotal]);

  // Track ViewContent when product loads
  useEffect(() => {
    if (product) {
      track(
        "ViewContent",
        {},
        {
          content_name: product.name,
          content_ids: [product.id],
          content_type: "product",
          contents: [{ id: product.id, quantity: 1, item_price: Number(product.price) }],
          value: Number(product.price),
          currency: "DZD",
        }
      );
    }
  }, [product, track]);

  useEffect(() => {
    saveTrackingProfile({
      name: formName,
      phone: formPhone,
      state: formWilaya,
      city: formCommune,
    });
  }, [formName, formPhone, formWilaya, formCommune]);

  useEffect(() => {
    const hasLeadData =
      formName.trim().length >= 2 &&
      /^0[5-7][0-9]{8}$/.test(formPhone.trim()) &&
      !!formWilaya &&
      !!formCommune;

    if (!product || !hasLeadData || leadTrackedRef.current) {
      return;
    }

    saveTrackingProfile({
      name: formName,
      phone: formPhone,
      state: formWilaya,
      city: formCommune,
    });

    track(
      "Lead",
      {
        firstName: formName,
        phone: formPhone,
        state: formWilaya,
        city: formCommune,
      },
      {
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        value: total,
        currency: "DZD",
      }
    );
    leadTrackedRef.current = true;
  }, [formName, formPhone, formWilaya, formCommune, product, total, track]);

  // Set active image when product/gallery loads
  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0].image_url);
    } else if (product?.image_url) {
      setActiveImage(product.image_url);
    }
  }, [product, galleryImages]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft > 0]);

  useEffect(() => {
    if (!submitted) {
      return;
    }

    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submitted]);

  useEffect(() => {
    if (!missingOptionName) {
      return;
    }

    const normalizedSelected = normalizeSelectedOptions(selectedOptions);
    if (normalizedSelected[missingOptionName]) {
      setMissingOptionName(null);
    }
  }, [missingOptionName, selectedOptions]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !product) return;
    const firstMissingOption = getFirstMissingSelection(productOptions, selectedOptions);
    if (firstMissingOption || !hasRequiredSelections(productOptions, selectedOptions)) {
      setMissingOptionName(firstMissingOption?.name ?? null);
      toast.error("الرجاء اختيار جميع خيارات المنتج");
      return;
    }
    setMissingOptionName(null);
    if (Number(product.stock) <= 0) {
      toast.error("هذا المنتج غير متوفر حالياً");
      return;
    }
    if (qty > Number(product.stock)) {
      toast.error(`الكمية المتاحة حالياً هي ${product.stock} فقط`);
      return;
    }

    if (!formWilaya || !formCommune) {
      toast.error("الرجاء اختيار الولاية والبلدية");
      return;
    }

    // Algerian Phone Validation
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!phoneRegex.test(formPhone.trim())) {
      toast.error("رقام الهاتف غير صالح. يجب أن يكون رقم جزائري صحيح (05/06/07).");
      return;
    }

    // Turnstile Check
    if (securitySettings.turnstile_enabled && !turnstileToken) {
      toast.error("الرجاء إكمال التحقق الأمني");
      return;
    }

    let customerId: string | undefined;
    try {
      const customer = await createCustomer.mutateAsync({
        name: formName.trim(),
        phone: formPhone.trim(),
        wilaya: formWilaya,
        commune: formCommune,
      });
      customerId = customer.id;
    } catch {
      // Customer creation failure should not block order creation flow.
    }

    createOrder.mutate(
      {
        customer_name: formName.trim(),
        customer_phone: formPhone.trim(),
        wilaya: formWilaya,
        commune: formCommune,
        delivery_type: deliveryType,
        subtotal,
        shipping_cost: shippingCost,
        total,
        customer_id: customerId,
        website_url: honeypotValue,
        "cf-turnstile-response": turnstileToken,
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            selected_options: normalizeSelectedOptions(selectedOptions),
            quantity: qty,
            unit_price: Number(product.price),
            total: subtotal,
          },
        ],
      },
      {
        onSuccess: async (order: { order_number?: number }) => {
          saveTrackingProfile({
            name: formName.trim(),
            phone: formPhone.trim(),
            state: formWilaya,
            city: formCommune,
          });
          const currentOptionsKey = JSON.stringify(normalizeSelectedOptions(selectedOptions));
          const matchingCartItems = items.filter((item) => item.product_id === product.id && JSON.stringify(normalizeSelectedOptions(item.selected_options)) === currentOptionsKey);
          if (matchingCartItems.length > 0) {
            await Promise.all(matchingCartItems.map((item) => removeItemAsync(item.id)));
          }
          track("Purchase", {
            phone: formPhone.trim(),
            firstName: formName.trim(),
            city: formCommune,
            state: formWilaya,
          }, {
            value: total,
            currency: "DZD",
            content_ids: [product.id],
            content_name: product.name,
            content_type: "product",
            contents: [{ id: product.id, quantity: qty, item_price: Number(product.price) }],
            num_items: qty,
          });
          setSubmittedOrderNumber(order?.order_number ?? null);
          setSubmitted(true);
        },
      }
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    const firstMissingOption = getFirstMissingSelection(productOptions, selectedOptions);
    if (firstMissingOption || !hasRequiredSelections(productOptions, selectedOptions)) {
      setMissingOptionName(firstMissingOption?.name ?? null);
      toast.error("اختر خيارات المنتج أولاً");
      return;
    }
    setMissingOptionName(null);
    addItem({
      product_id: product.id,
      product_name: product.name,
      selected_options: normalizeSelectedOptions(selectedOptions),
      product_price: Number(product.price),
      product_image_url: product.image_url,
      quantity: qty,
    });
    window.dispatchEvent(new Event("open-cart"));
    track("AddToCart", {}, {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      contents: [{ id: product.id, quantity: qty, item_price: Number(product.price) }],
      value: Number(product.price) * qty,
      currency: "DZD",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-store-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[50vh]">
        <p className="text-xl text-gray-500 mb-4">المنتج غير موجود</p>
        <Link to="/" className="text-store-primary font-medium hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  const productImages = galleryImages.length > 0
    ? galleryImages.map((gi) => gi.image_url)
    : product.image_url ? [product.image_url] : [];

  const selectedOptionsKey = JSON.stringify(normalizeSelectedOptions(selectedOptions));
  const inCart = items.some((item) => item.product_id === product.id && JSON.stringify(normalizeSelectedOptions(item.selected_options)) === selectedOptionsKey);
  const productDescriptionHtml = product.description ? sanitizeProductDescription(product.description) : "";

  return (
    <div className="font-[Cairo] pb-20 md:pb-0">
      {/* Breadcrumb */}
      <div
        className="hidden border-b py-4 md:block"
        style={{ backgroundColor: tokens.surfaceSoft, borderColor: tokens.border }}
      >
        <div className="container mx-auto flex items-center px-4 text-sm" style={{ color: tokens.textMuted }}>
          <Link to="/" className="transition-colors" style={{ color: tokens.textMuted }}>
            الرئيسية
          </Link>
          <ChevronRight size={14} className="mx-2" style={{ color: tokens.textSoft }} />
          <Link to="/shop" className="transition-colors" style={{ color: tokens.textMuted }}>
            المتجر
          </Link>
          <ChevronRight size={14} className="mx-2" style={{ color: tokens.textSoft }} />
          {product.category_name && (
            <>
              <Link to={`/shop?category=${product.category_id}`} className="transition-colors" style={{ color: tokens.textMuted }}>
                {product.category_name}
              </Link>
              <ChevronRight size={14} className="mx-2" style={{ color: tokens.textSoft }} />
            </>
          )}
          <span className="line-clamp-1 font-semibold" style={{ color: tokens.textPrimary }}>{product.name}</span>
        </div>
      </div>

      <ProductHero
        product={product}
        productImages={productImages}
        activeImage={activeImage}
        hasDiscount={hasDiscount}
        discountPercent={discountPercent}
        qty={qty}
        timeLeftLabel={formatTime(timeLeft)}
        submitted={submitted}
        submittedOrderNumber={submittedOrderNumber}
        formName={formName}
        formPhone={formPhone}
        formWilaya={formWilaya}
        formCommune={formCommune}
        deliveryType={deliveryType}
        selectedWilaya={selectedWilaya}
        availableCommunes={availableCommunes}
        wilayasWithPrices={wilayasWithPrices}
        shippingCost={shippingCost}
        total={total}
        inCart={inCart}
        productOptions={productOptions}
        selectedOptions={selectedOptions}
        missingOptionName={missingOptionName}
        isAdding={isAdding}
        isSubmitting={createOrder.isPending}
        onImageSelect={setActiveImage}
        onQtyChange={(nextQty) => setQty(Math.max(1, Math.min(Number(product.stock || 1), nextQty)))}
        onNameChange={setFormName}
        onPhoneChange={setFormPhone}
        onWilayaChange={setFormWilaya}
        onCommuneChange={setFormCommune}
        onDeliveryTypeChange={setDeliveryType}
        onSelectedOptionsChange={(name, value) => setSelectedOptions((prev) => ({ ...prev, [name]: value }))}
        onAddToCart={handleAddToCart}
        securitySettings={securitySettings}
        onHoneypotChange={setHoneypotValue}
        onTurnstileSuccess={setTurnstileToken}
        onSubmit={handleSubmitOrder}
      />

      {/* Description Section */}
      {product.description && (
        <section className="container mx-auto px-4 py-8">
          <div className="rounded-3xl shadow-sm p-6 md:p-10" style={{ backgroundColor: tokens.surface, border: `1px solid ${tokens.border}` }}>
            <h2 className="text-2xl font-bold mb-6 inline-block border-b-4 pb-2" style={{ color: tokens.textPrimary, borderColor: theme.accent_color }}>وصف المنتج</h2>
            <div
              className="prose max-w-none text-base md:text-lg leading-relaxed"
              style={{ color: tokens.textMuted }}
              dangerouslySetInnerHTML={{ __html: productDescriptionHtml }}
            />
          </div>
        </section>
      )}

      <ProductTrustBadges />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 mt-6 mb-10">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-4 pb-2" style={{ color: tokens.textPrimary, borderColor: theme.accent_color }}>منتجات ذات صلة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                stock={Number(p.stock)}
                compare_price={p.compare_price ? Number(p.compare_price) : null}
                image_url={p.image_url}
                category_name={p.category_name}
                custom_options={p.custom_options}
                theme={theme}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductPage;
