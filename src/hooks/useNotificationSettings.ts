import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface NotificationSettings {
  enabled_notifications: Record<string, boolean>;
  admin_phone: string;
  api_configured: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled_notifications: {
    order_confirmed: true,
    order_shipped: true,
    order_delivered: false,
    new_order_admin: true,
  },
  admin_phone: "",
  api_configured: false,
};

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get('/settings/whatsapp_notifications');

      if (data && data.value) {
        const val = data.value as any;
        setSettings({
          enabled_notifications: val.enabled_notifications || DEFAULT_SETTINGS.enabled_notifications,
          admin_phone: val.admin_phone || "",
          api_configured: val.api_configured || false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch notification settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: NotificationSettings) => {
    setSaving(true);
    try {
      await api.put('/settings/whatsapp_notifications', { value: newSettings });

      setSettings(newSettings);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (err: any) {
      toast.error("فشل حفظ الإعدادات");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      enabled_notifications: {
        ...prev.enabled_notifications,
        [key]: !prev.enabled_notifications[key],
      },
    }));
  };

  const setAdminPhone = (phone: string) => {
    setSettings((prev) => ({ ...prev, admin_phone: phone }));
  };

  const markApiConfigured = (configured: boolean) => {
    setSettings((prev) => ({ ...prev, api_configured: configured }));
  };

  return {
    settings,
    loading,
    saving,
    saveSettings,
    toggleNotification,
    setAdminPhone,
    markApiConfigured,
  };
}
