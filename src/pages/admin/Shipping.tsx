import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Save, Search, Truck } from "lucide-react";

import AdminIntegrationStatusNote from "@/components/admin/AdminIntegrationStatusNote";
import AdminSecureField from "@/components/admin/AdminSecureField";
import AdminSaveStatusBadge from "@/components/admin/AdminSaveStatusBadge";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ALGERIA_WILAYAS, normalizeAlgeriaLocationName } from "@/data/algeriaWilayas";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

interface CourierPartnerSettings {
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
  yalidine: CourierPartnerSettings;
  guepex: CourierPartnerSettings;
}

type ShippingProviderKey =
  | "manual"
  | "yalidine"
  | "guepex"
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
    description: "إدارة الشحن يدوياً دون ربط آلي. مناسب للطلبات التي يتم توصيلها عبر مندوبين خاصين بك.",
  },
  {
    key: "yalidine",
    label: "Yalidine",
    status: "live",
    description: "اربط متجرك مباشرة بحسابك في شركة Yalidine لرفع الطلبات وتوليد رقم التتبع بنقرة واحدة.",
  },
  {
    key: "guepex",
    label: "Guepex",
    status: "live",
    description: "اربط متجرك مباشرة بحسابك في شركة Guepex لرفع الطلبات وتوليد رقم التتبع بنقرة واحدة.",
  },
  {
    key: "zr_express",
    label: "ZR Express",
    status: "planned",
    description: "قريباً. سيتم توفير الربط المباشر مع ZR Express لتسهيل إرسال وتتبع طلباتك.",
  },
  {
    key: "mdm_express",
    label: "MDM Express",
    status: "planned",
    description: "قريباً. نعمل على توفير الربط الآلي لترحيل طلباتك إلى MDM Express بسهولة.",
  },
  {
    key: "near_delivery",
    label: "Near Delivery",
    status: "planned",
    description: "قريباً. التكامل المباشر مع شبكة Near Delivery سيكون متاحاً في التحديثات القادمة.",
  },
  {
    key: "maystro",
    label: "Maystro",
    status: "planned",
    description: "قريباً. سيتاح الربط المباشر لإرسال الطلبات وتتبعها عبر منصة Maystro لتسهيل عملك.",
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
  guepex: {
    enabled: false,
    api_base_url: "https://api.guepex.app/v1",
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
  const { settings, loading, saving, saveSettings, lastSavedAt } = useStoreSettings<ShippingSettings>("shipping", defaultShippingSettings);
  const [wilayas, setWilayas] = useState<WilayaShipping[]>(() =>
    ALGERIA_WILAYAS.map((w) => ({ id: w.id, name: w.name, homePrice: w.priceHome, deskPrice: w.priceDesk }))
  );
  const [providerSettings, setProviderSettings] = useState(defaultShippingSettings.provider);
  const [yalidineSettings, setYalidineSettings] = useState<CourierPartnerSettings>(defaultShippingSettings.yalidine);
  const [guepexSettings, setGuepexSettings] = useState<CourierPartnerSettings>(defaultShippingSettings.guepex);
  const [yalidineSecretsDraft, setYalidineSecretsDraft] = useState({ api_id: "", api_token: "" });
  const [guepexSecretsDraft, setGuepexSecretsDraft] = useState({ api_id: "", api_token: "" });
  const [search, setSearch] = useState("");
  const [providerPanelOpen, setProviderPanelOpen] = useState(true);

  useEffect(() => {
    const savedMap = new Map((settings.wilayas || []).map((w) => [normalizeAlgeriaLocationName(w.name), w]));
    setWilayas(
      ALGERIA_WILAYAS.map((w) => {
        const saved = savedMap.get(normalizeAlgeriaLocationName(w.name));
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

    if (settings.yalidine) {
      setYalidineSettings(settings.yalidine);
      setYalidineSecretsDraft({ api_id: "", api_token: "" });
    } else {
      setYalidineSettings(defaultShippingSettings.yalidine);
      setYalidineSecretsDraft({ api_id: "", api_token: "" });
    }
    if (settings.guepex) {
      setGuepexSettings(settings.guepex);
      setGuepexSecretsDraft({ api_id: "", api_token: "" });
    } else {
      setGuepexSettings(defaultShippingSettings.guepex);
      setGuepexSecretsDraft({ api_id: "", api_token: "" });
    }
  }, [settings]);

  const filtered = wilayas.filter(
    (w) =>
      normalizeAlgeriaLocationName(w.name).includes(normalizeAlgeriaLocationName(search))
      || w.id.toString().includes(search)
  );

  const savedYalidineSettings = useMemo(
    () => ({
      ...defaultShippingSettings.yalidine,
      ...(settings.yalidine || {}),
    }),
    [settings.yalidine]
  );

  const savedGuepexSettings = useMemo(
    () => ({
      ...defaultShippingSettings.guepex,
      ...(settings.guepex || {}),
    }),
    [settings.guepex]
  );

  const isYalidineConfigured = useMemo(() => {
    return Boolean(
      savedYalidineSettings.api_id.trim() &&
      savedYalidineSettings.api_token.trim() &&
      savedYalidineSettings.shipper_name.trim() &&
      savedYalidineSettings.shipper_phone.trim() &&
      savedYalidineSettings.from_wilaya_name.trim()
    );
  }, [savedYalidineSettings]);

  const isGuepexConfigured = useMemo(() => {
    return Boolean(
      savedGuepexSettings.api_id.trim() &&
      savedGuepexSettings.api_token.trim() &&
      savedGuepexSettings.shipper_name.trim() &&
      savedGuepexSettings.shipper_phone.trim() &&
      savedGuepexSettings.from_wilaya_name.trim()
    );
  }, [savedGuepexSettings]);

  const activeProviderMeta = SHIPPING_PROVIDERS.find((provider) => provider.key === providerSettings.active_provider)
    || SHIPPING_PROVIDERS[0];

  const shippingDraftDirty = useMemo(() => {
    const nextYalidineSettings = {
      ...yalidineSettings,
      enabled: providerSettings.active_provider === "yalidine",
      api_id: yalidineSecretsDraft.api_id.trim() || savedYalidineSettings.api_id,
      api_token: yalidineSecretsDraft.api_token.trim() || savedYalidineSettings.api_token,
    };
    const nextGuepexSettings = {
      ...guepexSettings,
      enabled: providerSettings.active_provider === "guepex",
      api_id: guepexSecretsDraft.api_id.trim() || savedGuepexSettings.api_id,
      api_token: guepexSecretsDraft.api_token.trim() || savedGuepexSettings.api_token,
    };

    return JSON.stringify({
      wilayas,
      provider: providerSettings,
      yalidine: nextYalidineSettings,
      guepex: nextGuepexSettings,
    }) !== JSON.stringify({
      wilayas: settings.wilayas,
      provider: settings.provider,
      yalidine: savedYalidineSettings,
      guepex: savedGuepexSettings,
    });
  }, [
    guepexSecretsDraft.api_id,
    guepexSecretsDraft.api_token,
    guepexSettings,
    providerSettings,
    savedGuepexSettings,
    savedYalidineSettings,
    settings.provider,
    settings.wilayas,
    wilayas,
    yalidineSecretsDraft.api_id,
    yalidineSecretsDraft.api_token,
    yalidineSettings,
  ]);

  const updatePrice = (id: number, field: "homePrice" | "deskPrice", value: number) => {
    setWilayas((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const updateYalidine = <K extends keyof CourierPartnerSettings>(key: K, value: CourierPartnerSettings[K]) => {
    setYalidineSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateGuepex = <K extends keyof CourierPartnerSettings>(key: K, value: CourierPartnerSettings[K]) => {
    setGuepexSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const nextYalidineSettings = {
      ...yalidineSettings,
      enabled: providerSettings.active_provider === "yalidine",
      api_id: yalidineSecretsDraft.api_id.trim() || savedYalidineSettings.api_id,
      api_token: yalidineSecretsDraft.api_token.trim() || savedYalidineSettings.api_token,
    };
    const nextGuepexSettings = {
      ...guepexSettings,
      enabled: providerSettings.active_provider === "guepex",
      api_id: guepexSecretsDraft.api_id.trim() || savedGuepexSettings.api_id,
      api_token: guepexSecretsDraft.api_token.trim() || savedGuepexSettings.api_token,
    };

    saveSettings({
      wilayas,
      provider: providerSettings,
      yalidine: nextYalidineSettings,
      guepex: nextGuepexSettings,
    });
  };

  const activeCourierProvider = providerSettings.active_provider === "guepex" ? "guepex" : "yalidine";
  const activeCourierLabel = activeCourierProvider === "guepex" ? "Guepex" : "Yalidine";
  const activeCourierSettings = activeCourierProvider === "guepex" ? guepexSettings : yalidineSettings;
  const activeSavedCourierSettings = activeCourierProvider === "guepex" ? savedGuepexSettings : savedYalidineSettings;
  const activeCourierSecretsDraft = activeCourierProvider === "guepex" ? guepexSecretsDraft : yalidineSecretsDraft;
  const updateActiveCourier = activeCourierProvider === "guepex" ? updateGuepex : updateYalidine;
  const setActiveCourierSecretsDraft = activeCourierProvider === "guepex" ? setGuepexSecretsDraft : setYalidineSecretsDraft;
  const isActiveCourierConfigured = activeCourierProvider === "guepex" ? isGuepexConfigured : isYalidineConfigured;

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
          <p className="mt-0.5 text-sm text-muted-foreground">أسعار التوصيل المحلية وربط شركات الشحن المباشرة من نفس الصفحة.</p>
          <div className="mt-2">
            <AdminSaveStatusBadge saving={saving} dirty={shippingDraftDirty} lastSavedAt={lastSavedAt} />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !shippingDraftDirty}
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
                  setGuepexSettings((prev) => ({ ...prev, enabled: nextProvider === "guepex" }));
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
                  setGuepexSettings((prev) => ({ ...prev, enabled: provider.key === "guepex" }));
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

        {providerSettings.active_provider !== "manual" && providerSettings.active_provider !== "yalidine" && providerSettings.active_provider !== "guepex" ? (
          <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50/80 p-5">
            <h3 className="text-sm font-black text-slate-900">{activeProviderMeta.label}</h3>
            <p className="mt-1 text-xs leading-6 text-slate-600">
              هذا المزود ضمن خارطة التوسع القادمة. يمكنك اختياره من الآن للاطلاع على توفره داخل النظام، وسيتم إتاحة الربط التشغيلي الكامل له بمجرد اعتماده.
            </p>
          </div>
        ) : null}

        {(providerSettings.active_provider === "yalidine" || providerSettings.active_provider === "guepex") && providerPanelOpen ? (
          <div className="mt-5 space-y-5">
            <AdminIntegrationStatusNote
              configured={isActiveCourierConfigured}
              configuredTitle={`${activeCourierLabel} جاهز للعمل`}
              configuredDescription={`يمكنك الآن رفع الطلبات من صفحة الطلبات مباشرة إلى ${activeCourierLabel} عند الحاجة.`}
              pendingTitle="أكمل بيانات الربط أولاً"
              pendingDescription="أدخل API ID وAPI Token وبيانات المرسل وولاية الإرسال، ثم احفظ الإعدادات قبل استعمال الرفع المباشر."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <AdminSecureField
                title="API ID"
                description={`المعرّف الذي تمنحه لك ${activeCourierLabel}.`}
                type="text"
                value={activeCourierSecretsDraft.api_id}
                onChange={(e) => setActiveCourierSecretsDraft((prev) => ({ ...prev, api_id: e.target.value }))}
                placeholder={activeSavedCourierSettings.api_id ? "قيمة محفوظة - أدخل API ID جديدًا للاستبدال" : `Your ${activeCourierLabel} API ID`}
                dir="ltr"
                configured={Boolean(activeSavedCourierSettings.api_id.trim())}
                helperText="لن نعرض القيمة المحفوظة هنا. اترك الحقل فارغًا للاحتفاظ بها، أو أدخل قيمة جديدة لاستبدالها."
              />

              <AdminSecureField
                title="API Token"
                description={`التوكن السري لرفع الطلبات إلى ${activeCourierLabel}.`}
                type="password"
                value={activeCourierSecretsDraft.api_token}
                onChange={(e) => setActiveCourierSecretsDraft((prev) => ({ ...prev, api_token: e.target.value }))}
                placeholder={activeSavedCourierSettings.api_token ? "قيمة محفوظة - أدخل Token جديدًا للاستبدال" : `Your ${activeCourierLabel} API Token`}
                dir="ltr"
                configured={Boolean(activeSavedCourierSettings.api_token.trim())}
                helperText="لن نعرض التوكن الحالي. اترك الحقل فارغًا للاحتفاظ به، أو أدخل قيمة جديدة لاستبداله."
              />

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">اسم المرسل</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{`الاسم الذي سيذهب ضمن بيانات الشحنة من متجرك إلى ${activeCourierLabel}.`}</p>
                <input
                  type="text"
                  value={activeCourierSettings.shipper_name}
                  onChange={(e) => updateActiveCourier("shipper_name", e.target.value)}
                  placeholder="اسم المرسل"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-right text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">هاتف المرسل</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{`رقم صاحب المتجر أو الخط المعتمد لتعامل ${activeCourierLabel} مع الشحنات.`}</p>
                <input
                  type="tel"
                  value={activeCourierSettings.shipper_phone}
                  onChange={(e) => updateActiveCourier("shipper_phone", e.target.value)}
                  placeholder="0555123456"
                  dir="ltr"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">ولاية الإرسال</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{`الولاية التي تنطلق منها شحناتك عند إنشاء الطلبات في ${activeCourierLabel}.`}</p>
                <select
                  value={activeCourierSettings.from_wilaya_name}
                  onChange={(e) => updateActiveCourier("from_wilaya_name", e.target.value)}
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
                <p className="mt-1 text-xs leading-5 text-slate-500">{`اختياري. يفيد في تحسين بيانات الشحنة إذا كانت ${activeCourierLabel} تعتمدها في حساب الفرع أو المسار.`}</p>
                <input
                  type="text"
                  value={activeCourierSettings.from_commune_name}
                  onChange={(e) => updateActiveCourier("from_commune_name", e.target.value)}
                  placeholder="مثال: السانيا"
                  className="mt-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-right text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Stop Desk ID</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{`اختياري كقيمة override فقط. إذا تركته فارغًا سيختار النظام تلقائيًا أقرب مركز متاح من ${activeCourierLabel} داخل ولاية الزبون.`}</p>
                <input
                  type="text"
                  value={activeCourierSettings.stopdesk_id}
                  onChange={(e) => updateActiveCourier("stopdesk_id", e.target.value)}
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
                  value={activeCourierSettings.default_product_name}
                  onChange={(e) => updateActiveCourier("default_product_name", e.target.value)}
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
