import { Loader2, Link as LinkIcon, X } from "lucide-react";

import type { AppearanceSlide } from "@/hooks/useAppearanceSettings";

interface AppearanceSlidesSectionProps {
  title: string;
  description?: string;
  helperText?: string;
  icon: React.ReactNode;
  buttonLabel: string;
  uploading?: boolean;
  slides: AppearanceSlide[];
  previewHeightClass: string;
  columnsClass: string;
  emptyLabel: string;
  onUploadClick: () => void;
  onRemove: (index: number) => void;
  onLinkChange: (index: number, href: string) => void;
}

export default function AppearanceSlidesSection({
  title,
  description,
  helperText,
  icon,
  buttonLabel,
  uploading = false,
  slides,
  previewHeightClass,
  columnsClass,
  emptyLabel,
  onUploadClick,
  onRemove,
  onLinkChange,
}: AppearanceSlidesSectionProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 sm:p-7 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="text-[15px] font-bold text-sidebar-heading">{title}</h2>
            {description && <p className="text-[11px] font-medium text-slate-400 mt-0.5">{description}</p>}
            {helperText && <p className="text-[11px] font-medium text-slate-500 mt-2 max-w-xl">{helperText}</p>}
          </div>
        </div>
        <button
          onClick={onUploadClick}
          disabled={uploading}
          className="h-10 px-4 rounded-[12px] bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-base leading-none">+</span>}
          {buttonLabel}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${columnsClass} gap-4`}>
        {slides.map((slide, idx) => (
          <div key={idx} className="relative group rounded-[16px] overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
            <img src={slide.image_url} alt={`${title} ${idx + 1}`} className={`w-full ${previewHeightClass} object-cover`} />
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-2 left-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {idx + 1}
            </span>
            <div className="border-t border-slate-200 bg-white p-3">
              <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <LinkIcon className="h-3.5 w-3.5" />
                رابط الشريحة
              </label>
              <input
                type="text"
                value={slide.href || ""}
                onChange={(e) => onLinkChange(idx, e.target.value)}
                placeholder="/product/slug أو /page/about"
                className="w-full h-10 rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                dir="ltr"
              />
            </div>
          </div>
        ))}
        {uploading && (
          <div className="rounded-[16px] border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        )}
      </div>

      {slides.length === 0 && !uploading && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-[16px] bg-slate-50">
          <p className="text-[13px] font-semibold text-slate-400">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}
