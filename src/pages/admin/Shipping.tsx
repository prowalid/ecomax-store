import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Save, Search, Truck } from "lucide-react";

import AdminIntegrationStatusNote from "@/components/admin/AdminIntegrationStatusNote";
import AdminSecureField from "@/components/admin/AdminSecureField";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ALGERIA_WILAYAS } from "@/data/algeriaWilayas";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

interface YalidineSettings {
  enabled: boolean;
  api_base_url: string;
  api_id: string;
  api_token: string;
  shipper_name: string;
  shipper_phone: string;
  from_wilaya_name: string;
  from_commune_name: string;
  stopdesk_id: string;
  default_product_name: string;
}

interface ShippingSettings {
  wilayas: WilayaShipping[];
  provider: {
    active_provider: ShippingProviderKey;
  };
  yalidine: YalidineSettings;
}

type ShippingProviderKey =
  | "manual"
  | "yalidine"
  | "zr_express"
  | "mdm_express"
  | "near_delivery"
  | "maystro";

const SHIPPING_PROVIDERS: Array<{
  key: ShippingProviderKey;
  label: string;
  status: "live" | "planned";
  description: string;
}> = [
  {
    key: "manual",
    label: "بدون مزود خارجي",
    status: "live",
    description: "إدارة الشحن يدويًا من صفحة الطلبات دون رفع مباشر إلى شركة شحن.",
  },
  {
    key: "yalidine",
    label: "Yalidine",
    status: "live",
    description: "التكامل الفعلي الحالي. رفع الطلبات من الأدمن مع حفظ شركة الشحن ورقم التتبع.",
  },
  {
    key: "zr_express",
    label: "ZR Express",
    status: "planned",
    description: "مزود مشهور في السوق الجزائري، والبنية الآن جاهزة لإضافة adapter مستقل له لاحقًا.",
  },
  {
    key: "mdm_express",
    label: "MDM Express",
    status: "planned",
    description: "شركة محلية موجهة للتجارة الإلكترونية، أضفناها كمسار جاهز ضمن هيكل المزودات.",
  },
  {
    key: "near_delivery",
    label: "Near Delivery",
    status: "planned",
    description: "مزود يعتمد نقاط تسليم وشبكة وطنية، وسيأتي لاحقًا ضمن نفس طبقة الشحن.",
  },
  {
    key: "maystro",
    label: "Maystro",
    status: "planned",
    description: "محجوزة كبوابة تكامل لاحقة حتى تبقى صفحة الشحن جاهزة للتوسع المنظم.",
  },
];

const defaultShippingSettings: ShippingSettings = {
  wilayas: [],
  provider: {
    active_provider: "manual",
  },
  yalidine: {
    enabled: false,
    api_base_url: "https://api.yalidine.app/v1",
    api_id: "",
    api_token: "",
    shipper_name: "",
    shipper_phone: "",
    from_wilaya_name: "",
    from_commune_name: "",
    stopdesk_id: "",
    default_product_name: "",
  },
};

const Shipping = () => {
  const { settings, loading, saving, saveSettings } = useStoreSettings<ShippingSettings>("shipping", defaultShippingSettings);
  const [wilayas, setWilayas] = useState<WilayaShipping[]>(() =>
    ALGERIA_WILAYAS.map((w) => ({ id: w.id, name: w.name, homePrice: w.priceHome, deskPrice: w.priceDesk }))
  );
  const [providerSettings, setProviderSettings] = useState(defaultShippingSettings.provider);
  const [yalidineSettings, setYalidineSettings] = useState<YalidineSettings>(defaultShippingSettings.yalidine);
  const [yalidineSecretsDraft, setYalidineSecretsDraft] = useState({ api_id: "", api_token: "" });
  const [search, setSearch] = useState("");
  const [providerPanelOpen, setProviderPanelOpen] = useState(true);

  useEffect(() => {
    const savedMap = new Map((settings.wilayas || []).map((w) => [w.name, w]));
    setWilayas(
      ALGERIA_WILAYAS.map((w) => {
        const saved = savedMap.get(w.name);
        return {
          id: w.id,
          name: w.name,
          homePrice: saved?.homePrice ?? w.priceHome,
          deskPrice: saved?.deskPrice ?? w.priceDesk,
        };
      })
    );

    setProviderSettings({
      ...defaultShippingSettings.provider,
      ...(settings.provider || {}),
    });

    setYalidineSettings({
      ...defaultShippingSettings.yalidine,
      ...(settings.yalidine || {}),
    });
    setYalidineSecretsDraft({ api_id: "", api_token: "" });
  }, [settings]);

  const filtered = wilayas.filter(
    (w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.id.toString().includes(search)
  );

  const savedYalidineSettings = useMemo(
    () => ({
      ...defaultShippingSettings.yalidine,
      ...(settings.yalidine || {}),
    }),
    [settings.yalidine]
  );

  const isYalidineConfigured = useMemo(() => {
    return Boolean(
      savedYalidineSettings.enabled &&
      savedYalidineSettings.api_base_url.trim() &&
      savedYalidineSettings.api_id.trim() &&
      savedYalidineSettings.api_token.trim() &&
      savedYalidineSettings.shipper_name.trim() &&
      savedYalidineSettings.shipper_phone.trim() &&
      savedYalidineSettings.from_wilaya_name.trim()
    );
  }, [savedYalidineSettings]);

  const activeProviderMeta = SHIPPING_PROVIDERS.find((provider) => provider.key === providerSettings.active_provider)
    || SHIPPING_PROVIDERS[0];

  const updatePrice = (id: number, field: "homePrice" | "deskPrice", value: number) => {
    setWilayas((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const updateYalidine = <K extends keyof YalidineSettings>(key: K, value: YalidineSettings[K]) => {
    setYalidineSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const nextYalidineSettings = {
      ...yalidineSettings,
      api_id: yalidineSecretsDraft.api_id.trim() || savedYalidineSettings.api_id,
      api_token: yalidineSecretsDraft.api_token.trim() || savedYalidineSettings.api_token,
    };

    saveSettings({
      wilayas,
      provider: providerSettings,
      yalidine: nextYalidineSettings,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">الشحن</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">أسعار التوصيل المحلية وربط شركة Yalidine من نفس الصفحة.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-6 text-[14px] font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">مزود الشحن</h2>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                اختر مزود الشحن النشط. سنُظهر إعدادات المزود المختار فقط حتى تبقى الصفحة قابلة للتوسع عند إضافة شركات أخرى.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
            <label className="space-y-1">
              <span className="text-xs font-bold text-slate-500">الوضع التشغيلي</span>
              <select
                value={providerSettings.active_provider}
                onChange={(e) => {
                  const nextProvider = e.target.value as ShippingProviderKey;
                  setProviderSettings({ active_provider: nextProvider });
                  setYalidineSettings((prev) => ({ ...prev, enabled: nextProvider === "yalidine" }));
                }}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SHIPPING_PROVIDERS.map((provider) => (
                  <option key={provider.key} value={provider.key}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setProviderPanelOpen((prev) => !prev)}
              className="mt-auto inline-flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <span>{providerPanelOpen ? "إخفاء إعدادات المزود" : "إظهار إعدادات المزود"}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${providerPanelOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SHIPPING_PROVIDERS.filter((provider) => provider.key !== "manual").map((provider) => {
            const isActive = provider.key === providerSettings.active_provider;
            return (
              <button
                key={provider.key}
                type="button"
                onClick={() => {
                  setProviderSettings({ active_provider: provider.key });
                  setYalidineSettings((prev) => ({ ...prev, enabled: provider.key === "yalidine" }));
                }}
                className={`rounded-[20px] border p-4 text-right transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-900">{provider.label}</h3>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      provider.status === "live"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {provider.status === "live" ? "متاح الآن" : "قريبًا"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-500">{provider.description}</p>
              </button>
            );
          })}
        </div>

        {providerSettings.active_provider === "manual" ? (
          <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50/80 p-5">
            <h3 className="text-sm font-black text-slate-900">وضع يدوي</h3>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              المتجر سيعتمد فقط على أسعار الشحن المحلية وتدبير الطلبات يدويًا من قسم الطلبات دون رفع مباشر إلى شركة شحن.
            </p>
          </div>
        ) : null}

        {providerSettings.active_provider !== "manual" && providerSettings.active_provider !== "yalidine" ? (
          <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50/80 p-5">
            <h3 className="text-sm font-black text-slate-900">{activeProviderMeta.label}</h3>
            <p className="mt-1 text-xs leading-6 text-slate-600">
              هذا المزود ضمن خارطة التوسع القادمة. يمكنك اختياره من الآن للاطلاع على توفره داخل النظام، وسيتم إتاحة الربط التشغيلي الكامل له بمجرد اعتماده.
            </p>
          </div>
        ) : null}

        {providerSettings.active_provider === "yalidine" && providerPanelOpen ? (
          <div className="mt-5 space-y-5">
            <AdminIntegrationStatusNote
              configured={isYalidineConfigured}
              configuredTitle="Yalidine جاهز للعمل"
              configuredDescription="يمكنك الآن رفع الطلبات من صفحة الطلبات مباشرة إلى Yalidine عند الحاجة."
              pendingTitle="أكمل بيانات الربط أولاً"
              pendingDescription="أدخل API ID وAPI Token وبيانات المرسل وولاية الإرسال، ثم احفظ الإعدادات قبل استعمال الرفع المباشر."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <AdminSecureField
                title="رابط API"
                description="اتركه كما هو غالباً. أبقيناه قابلاً للتعديل حتى لا نربط المشروع بفرضية واحدة."
                value={yalidineSettings.api_base_url}
                onChange={(e) => updateYalidine("api_base_url", e.target.value)}
                placeholder="https://api.yalidine.app/v1"
                dir="ltr"
                configured={Boolean(yalidineSettings.api_base_url.trim())}
              />

              <AdminSecureField
                title="API ID"
                description="المعرّف الذي تمنحه لك Yalidine."
                type="text"
                value={yalidineSecretsDraft.api_id}
                onChange={(e) => setYalidineSecretsDraft((prev) => ({ ...prev, api_id: e.target.value }))}
                placeholder={savedYalidineSettings.api_id ? "قيمة محفوظة — أدخل API ID جديدًا للاستبدال" : "Your Yalidine API ID"}
                dir="ltr"
                configured={Boolean(savedYalidineSettings.api_id.trim())}
                helperText="إذا كانت القيمة محفوظة بالفعل فاترك الحقل فارغًا، واكتب داخله فقط عند الرغبة في استبدالها."
              />

              <AdminSecureField
                title="API Token"
                description="التوكن السري لرفع الطلبات إلى Yalidine."
                type="password"
                value={yalidineSecretsDraft.api_token}
                onChange={(e) => setYalidineSecretsDraft((prev) => ({ ...prev, api_token: e.target.value }))}
                placeholder={savedYalidineSettings.api_token ? "قيمة محفوظة — أدخل Token جديدًا للاستبدال" : "Your Yalidine API Token"}
                dir="ltr"
                configured={Boolean(savedYalidineSettings.api_token.trim())}
                helperText="لن نعرض التوكن الحالي. أدخل قيمة جديدة فقط إذا أردت استبداله ثم احفظ الإعدادات."
              />

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">اسم المرسل</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">الاسم الذي سيذهب ضمن بيانات الشحنة من متجرك إلى Yalidine.</p>
                <input
                  type="text"
                  value={yalidineSettings.shipper_name}
                  onChange={(e) => updateYalidine("shipper_name", e.target.value)}
                  placeholder="اسم المرسل"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-right text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">هاتف المرسل</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">رقم صاحب المتجر أو الخط المعتمد لتعامل Yalidine مع الشحنات.</p>
                <input
                  type="tel"
                  value={yalidineSettings.shipper_phone}
                  onChange={(e) => updateYalidine("shipper_phone", e.target.value)}
                  placeholder="0555123456"
                  dir="ltr"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">ولاية الإرسال</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">الولاية التي تنطلق منها شحناتك عند إنشاء الطلبات في Yalidine.</p>
                <select
                  value={yalidineSettings.from_wilaya_name}
                  onChange={(e) => updateYalidine("from_wilaya_name", e.target.value)}
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">اختر الولاية</option>
                  {ALGERIA_WILAYAS.map((wilaya) => (
                    <option key={wilaya.id} value={wilaya.name}>
                      {wilaya.id.toString().padStart(2, "0")} - {wilaya.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">بلدية / مركز الانطلاق</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">اختياري. يفيد في تحسين بيانات الشحنة إذا كانت Yalidine تعتمدها في حساب الفرع أو المسار.</p>
                <input
                  type="text"
                  value={yalidineSettings.from_commune_name}
                  onChange={(e) => updateYalidine("from_commune_name", e.target.value)}
                  placeholder="مثال: السانيا"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-right text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Stop Desk ID</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">اختياري كقيمة override فقط. إذا تركته فارغًا سيختار النظام تلقائيًا أقرب مركز متاح من Yalidine داخل ولاية الزبون.</p>
                <input
                  type="text"
                  value={yalidineSettings.stopdesk_id}
                  onChange={(e) => updateYalidine("stopdesk_id", e.target.value)}
                  placeholder="مثال: 12345"
                  dir="ltr"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-900">اسم منتج افتراضي داخل الشحنة</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  اختياري. إذا تركته فارغًا سنرسل ملخص المنتجات الفعلي من الطلب. إذا كتبته سنرسله بدلًا من ذلك.
                </p>
                <input
                  type="text"
                  value={yalidineSettings.default_product_name}
                  onChange={(e) => updateYalidine("default_product_name", e.target.value)}
                  placeholder="مثال: طلب متجر إلكتروني"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-right text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث عن ولاية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-card pr-9 pl-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-card md:block animate-slide-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-16 px-5 py-3 text-right text-xs font-medium text-muted-foreground">#</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">الولاية</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">🏠 التوصيل للمنزل (د.ج)</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">🏢 التوصيل للمكتب (د.ج)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
                <td className="px-5 py-2.5 font-mono text-sm text-muted-foreground">{String(w.id).padStart(2, "0")}</td>
                <td className="px-5 py-2.5 text-sm font-medium text-foreground">{w.name}</td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    value={w.homePrice}
                    onChange={(e) => updatePrice(w.id, "homePrice", Number(e.target.value))}
                    className="h-8 w-24 rounded-md border border-input bg-background px-2.5 text-center text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    value={w.deskPrice}
                    onChange={(e) => updatePrice(w.id, "deskPrice", Number(e.target.value))}
                    className="h-8 w-24 rounded-md border border-input bg-background px-2.5 text-center text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {filtered.map((w) => (
          <div key={w.id} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-mono text-xs text-muted-foreground">#{String(w.id).padStart(2, "0")}</span>
              <span className="font-bold text-foreground">{w.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground">🏠 التوصيل للمنزل</label>
                <div className="relative">
                  <input
                    type="number"
                    value={w.homePrice}
                    onChange={(e) => updatePrice(w.id, "homePrice", Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-center text-sm text-foreground focus:ring-1 focus:ring-ring"
                  />
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">د.ج</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground">🏢 التوصيل للمكتب</label>
                <div className="relative">
                  <input
                    type="number"
                    value={w.deskPrice}
                    onChange={(e) => updatePrice(w.id, "deskPrice", Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-center text-sm text-foreground focus:ring-1 focus:ring-ring"
                  />
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">د.ج</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shipping;
