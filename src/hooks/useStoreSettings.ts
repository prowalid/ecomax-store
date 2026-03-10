import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useStoreSettings<T>(key: string, defaultValue: T) {
  const cacheKey = `store_settings_${key}`;

  const getInitialSettings = (): T => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return { ...defaultValue, ...JSON.parse(cached) };
    } catch { /* ignore */ }
    return defaultValue;
  };

  const getInitialLoading = () => {
    return !localStorage.getItem(cacheKey);
  };

  const [settings, setSettings] = useState<T>(getInitialSettings);
  const [loading, setLoading] = useState(getInitialLoading);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get(`/settings/${key}`);
      if (data && data.value) {
        const mergedSettings = { ...defaultValue, ...(data.value as any) };
        setSettings(mergedSettings);
        localStorage.setItem(cacheKey, JSON.stringify(data.value));
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
      await api.put(`/settings/${key}`, { value: newSettings });
      setSettings(newSettings);
      localStorage.setItem(cacheKey, JSON.stringify(newSettings));
      toast.success("تم حفظ الإعدادات");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return { settings, setSettings, loading, saving, saveSettings };
}
