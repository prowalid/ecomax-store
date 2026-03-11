import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface MarketingSettings {
  pixel_id: string;
  capi_token: string;
  pixel_configured: boolean;
  webhook_url: string;
  webhook_secret: string;
  enabled_events: Record<string, boolean>;
}

const DEFAULT: MarketingSettings = {
  pixel_id: "",
  capi_token: "",
  pixel_configured: false,
  webhook_url: "",
  webhook_secret: "",
  enabled_events: {
    PageView: true,
    ViewContent: true,
    AddToCart: true,
    InitiateCheckout: true,
    Purchase: true,
    Lead: true,
  },
};

type MarketingSettingsPayload = Partial<MarketingSettings>;

export function useMarketingSettings() {
  const [settings, setSettings] = useState<MarketingSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get('/settings/marketing');
      if (data && data.value) {
        const val = data.value as MarketingSettingsPayload;
        setSettings({
          pixel_id: (val.pixel_id as string | undefined) ?? (val.facebook_pixel_id as string | undefined) ?? "",
          capi_token: (val.capi_token as string | undefined) ?? (val.access_token as string | undefined) ?? "",
          pixel_configured: val.pixel_configured ?? false,
          webhook_url: val.webhook_url ?? "",
          webhook_secret: (val.webhook_secret as string | undefined) ?? "",
          enabled_events: { ...DEFAULT.enabled_events, ...(val.enabled_events ?? {}) },
        });
      }
    } catch (err) {
      console.error("Failed to fetch marketing settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async (newSettings: MarketingSettings) => {
    setSaving(true);
    try {
      await api.put('/settings/marketing', { value: newSettings });
      setSettings(newSettings);
      toast.success("تم حفظ إعدادات التسويق");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return { settings, setSettings, loading, saving, saveSettings };
}
