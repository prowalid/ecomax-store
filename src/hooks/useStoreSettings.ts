import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useStoreSettings<T>(key: string, defaultValue: T) {
  const qc = useQueryClient();

  const { data: settings = defaultValue, isLoading: loading } = useQuery({
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
    staleTime: 5 * 60 * 1000, // Cache settings for 5 minutes
  });

  const { mutateAsync: saveSettings, isPending: saving } = useMutation({
    mutationFn: async (newSettings: T) => {
      await api.put(`/settings/${key}`, { value: newSettings });
      return newSettings;
    },
    onSuccess: (newSettings) => {
      qc.setQueryData(["store_settings", key], newSettings);
      toast.success("تم حفظ الإعدادات");
    },
    onError: () => {
      toast.error("فشل حفظ الإعدادات");
    }
  });

  // Provide setSettings for local optimistic updates if needed
  const setSettings = (val: T) => qc.setQueryData(["store_settings", key], val);

  return { settings, setSettings, loading, saving, saveSettings };
}
