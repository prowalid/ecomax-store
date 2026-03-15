import { Image, Loader2, Plus, Upload, X } from "lucide-react";
import { useRef } from "react";

interface AppearanceUploadCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  buttonLabel: string;
  emptyLabel: string;
  imageUrl?: string;
  previewHeightClass?: string;
  multiple?: boolean;
  uploading?: boolean;
  onUpload: (files: FileList) => void;
  onClear?: () => void;
}

export default function AppearanceUploadCard({
  title,
  description,
  icon,
  buttonLabel,
  emptyLabel,
  imageUrl,
  previewHeightClass = "h-32",
  multiple = false,
  uploading = false,
  onUpload,
  onClear,
}: AppearanceUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 sm:p-7 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="text-[15px] font-bold text-sidebar-heading">{title}</h2>
            {description && <p className="text-[11px] font-medium text-slate-400 mt-0.5">{description}</p>}
          </div>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                onUpload(e.target.files);
              }
              e.target.value = "";
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-10 px-4 rounded-[12px] bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : multiple ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {buttonLabel}
          </button>
        </div>
      </div>

      {imageUrl ? (
        <div className={`relative group rounded-[16px] overflow-hidden border border-slate-200 shadow-sm bg-slate-50 ${previewHeightClass}`}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          {onClear && (
            <button
              onClick={onClear}
              className="absolute top-2 left-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`w-full ${previewHeightClass} bg-slate-50 rounded-[16px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center`}
        >
          <Image className="w-6 h-6 text-slate-300 mb-2" />
          <p className="text-[13px] font-semibold text-slate-400">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}
