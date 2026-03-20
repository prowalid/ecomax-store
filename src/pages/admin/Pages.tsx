import { useState } from "react";
import { Plus, FileText, Trash2, Loader2, Edit2, X, Save, Eye, EyeOff, Layout, LayoutTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePages, useCreatePage, useUpdatePage, useDeletePage, type Page, type PageShowIn } from "@/hooks/usePages";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import RichTextEditor from "@/components/admin/RichTextEditor";

const SHOW_IN_OPTIONS: { value: PageShowIn; label: string }[] = [
  { value: "none", label: "لا يظهر في القوائم" },
  { value: "header", label: "الهيدر فقط" },
  { value: "footer", label: "الفوتر فقط" },
  { value: "both", label: "الهيدر والفوتر" },
];

const SHOW_IN_LABELS: Record<PageShowIn, string> = {
  none: "لا يظهر",
  header: "الهيدر",
  footer: "الفوتر",
  both: "الهيدر + الفوتر",
};

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
  const [newShowIn, setNewShowIn] = useState<PageShowIn>("none");

  // Editor state
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editShowIn, setEditShowIn] = useState<PageShowIn>("none");
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
      { title: newTitle.trim(), slug, show_in: newShowIn },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewSlug("");
          setNewShowIn("none");
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
    setEditShowIn((page.show_in as PageShowIn) || "none");
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
        show_in: editShowIn,
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
    updatePage.mutate({ id, published: !current, version: page?.version });
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
        description="أنشئ صفحات محتوى واربطها مباشرة بالهيدر أو الفوتر دون سلوكيات منفصلة."
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
        <div className="bg-card rounded-lg shadow-card border border-border p-4 space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="عنوان الصفحة..."
              data-testid="page-title-input"
              className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="slug (اختياري)"
              data-testid="page-slug-input"
              className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              dir="ltr"
            />
            <select
              value={newShowIn}
              onChange={(e) => setNewShowIn(e.target.value as PageShowIn)}
              className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
            >
              {SHOW_IN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowAdd(false); setNewTitle(""); setNewSlug(""); }}
              className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAdd}
              disabled={createPage.isPending || !newTitle.trim()}
              data-testid="page-create-button"
              className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
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
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">المكان</th>
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
                  <div className="flex items-center gap-1">
                    {(page.show_in === "header" || page.show_in === "both") && (
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none shadow-none">
                        <Layout className="w-3 h-3 ml-1" />
                        هيدر
                      </Badge>
                    )}
                    {(page.show_in === "footer" || page.show_in === "both") && (
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none shadow-none">
                        <LayoutTemplate className="w-3 h-3 ml-1" />
                        فوتر
                      </Badge>
                    )}
                    {page.show_in === "none" && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => togglePublish(page.id, page.published)}>
                    <Badge variant={page.published ? "success" : "muted"} className="cursor-pointer rounded-full px-3 py-1 font-bold shadow-none border-none text-[11px]">
                      {page.published ? "منشورة" : "مسودة"}
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
          <div className="bg-card rounded-xl shadow-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground">حذف الصفحة</h3>
            <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف هذه الصفحة؟</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="h-9 px-4 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => deletePage.mutate({ id: deleteConfirm }, { onSuccess: () => setDeleteConfirm(null) })}
                disabled={deletePage.isPending}
                data-testid="page-delete-confirm"
                className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
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
          <div data-testid="page-editor-modal" className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-base font-semibold text-foreground">تعديل الصفحة</h2>
              <div className="mr-auto ml-3 text-[11px] font-medium text-slate-500">
                {updatePage.isPending ? "جاري حفظ التعديلات..." : pageDraftDirty ? "لديك تعديلات غير محفوظة" : "كل التغييرات الحالية محفوظة"}
              </div>
              <button onClick={closeEditor} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">العنوان</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setPageDraftDirty(true);
                  }}
                  data-testid="page-edit-title-input"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">المسار (Slug)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => {
                    setEditSlug(e.target.value);
                    setPageDraftDirty(true);
                  }}
                  data-testid="page-edit-slug-input"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  dir="ltr"
                />
              </div>

              {/* Show In */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">مكان الظهور في القائمة</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SHOW_IN_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setEditShowIn(o.value);
                        setPageDraftDirty(true);
                      }}
                      className={`text-xs font-medium py-2 px-3 rounded-lg border-2 transition-all ${
                        editShowIn === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditPublished(!editPublished);
                    setPageDraftDirty(true);
                  }}
                  className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 transition-all ${
                    editPublished
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {editPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {editPublished ? "منشورة" : "مسودة"}
                </button>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">محتوى الصفحة</label>
                <RichTextEditor
                  value={editContent}
                  onChange={(value) => {
                    setEditContent(value);
                    setPageDraftDirty(true);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={closeEditor}
                className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveEditor}
                disabled={updatePage.isPending || !editTitle.trim()}
                data-testid="page-save-button"
                className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
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
