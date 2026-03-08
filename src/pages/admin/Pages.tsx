import { Plus, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const pages = [
  { id: "P1", title: "من نحن", slug: "/about", published: true, updatedAt: "منذ أسبوع" },
  { id: "P2", title: "سياسة الإرجاع", slug: "/return-policy", published: true, updatedAt: "منذ شهر" },
  { id: "P3", title: "شروط الاستخدام", slug: "/terms", published: true, updatedAt: "منذ شهر" },
  { id: "P4", title: "اتصل بنا", slug: "/contact", published: false, updatedAt: "منذ يومين" },
];

const Pages = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">صفحات المتجر</h1>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إنشاء صفحة
        </button>
      </div>

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
              <span className="text-xs text-muted-foreground">{page.updatedAt}</span>
              <Badge variant={page.published ? "success" : "muted"}>
                {page.published ? "منشورة" : "مسودة"}
              </Badge>
              <button className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                تعديل
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pages;
