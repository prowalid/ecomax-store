import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { usePageBySlug } from "@/hooks/usePages";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = usePageBySlug(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900">الصفحة غير موجودة</h1>
        <p className="text-gray-500">الصفحة التي تبحث عنها غير متوفرة أو لم تُنشر بعد.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-store-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl" dir="rtl">
      <h1 className="text-3xl font-black text-gray-900 mb-6">{page.title}</h1>
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </div>
  );
}
