import { useState } from "react";
import { Plus, FolderOpen, GripVertical, Loader2, Trash2, Image, Upload } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AdminDataState from "@/components/admin/AdminDataState";
import AdminActionStatus from "@/components/admin/AdminActionStatus";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const sanitizeCategorySlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [actionMessage, setActionMessage] = useState("");

  const setStatus = (state: "idle" | "pending" | "success" | "error", message = "") => {
    setActionState(state);
    setActionMessage(message);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = sanitizeCategorySlug(newName);
    setStatus("pending", "جاري إنشاء التصنيف...");
    createCategory.mutate(
      { name: newName.trim(), slug: slug || undefined, sort_order: categories.length + 1, suppressToast: true },
      {
        onSuccess: () => {
          setNewName("");
          setShowAdd(false);
          setStatus("success", "تم إنشاء التصنيف بنجاح");
        },
        onError: (error) => {
          setStatus("error", error instanceof Error ? error.message : "فشل إنشاء التصنيف");
        },
      }
    );
  };

  const handleImageUpload = async (catId: string, file: File) => {
    setUploadingImageId(catId);
    setStatus("pending", "جاري رفع صورة التصنيف...");
    try {
      const data = (await api.upload('/upload', file)) as { url: string };
      const currentCategory = categories.find((category) => category.id === catId);
      updateCategory.mutate({
        id: catId,
        image_url: data.url,
        version: currentCategory?.version,
        suppressToast: true,
      }, {
        onSuccess: () => {
          setStatus("success", "تم تحديث صورة التصنيف");
        },
        onError: (error) => {
          setStatus("error", error instanceof Error ? error.message : "فشل تحديث صورة التصنيف");
        },
      });
      setEditingImage(null);
    } catch {
      setStatus("error", "فشل رفع الصورة");
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingImageId(null);
    }
  };
  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل التصنيفات" description="يتم تجهيز قائمة التصنيفات وصورها الحالية." />;
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="التصنيفات"
        description="نظّم التصنيفات وارفع صورة مناسبة لكل تصنيف حتى يظهر بشكل احترافي."
        meta={`${categories.length} تصنيف`}
        actions={
          <button
            onClick={() => setShowAdd(!showAdd)}
            data-testid="categories-add-button"
            className="h-10 px-5 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة تصنيف
          </button>
        }
      />

      {showAdd && (
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-5 flex items-center gap-3 animate-slide-in">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم التصنيف..."
            data-testid="category-name-input"
            className="flex-1 h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={createCategory.isPending}
            data-testid="category-save-button"
            className="h-11 px-6 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {createCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
          </button>
        </div>
      )}

      <AdminActionStatus state={actionState} message={actionMessage} />

      <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4 text-[13px] text-slate-600 font-medium">
        المقاس المقترح للصور: <span className="font-black text-slate-900">1200 × 1200</span> بكسل.
        استخدم صورة مربعة واضحة وخفيفة.
      </div>

      {categories.length === 0 ? (
        <AdminDataState
          type="empty"
          title="لا توجد تصنيفات بعد"
          description="ابدأ بإنشاء أول تصنيف حتى تنظّم عرض المنتجات داخل المتجر بشكل أوضح."
          actionLabel="إضافة تصنيف"
          onAction={() => setShowAdd(true)}
        />
      ) : (
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden animate-slide-in">
        <div className="divide-y divide-slate-50">
          {categories.map((cat) => (
            <div key={cat.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4" data-testid={`category-row-${cat.id}`}>
                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab hover:text-primary transition-colors" />
                
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-16 h-16 rounded-[18px] object-cover border border-slate-100 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-[18px] bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 shadow-sm">
                    <FolderOpen className="w-6 h-6 text-slate-400" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-[15px] font-bold text-sidebar-heading">{cat.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cat.image_url ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {cat.image_url ? "توجد صورة" : "بدون صورة"}
                    </span>
                    <span className="text-[11px] text-slate-400">الترتيب: {cat.sort_order}</span>
                  </div>
                  {cat.image_url ? (
                    <p className="mt-1 text-[11px] font-medium text-slate-400 truncate max-w-[320px]" dir="ltr">{cat.image_url}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400">لن يظهر غلاف لهذا التصنيف في المتجر حتى ترفع صورة له.</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingImage(editingImage === cat.id ? null : cat.id)}
                    data-testid={`category-edit-image-${cat.id}`}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                    title="تغيير الصورة"
                  >
                    <Image className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setStatus("pending", `جاري حذف التصنيف "${cat.name}"...`);
                      deleteCategory.mutate(
                        { id: cat.id, suppressToast: true },
                        {
                          onSuccess: () => setStatus("success", `تم حذف التصنيف "${cat.name}"`),
                          onError: (error) => setStatus("error", error instanceof Error ? error.message : "فشل حذف التصنيف"),
                        }
                      );
                    }}
                    data-testid={`category-delete-${cat.id}`}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingImage === cat.id && (
                <div className="mt-3 mr-8 flex items-center gap-2 animate-slide-in">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`upload-${cat.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(cat.id, file);
                      if (e.target) e.target.value = '';
                    }}
                  />
                  <div>
                    <button
                       onClick={() => document.getElementById(`upload-${cat.id}`)?.click()}
                       disabled={uploadingImageId === cat.id}
                       className="h-8 px-3 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 disabled:opacity-50"
                    >
                       {uploadingImageId === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                       رفع صورة للتصنيف
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-1">المقاس المقترح: 1200×1200 بكسل</p>
                  </div>
                  {cat.image_url && (
                    <button
                      onClick={() => {
                        setStatus("pending", "جاري إزالة صورة التصنيف...");
                        updateCategory.mutate(
                          { id: cat.id, image_url: null, version: cat.version, suppressToast: true },
                          {
                            onSuccess: () => setStatus("success", "تمت إزالة صورة التصنيف"),
                            onError: (error) => setStatus("error", error instanceof Error ? error.message : "فشل إزالة صورة التصنيف"),
                          }
                        );
                        setEditingImage(null);
                      }}
                      className="h-8 px-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default Categories;
