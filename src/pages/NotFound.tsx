import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowRight, ShoppingBag, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setMounted(true);
  }, [location.pathname]);

  // Determine context: is this an admin 404 or a store 404?
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-primary/3 rounded-full blur-2xl animate-pulse [animation-delay:2s]" />
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center max-w-lg transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* 404 Number */}
        <div className="relative mb-6">
          <span className="text-[160px] sm:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-slate-200 to-slate-300 select-none block">
            404
          </span>
          {/* Floating icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl shadow-primary/20 flex items-center justify-center border border-slate-100 animate-bounce [animation-duration:2s]">
              <Search className="w-9 h-9 text-primary/70" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-10 max-w-sm mx-auto">
          عذراً، الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها إلى عنوان آخر.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={isAdminRoute ? "/admin" : "/"}
            className="group inline-flex items-center gap-2.5 bg-primary text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home className="w-4.5 h-4.5" />
            {isAdminRoute ? "لوحة التحكم" : "الصفحة الرئيسية"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>

          {!isAdminRoute && (
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 bg-white text-slate-700 px-7 py-3.5 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-primary/30 hover:text-primary hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              تصفح المنتجات
            </Link>
          )}
        </div>

        {/* Path hint */}
        <div className="mt-10">
          <p className="text-xs text-slate-400">
            المسار المطلوب:{" "}
            <code className="bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-mono text-[11px] border border-slate-200" dir="ltr">
              {location.pathname}
            </code>
          </p>
        </div>
      </div>

      {/* Bottom decoration line */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
};

export default NotFound;
