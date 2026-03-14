import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, ShoppingBag, Search, ArrowRight } from "lucide-react";

export default function StoreNotFound() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className={`max-w-md transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Big 404 */}
        <div className="relative mb-4">
          <span className="text-[120px] sm:text-[160px] font-black leading-none text-slate-100 select-none block">
            404
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-store-primary/10 flex items-center justify-center border border-slate-100 animate-bounce [animation-duration:2.5s]">
              <Search className="w-7 h-7 text-store-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          الصفحة غير موجودة
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
          الصفحة التي تبحث عنها غير متوفرة. ربما تم حذفها أو تغيير عنوانها.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 bg-store-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-store-primary/20"
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
            <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 hover:border-store-primary/30 hover:text-store-primary transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            تصفح المنتجات
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-gray-400">
          المسار:{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono border border-gray-200" dir="ltr">
            {location.pathname}
          </code>
        </p>
      </div>
    </div>
  );
}
