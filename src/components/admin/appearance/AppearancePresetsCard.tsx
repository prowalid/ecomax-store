import { Check, Palette } from "lucide-react";

import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";

import { appearancePresets } from "./types";

interface AppearancePresetsCardProps {
  settings: AppearanceSettings;
  onApplyPreset: (presetId: string) => void;
}

export default function AppearancePresetsCard({ settings, onApplyPreset }: AppearancePresetsCardProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Palette className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-sidebar-heading">قوالب جاهزة</h2>
          <p className="text-[12px] font-medium text-slate-400 mt-1">اختر هوية لونية جاهزة ثم عدّلها إذا أردت.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {appearancePresets.map((preset) => {
          const isActive = settings.accent_color === preset.colors.accent_color
            && settings.header_bg === preset.colors.header_bg
            && settings.footer_bg === preset.colors.footer_bg;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className={`rounded-[18px] border p-4 text-right transition-all hover:-translate-y-0.5 ${
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-bold text-sidebar-heading">{preset.name}</div>
                  <p className="mt-1 text-[12px] leading-5 text-slate-500">{preset.description}</p>
                </div>
                {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {Object.values(preset.colors).slice(0, 5).map((color) => (
                  <span
                    key={color}
                    className="h-7 w-7 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
