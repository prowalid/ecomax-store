import { useState } from "react";
import { Plus, FileText, Trash2, Loader2, Edit2, X, Save, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePages, useCreatePage, useUpdatePage, useDeletePage, type Page } from "@/hooks/usePages";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import RichTextEditor from "@/components/admin/RichTextEditor";

const sanitizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const Pages = () => {
  const { data: pages = [], isLoading, isError, error, refetch, isFetching } = usePages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  // Editor state
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [pageDraftDirty, setPageDraftDirty] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const slug = sanitizeSlug(newSlug) || sanitizeSlug(newTitle);
    if (!slug) {
      toast.error("أدخل رابط الصفحة بالأحرف الإنجليزية الصغيرة مثل: about-us");
      return;
    }

    createPage.mutate(
      { title: newTitle.trim(), slug, show_in: "none", published: false },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewSlug("");
          setShowAdd(false);
        },
      }
    );
  };

  const openEditor = (page: Page) => {
    setEditingPage(page);
    setEditTitle(page.title);
    setEditSlug(page.slug);
    setEditContent(page.content || "");
    setEditPublished(page.published);
    setPageDraftDirty(false);
  };

  const closeEditor = () => {
    if (updatePage.isPending) {
      return;
    }

    if (pageDraftDirty && !window.confirm("لديك تعديلات غير محفوظة على الصفحة. هل تريد إغلاق المحرر؟")) {
      return;
    }

    setEditingPage(null);
    setPageDraftDirty(false);
  };

  const saveEditor = () => {
    if (!editingPage || !editTitle.trim()) return;
    const slug = sanitizeSlug(editSlug) || sanitizeSlug(editTitle);
    if (!slug) {
      toast.error("أدخل رابطاً صالحاً للصفحة قبل الحفظ");
      return;
    }

    updatePage.mutate(
      {
        id: editingPage.id,
        title: editTitle.trim(),
        slug,
        content: editContent,
        show_in: editPublished ? "footer" : "none",
        published: editPublished,
        version: editingPage.version,
      },
      {
        onSuccess: () => {
          setPageDraftDirty(false);
          setEditingPage(null);
        },
      }
    );
  };

  const togglePublish = (id: string, current: boolean) => {
    const page = pages.find((entry) => entry.id === id);
    updatePage.mutate({
      id,
      published: !current,
      show_in: !current ? "footer" : "none",
      version: page?.version,
    });
  };

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل الصفحات" description="يتم استرجاع صفحات المتجر وربطها بمناطق العرض." />;
  }

  if (isError) {
    return (
      <AdminDataState
        type="error"
        title="تعذر تحميل الصفحات"
        description={error instanceof Error ? error.message : "تعذر تحميل الصفحات"}
        actionLabel="إعادة المحاولة"
        actionDisabled={isFetching}
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="صفحات المتجر"
        description="الصفحة المنشورة تظهر تلقائيًا في الفوتر فقط، وغير المنشورة لا تظهر في أي مكان."
        meta={`${pages.length} صفحة`}
        actions={(
          <button
            onClick={() => setShowAdd(!showAdd)}
            data-testid="pages-add-button"
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-button transition-opacity hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            إنشاء صفحة
          </button>
        )}
      />

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-4 animate-slide-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="عنوان الصفحة..."
              data-testid="page-title-input"
              className="h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="slug (اختياري)"
              data-testid="page-slug-input"
              className="h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              dir="ltr"
            />
          </div>
          <div className="rounded-[16px] border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
            الصفحة الجديدة تُنشأ <span className="font-bold text-slate-900">غير منشورة</span> أولًا.
            عند نشرها ستظهر تلقائيًا في <span className="font-bold text-slate-900">الفوتر فقط</span>.
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowAdd(false); setNewTitle(""); setNewSlug(""); }}
              className="h-10 px-5 rounded-[12px] border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAdd}
              disabled={createPage.isPending || !newTitle.trim()}
              data-testid="page-create-button"
              className="h-10 px-6 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {createPage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm animate-slide-in">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-right" dir="rtl">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/30">
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الصفحة</th>
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans hidden md:table-cell">المسار</th>
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الحالة</th>
              <th className="w-28 px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} data-testid={`page-row-${page.id}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="text-[14px] font-bold text-sidebar-heading group-hover:text-primary transition-colors">{page.title}</span>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <code className="text-[13px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100" dir="ltr">
                    /page/{page.slug}
                  </code>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => togglePublish(page.id, page.published)}>
                    <Badge variant={page.published ? "success" : "muted"} className="cursor-pointer rounded-full px-3 py-1 font-bold shadow-none border-none text-[11px]">
                      {page.published ? "منشورة - تظهر في الفوتر" : "غير منشورة"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditor(page)}
                      data-testid={`page-edit-${page.id}`}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(page.id)}
                      data-testid={`page-delete-${page.id}`}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {pages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            لا توجد صفحات بعد — أنشئ أول صفحة
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 p-7 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-black text-sidebar-heading">حذف الصفحة</h3>
            <p className="text-[13px] text-slate-500 font-medium">هل أنت متأكد من حذف هذه الصفحة؟</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="h-10 px-5 rounded-[12px] border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => deletePage.mutate({ id: deleteConfirm }, { onSuccess: () => setDeleteConfirm(null) })}
                disabled={deletePage.isPending}
                data-testid="page-delete-confirm"
                className="h-10 px-5 rounded-[12px] bg-destructive text-destructive-foreground text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deletePage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Editor Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div data-testid="page-editor-modal" className="bg-white rounded-[24px] shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-[24px]">
              <h2 className="text-[16px] font-black text-sidebar-heading">تعديل الصفحة</h2>
              <div className="mr-auto ml-3 text-[11px] font-bold text-slate-400">
                {updatePage.isPending ? "جاري حفظ التعديلات..." : pageDraftDirty ? "تعديلات غير محفوظة" : "كل التغييرات محفوظة"}
              </div>
              <button onClick={closeEditor} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-500">العنوان</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setPageDraftDirty(true);
                  }}
                  data-testid="page-edit-title-input"
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-500">المسار (Slug)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => {
                    setEditSlug(e.target.value);
                    setPageDraftDirty(true);
                  }}
                  data-testid="page-edit-slug-input"
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2 rounded-[16px] border border-slate-100 bg-slate-50 px-4 py-3">
                <label className="text-[13px] font-semibold text-slate-500">مكان الظهور</label>
                <p className="text-[14px] font-bold text-sidebar-heading">الفوتر فقط</p>
                <p className="text-[12px] text-slate-500">هذه الصفحات تظهر في الفوتر عند النشر فقط، وتختفي من كل الأماكن عند إلغاء النشر.</p>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditPublished(!editPublished);
                    setPageDraftDirty(true);
                  }}
                  className={`flex items-center gap-2 text-[13px] font-bold px-4 py-2.5 rounded-[12px] border-2 transition-all ${
                    editPublished
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-100 text-slate-400 hover:border-primary/40"
                  }`}
                >
                  {editPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {editPublished ? "منشورة - تظهر في الفوتر" : "غير منشورة"}
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-500">محتوى الصفحة</label>
                <RichTextEditor
                  value={editContent}
                  onChange={(value) => {
                    setEditContent(value);
                    setPageDraftDirty(true);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-[24px]">
              <button
                onClick={closeEditor}
                className="h-10 px-5 rounded-[12px] border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveEditor}
                disabled={updatePage.isPending || !editTitle.trim()}
                data-testid="page-save-button"
                className="h-10 px-6 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-bold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {updatePage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> حفظ</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
