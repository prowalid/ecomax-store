import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { usePageBySlug } from "@/hooks/usePages";
import { normalizePageSlug } from "@/lib/storePages";
import { useSEO } from "@/hooks/useSEO";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = normalizePageSlug(slug || "");
  const { data: page, isLoading, isError } = usePageBySlug(normalizedSlug);
  const { settings: appearance } = useAppearanceSettings();
  const pageDescription = page?.content
    ? page.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
    : undefined;

  // Dynamic SEO for CMS pages
  useSEO({
    title: page?.title ? `${page.title} | ${appearance.store_name || "المتجر"}` : undefined,
    description: pageDescription,
    ogImage: appearance.logo_url || appearance.favicon_url || undefined,
    ogType: "article",
    canonicalPath: normalizedSlug ? `/page/${normalizedSlug}` : undefined,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!page && isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900">الصفحة غير موجودة</h1>
        <p className="text-gray-500">الصفحة التي تبحث عنها غير متوفرة أو لم تُنشر بعد.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-store-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl" dir="rtl">
      <h1 className="text-3xl font-black text-gray-900 mb-6">{page?.title}</h1>
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page?.content || "" }}
      />
    </div>
  );
}
