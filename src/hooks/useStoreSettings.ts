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

  useEffect(() => {
    // Keep a local draft for forms so tab focus/refetches don't wipe unsaved edits.
    if (!hydratedRef.current || !dirty) {
      setLocalSettings(serverSettings);
      hydratedRef.current = true;
    }
  }, [serverSettings, dirty]);

  const { mutateAsync: saveSettings, isPending: saving } = useMutation({
    mutationFn: async (newSettings: T) => {
      await api.put(`/settings/${key}`, { value: newSettings });
      return newSettings;
    },
    onSuccess: (newSettings) => {
      qc.setQueryData(["store_settings", key], newSettings);
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
    setLocalSettings((prev) => (typeof val === "function" ? (val as (prev: T) => T)(prev) : val));
  };

  return { settings, setSettings, loading, saving, saveSettings };
}
