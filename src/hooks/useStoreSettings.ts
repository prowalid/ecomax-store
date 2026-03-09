import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useStoreSettings<T>(key: string, defaultValue: T) {
  const [settings, setSettings] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (data && !error) {
        setSettings({ ...defaultValue, ...(data.value as any) });
      }
    } catch (err) {
      console.error(`Failed to fetch ${key} settings:`, err);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async (newSettings: T) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ key, value: newSettings as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      setSettings(newSettings);
      toast.success("تم حفظ الإعدادات");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return { settings, setSettings, loading, saving, saveSettings };
}
