import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";

import { colorFields } from "./types";

interface AppearanceColorEditorProps {
  settings: AppearanceSettings;
  onUpdate: <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => void;
}

export default function AppearanceColorEditor({ settings, onUpdate }: AppearanceColorEditorProps) {
  const groups = [...new Set(colorFields.map((field) => field.group))];

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-6 xl:row-span-3">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
          <span className="text-purple-600 text-sm font-bold">#</span>
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-sidebar-heading">الألوان</h2>
          <p className="text-[12px] font-medium text-slate-400 mt-1">اضبط أجزاء الواجهة الأساسية بوضوح، ثم راقب النتيجة في المعاينة.</p>
        </div>
      </div>
      <div className="space-y-6 max-h-[850px] overflow-y-auto pr-3 scrollbar-thin">
        {groups.map((group) => (
          <div key={group} className="bg-slate-50 p-4 rounded-[16px] border border-slate-100">
            <p className="text-[12px] font-bold text-primary mb-3">{group}</p>
            <div className="grid gap-3">
              {colorFields
                .filter((field) => field.group === group)
                .map((field) => (
                  <div
                    key={field.key}
                    className="bg-white px-3 py-3 rounded-[12px] border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[13px] font-semibold text-sidebar-heading">{field.label}</label>
                      <input
                        type="text"
                        value={settings[field.key] || "#000000"}
                        onChange={(e) => onUpdate(field.key, e.target.value)}
                        className="w-24 h-9 px-2 rounded-[8px] border border-slate-200 bg-slate-50 text-[13px] font-mono text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700"
                        dir="ltr"
                      />
                      <div className="relative w-9 h-9 rounded-[8px] overflow-hidden border border-slate-200 shrink-0 shadow-sm cursor-pointer">
                        <input
                          type="color"
                          value={settings[field.key] || "#000000"}
                          onChange={(e) => onUpdate(field.key, e.target.value)}
                          className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-3 h-2.5 rounded-full" style={{ backgroundColor: settings[field.key] || "#000000" }} />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
