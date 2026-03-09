import { useCallback } from "react";
import { useMarketingSettings } from "@/hooks/useMarketingSettings";
import { trackEvent, CAPIUserData } from "@/lib/facebook-pixel";

/**
 * Hook that checks enabled_events before firing Pixel + CAPI events.
 */
export function useTracking() {
  const { settings } = useMarketingSettings();

  const track = useCallback(
    (eventName: string, userData: CAPIUserData = {}, customData: Record<string, any> = {}) => {
      // Only fire if pixel is configured and this event is enabled
      if (!settings.pixel_id || !settings.pixel_configured) return;
      if (settings.enabled_events[eventName] === false) return;

      trackEvent(eventName, userData, customData);
    },
    [settings]
  );

  return { track };
}
