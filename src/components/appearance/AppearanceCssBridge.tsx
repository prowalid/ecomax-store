import { useLayoutEffect } from "react";

import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { applyAppearanceCssVars } from "@/lib/appearanceCache";

export default function AppearanceCssBridge() {
  const { settings } = useAppearanceSettings();

  useLayoutEffect(() => {
    applyAppearanceCssVars(settings);
  }, [settings]);

  return null;
}
