import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useStoreSettings<T>(key: string, defaultValue: T) {
  const qc = useQueryClient();

  const { data: serverSettings = defaultValue, isLoading: loading } = useQuery({
    queryKey: ["store_settings", key],
    queryFn: async () => {
      try {
        const data = await api.get(`/settings/${key}`);
        if (data && data.value) {
          return { ...defaultValue, ...(data.value as Partial<T>) };
        }
      } catch (err) {
        console.error(`Failed to fetch ${key} settings:`, err);
      }
      return defaultValue;
    },
  });

  const [settings, setLocalSettings] = useState<T>(defaultValue);
  const [dirty, setDirty] = useState(false);
  const hydratedRef = useRef(false);
  const settingsRef = useRef<T>(defaultValue);

  useEffect(() => {
    // Keep a local draft for forms so tab focus/refetches don't wipe unsaved edits.
    if (!hydratedRef.current || !dirty) {
      setLocalSettings(serverSettings);
      settingsRef.current = serverSettings;
      hydratedRef.current = true;
    }
  }, [serverSettings, dirty]);

  const { mutateAsync: persistSettings, isPending: saving } = useMutation({
    mutationFn: async (newSettings: T) => {
      const response = await api.put(`/settings/${key}`, { value: newSettings });
      if (response && typeof response === "object" && "value" in response) {
        return response.value as T;
      }
      return newSettings;
    },
    onSuccess: (newSettings) => {
      qc.setQueryData(["store_settings", key], newSettings);
      settingsRef.current = newSettings;
      setLocalSettings(newSettings);
      setDirty(false);
      toast.success("تم حفظ الإعدادات");
    },
    onError: () => {
      toast.error("فشل حفظ الإعدادات");
    }
  });

  const setSettings = (val: T | ((prev: T) => T)) => {
    setDirty(true);
    const next = typeof val === "function" ? (val as (prev: T) => T)(settingsRef.current) : val;
    settingsRef.current = next;
    setLocalSettings(next);
  };

  const saveSettings = async (nextSettings?: T) => {
    const valueToSave = nextSettings ?? settingsRef.current;
    settingsRef.current = valueToSave;
    return persistSettings(valueToSave);
  };

  return { settings, setSettings, loading, saving, saveSettings };
}
