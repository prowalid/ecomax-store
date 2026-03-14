import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertOctagon,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Home,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  TrendingUp,
  Truck,
  User,
} from "lucide-react";

import type { ProductHeroProps } from "./types";
import OrderSuccessMessage from "@/components/store/OrderSuccessMessage";
import { formatSelectedOptions } from "@/lib/productOptions";

const formatPrice = (n: number) => n.toLocaleString("ar-DZ") + " دج";

export default function ProductHero({
  product,
  productImages,
  activeImage,
  hasDiscount,
  discountPercent,
  qty,
  timeLeftLabel,
  submitted,
  submittedOrderNumber,
  formName,
  formPhone,
  formWilaya,
  formCommune,
  deliveryType,
  selectedWilaya,
  availableCommunes,
  wilayasWithPrices,
  shippingCost,
  total,
  inCart,
  productOptions,
  selectedOptions,
  missingOptionName,
  isAdding,
  isSubmitting,
  onImageSelect,
  onQtyChange,
  onNameChange,
  onPhoneChange,
  onWilayaChange,
  onCommuneChange,
  onDeliveryTypeChange,
  onSelectedOptionsChange,
  onAddToCart,
  securitySettings,
  onHoneypotChange,
  onTurnstileSuccess,
  onSubmit,
}: ProductHeroProps) {
  const subtotal = Number(product.price) * qty;
  const optionGroupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!missingOptionName) return;

    const target = optionGroupRefs.current[missingOptionName];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => target.focus({ preventScroll: true }), 250);
  }, [missingOptionName]);

  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 md:py-16 overflow-x-clip">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5 p-4 sm:p-5 md:p-10 flex flex-col lg:flex-row gap-8 lg:gap-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 hidden md:block w-[500px] h-[500px] bg-store-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="w-full lg:w-5/12 relative z-10">
          <div className="relative rounded-3xl overflow-hidden mb-6 group cursor-zoom-in shadow-xl shadow-gray-200/50 bg-gray-50">
            {hasDiscount && (
              <span className="absolute top-5 right-5 bg-store-primary/95 backdrop-blur-sm text-white text-sm font-black px-5 py-2 rounded-full z-10 shadow-lg shadow-store-primary/30 flex items-center">
                <TrendingUp size={16} className="ml-1.5" /> وفر {discountPercent}%
              </span>
            )}
            {activeImage || product.image_url ? (
              <img
                src={activeImage || product.image_url || ""}
                alt={product.name}
                loading="eager"
                className="w-full aspect-[4/5] object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center text-8xl text-gray-200">📦</div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => onImageSelect(img)}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 relative ${
                    activeImage === img
                      ? "shadow-[0_0_0_2px_var(--store-primary)] ring-4 ring-store-primary/20 scale-105 z-10"
                      : "hover:shadow-md hover:-translate-y-1 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-7/12 flex flex-col relative z-10">
          {product.category_name && (
            <div className="mb-3">
              <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider">
                {product.category_name}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-[1.25] tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center flex-wrap gap-2 mb-8">
            {hasDiscount && (
              <span className="text-sm font-bold bg-green-50 text-green-700 px-4 py-1.5 rounded-full flex items-center border border-green-100">
                <TrendingUp size={16} className="ml-1.5 text-green-500" /> وفّر {discountPercent}%
              </span>
            )}
          </div>

          <div className="bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-red-100/50 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-baseline space-x-3 space-x-reverse mb-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-store-primary tracking-tight">
                  {formatPrice(Number(product.price))}
                </span>
                {hasDiscount && (
                  <span className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through font-bold opacity-70">
                    {formatPrice(Number(product.compare_price))}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="inline-flex items-center bg-white border border-red-100 px-3 py-1.5 rounded-xl shadow-sm">
                  <Clock size={16} className="ml-2 text-red-500" />
                  <span className="text-sm text-gray-600 font-bold ml-2">العرض ينتهي خلال:</span>
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded text-sm font-black tracking-widest">
                    {timeLeftLabel}
                  </span>
                </div>
              )}
            </div>

            {product.stock > 0 && product.stock <= 20 && (
              <div className="w-full md:w-56 bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                <p className="text-xs text-gray-900 font-bold mb-3 flex justify-between items-center">
                  <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    <AlertOctagon size={14} className="ml-1" /> سارع بالطلب!
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded-md">{product.stock} قطع فقط</span>
                </p>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-l from-red-500 to-orange-400 h-3 rounded-full relative overflow-hidden"
                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-white/30 animate-[stripes_1s_linear_infinite] background-size-[1rem_1rem]"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            id="order-form"
            className="bg-white border-2 border-store-primary/20 shadow-[0_8px_30px_rgba(220,53,69,0.1)] rounded-3xl p-5 md:p-7 mt-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-store-primary to-orange-400" />

            {submitted ? (
              <div className="py-6">
                <OrderSuccessMessage
                  orderNumber={submittedOrderNumber}
                  actionLabel="العودة إلى المتجر"
                  actionTo="/"
                />
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900">للطلب أدخل معلوماتك هنا</h2>
                  <p className="text-gray-500 text-sm mt-1">والدفع يكون عند الاستلام</p>
                </div>

                <form id="product-order-form" onSubmit={onSubmit} className="space-y-4" autoComplete="on">
                  {productOptions.length > 0 && (
                    <div className="rounded-[1.75rem] border border-store-primary/15 bg-gradient-to-b from-rose-50/80 via-white to-white p-4 sm:p-5 shadow-[0_12px_40px_rgba(220,53,69,0.08)] space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black text-gray-900">خيارات المنتج</h3>
                          <p className="mt-1 text-xs leading-6 text-gray-500">اختر القيمة المناسبة لكل عنصر حتى يتم اعتماد الطلب بشكل صحيح.</p>
                        </div>
                        <div className="rounded-full bg-store-primary/10 px-3 py-1 text-[11px] font-black text-store-primary">
                          اختيارات مطلوبة
                        </div>
                      </div>
                      <div className="space-y-4">
                        {productOptions.map((group) => {
                          const isMissing = missingOptionName === group.name;
                          return (
                          <div
                            key={group.name}
                            ref={(node) => {
                              optionGroupRefs.current[group.name] = node;
                            }}
                            tabIndex={-1}
                            className={`rounded-2xl p-3 shadow-sm space-y-3 outline-none transition-all duration-300 ${
                              isMissing
                                ? "border-2 border-store-primary bg-store-primary/5 shadow-[0_0_0_4px_rgba(220,53,69,0.12)]"
                                : "border border-white/80 bg-white/90"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <label className="block text-sm font-black text-gray-900">{group.name}</label>
                                {isMissing && (
                                  <p className="mt-1 text-[11px] font-bold text-store-primary">
                                    هذا الخيار مطلوب قبل متابعة الطلب
                                  </p>
                                )}
                              </div>
                              <span className={`text-[11px] font-bold ${isMissing ? "text-store-primary" : "text-gray-400"}`}>
                                {group.values.length} خيارات
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {group.values.map((value) => {
                                const active = selectedOptions[group.name] === value;
                                return (
                                  <button
                                    key={`${group.name}-${value}`}
                                    type="button"
                                    onClick={() => onSelectedOptionsChange(group.name, value)}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all duration-200 ${
                                      active
                                        ? "bg-store-primary text-white shadow-[0_6px_16px_rgba(220,53,69,0.22)] ring-2 ring-store-primary/15"
                                        : "border border-rose-100 bg-rose-50/40 text-gray-700 hover:border-store-primary/30 hover:bg-rose-50"
                                    }`}
                                  >
                                    {value}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )})}
                      </div>
                      {formatSelectedOptions(selectedOptions) && (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs font-medium text-emerald-700">
                          الاختيارات الحالية: <span className="font-black text-emerald-900">{formatSelectedOptions(selectedOptions)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => onNameChange(e.target.value)}
                        name="customer_name"
                        autoComplete="name"
                        placeholder="الاسم الكامل"
                        required
                        className="w-full pr-11 pl-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-store-primary/30 focus:border-store-primary outline-none transition-all text-base md:text-sm text-gray-800 font-bold shadow-sm"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        name="customer_phone"
                        autoComplete="tel-national"
                        inputMode="tel"
                        placeholder="رقم الهاتف"
                        required
                        className="w-full pr-11 pl-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-store-primary/30 focus:border-store-primary outline-none transition-all text-base md:text-sm text-left font-bold text-gray-800 shadow-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Honeypot Field (Invisible) */}
                  <input
                    type="text"
                    onChange={(e) => onHoneypotChange?.(e.target.value)}
                    name="website_url"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <MapPin size={18} />
                      </div>
                      <select
                        value={formWilaya}
                        onChange={(e) => onWilayaChange(e.target.value)}
                        name="wilaya"
                        autoComplete="address-level1"
                        required
                        className="w-full pr-11 pl-8 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-store-primary/30 focus:border-store-primary outline-none transition-all text-base md:text-sm text-gray-800 font-bold appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="">اختر الولاية</option>
                        {wilayasWithPrices.map((wilaya) => (
                          <option key={wilaya.id} value={wilaya.name}>
                            {String(wilaya.id).padStart(2, "0")} - {wilaya.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <Truck size={18} />
                      </div>
                      <select
                        value={formCommune}
                        onChange={(e) => onCommuneChange(e.target.value)}
                        name="commune"
                        autoComplete="address-level2"
                        required
                        disabled={!formWilaya}
                        className={
                          "w-full pr-11 pl-8 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-store-primary/30 focus:border-store-primary outline-none transition-all text-base md:text-sm text-gray-800 font-bold appearance-none cursor-pointer shadow-sm" +
                          (!formWilaya ? " opacity-50 cursor-not-allowed" : "")
                        }
                      >
                        <option value="">اختر البلدية</option>
                        {availableCommunes.map((commune) => (
                          <option key={commune} value={commune}>
                            {commune}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {selectedWilaya ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-blue-900 text-xs">أسعار التوصيل - {selectedWilaya.name}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
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
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">اختر الولاية لعرض أسعار التوصيل</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                    <p className="font-bold text-gray-700 mb-3">طريقة التوصيل:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => onDeliveryTypeChange("home")}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          deliveryType === "home"
                            ? "border-store-primary bg-white text-store-primary"
                            : "border-gray-300 bg-white text-gray-700 hover:border-store-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Home size={18} />
                          توصيل للمنزل
                        </div>
                        {selectedWilaya && (
                          <span className="text-xs font-medium opacity-70">{formatPrice(selectedWilaya.homePrice)}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeliveryTypeChange("desk")}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          deliveryType === "desk"
                            ? "border-store-primary bg-white text-store-primary"
                            : "border-gray-300 bg-white text-gray-700 hover:border-store-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={18} />
                          نقطة تسليم / مكتب
                        </div>
                        {selectedWilaya && (
                          <span className="text-xs font-medium opacity-70">{formatPrice(selectedWilaya.deskPrice)}</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
                    <span className="font-bold text-gray-700">الكمية المطلوبة:</span>
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => onQtyChange(Math.max(1, qty - 1))}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                      >
                        -
                      </button>
                      <input type="text" readOnly value={qty} className="w-12 text-center font-bold text-gray-900 outline-none" />
                      <button
                        type="button"
                        onClick={() => onQtyChange(qty + 1)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-200 mt-2 shadow-sm">
                    <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                      <span>المجموع الفرعي ({qty} قطعة):</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-3 text-sm text-gray-600 font-medium">
                      <span>التوصيل:</span>
                      <span className={selectedWilaya ? "text-gray-900 font-bold" : "text-gray-500"}>
                        {selectedWilaya ? formatPrice(shippingCost) : "يُحسب حسب الولاية"}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-xl border-t border-gray-300 pt-3 mt-1 text-gray-900">
                      <span>المجموع الكلي:</span>
                      <span className="text-store-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Turnstile Widget */}
                  {securitySettings?.turnstile_enabled && securitySettings?.site_key && (
                    <div className="flex justify-center my-4 min-h-[65px]">
                      <div
                        className="cf-turnstile"
                        data-sitekey={securitySettings.site_key}
                        data-callback="onTurnstileSuccess"
                        data-theme="light"
                      ></div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {product.stock <= 0 ? (
                      <button
                        type="button"
                        disabled
                        className="bg-gray-100 border border-gray-200 text-gray-500 font-bold py-4 rounded-2xl flex justify-center items-center cursor-not-allowed"
                      >
                        <AlertOctagon size={22} className="ml-2 text-amber-500" /> نفد المخزون
                      </button>
                    ) : inCart ? (
                      <button
                        type="button"
                        disabled
                        className="bg-gray-100 border border-gray-200 text-gray-500 font-bold py-4 rounded-2xl flex justify-center items-center cursor-not-allowed"
                      >
                        <CheckCircle2 size={22} className="ml-2 text-green-500" /> تمت الإضافة للسلة
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onAddToCart}
                        disabled={isAdding || product.stock <= 0}
                        className="bg-white border-2 border-store-primary text-store-primary font-black py-4 rounded-2xl hover:bg-store-primary hover:text-white transition-all duration-300 flex justify-center items-center disabled:opacity-50 hover:shadow-[0_8px_25px_rgba(220,53,69,0.2)] hover:-translate-y-1"
                      >
                        {isAdding ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            أضف للسلة <ShoppingBag size={22} className="mr-2" />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || product.stock <= 0}
                      className="bg-gradient-to-r from-store-primary to-[#ff4b5c] text-white font-black py-4 rounded-2xl shadow-[0_8px_25px_rgba(220,53,69,0.3)] hover:shadow-[0_15px_35px_rgba(220,53,69,0.4)] transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : product.stock <= 0 ? (
                        <>
                          غير متوفر حالياً <AlertOctagon size={22} className="mr-2" />
                        </>
                      ) : (
                        <>
                          اطلب الآن والدفع عند الاستلام <Package size={22} className="mr-2 animate-pulse" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
