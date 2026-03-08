import { useState } from "react";
import { Plus, FileText, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePages, useCreatePage, useUpdatePage, useDeletePage } from "@/hooks/usePages";

const Pages = () => {
  const { data: pages = [], isLoading } = usePages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const slug = newSlug.trim() || "/" + newTitle.trim().toLowerCase().replace(/\s+/g, "-");
    createPage.mutate(
      { title: newTitle.trim(), slug },
      { onSuccess: () => { setNewTitle(""); setNewSlug(""); setShowAdd(false); } }
    );
  };

  const togglePublish = (id: string, current: boolean) => {
    updatePage.mutate({ id, published: !current });
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">صفحات المتجر</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إنشاء صفحة
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg shadow-card border border-border p-4 flex items-center gap-3 animate-slide-in flex-wrap">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان الصفحة..."
            className="flex-1 min-w-[200px] h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="/slug (اختياري)"
            className="w-44 h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            dir="ltr"
          />
          <button
            onClick={handleAdd}
            disabled={createPage.isPending}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {createPage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
          </button>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{page.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1" dir="ltr">
                  {page.slug} <ExternalLink className="w-3 h-3" />
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(page.updated_at).toLocaleDateString("ar-DZ")}
              </span>
              <button onClick={() => togglePublish(page.id, page.published)}>
                <Badge variant={page.published ? "success" : "muted"} className="cursor-pointer">
                  {page.published ? "منشورة" : "مسودة"}
                </Badge>
              </button>
              <button
                onClick={() => deletePage.mutate(page.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {pages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              لا توجد صفحات بعد
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pages;
