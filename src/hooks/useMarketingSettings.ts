import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MarketingSettings {
  pixel_id: string;
  pixel_configured: boolean;
  webhook_url: string;
  enabled_events: Record<string, boolean>;
}

const DEFAULT: MarketingSettings = {
  pixel_id: "",
  pixel_configured: false,
  webhook_url: "",
  enabled_events: {
    PageView: true,
    ViewContent: true,
    AddToCart: true,
    InitiateCheckout: true,
    Purchase: true,
    Lead: true,
  },
};

export function useMarketingSettings() {
  const [settings, setSettings] = useState<MarketingSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "marketing")
        .single();
      if (data && !error) {
        const val = data.value as any;
        setSettings({
          pixel_configured: val.pixel_configured ?? false,
          webhook_url: val.webhook_url ?? "",
          enabled_events: val.enabled_events ?? DEFAULT.enabled_events,
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
      const { error } = await supabase
        .from("store_settings")
        .update({ value: newSettings as any, updated_at: new Date().toISOString() })
        .eq("key", "marketing");
      if (error) throw error;
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
