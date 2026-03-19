import { useState } from "react";
import { Plus, FolderOpen, GripVertical, Loader2, Trash2, Image, Upload } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = sanitizeCategorySlug(newName);
    createCategory.mutate(
      { name: newName.trim(), slug: slug || undefined, sort_order: categories.length + 1 },
      { onSuccess: () => { setNewName(""); setShowAdd(false); } }
    );
  };

  const handleImageUpload = async (catId: string, file: File) => {
    setUploadingImageId(catId);
    try {
      const data = (await api.upload('/upload', file)) as { url: string };
      const currentCategory = categories.find((category) => category.id === catId);
      updateCategory.mutate({
        id: catId,
        image_url: data.url,
        version: currentCategory?.version,
      });
      setEditingImage(null);
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingImageId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">التصنيفات</h1>
          <p className="mt-1 text-sm text-slate-500">
            نظّم التصنيفات وارفع صورة مناسبة لكل تصنيف حتى يظهر بشكل احترافي داخل واجهة المتجر.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          data-testid="categories-add-button"
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg shadow-card border border-border p-4 flex items-center gap-3 animate-slide-in">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم التصنيف..."
            data-testid="category-name-input"
            className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={createCategory.isPending}
            data-testid="category-save-button"
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {createCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
        المقاس المقترح للصور: <span className="font-black text-slate-900">1200 × 1200</span> بكسل.
        استخدم صورة مربعة واضحة وخفيفة لتظهر بشكل احترافي في المتجر.
      </div>

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
                    onClick={() => deleteCategory.mutate(cat.id)}
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
                        updateCategory.mutate({ id: cat.id, image_url: null, version: cat.version });
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
          {categories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              لا توجد تصنيفات بعد
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
