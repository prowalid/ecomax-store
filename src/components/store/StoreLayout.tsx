import { Outlet, Link, useLocation } from "react-router-dom";
import { Phone, Mail, Truck, Clock, Headphones, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const StoreLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: categories = [] } = useCategories();
  const { settings } = useStoreSettings<{ store_name: string; phone: string; email: string }>("general", {
    store_name: "متجري",
    phone: "",
    email: "",
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <div dir="rtl" className="min-h-screen bg-white font-[Cairo]">
      {/* Announcement Bar - Desktop only */}
      <div className="hidden md:block bg-[hsl(var(--primary))] text-white text-xs py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-3 h-3" />
                </div>
                <span dir="ltr">{settings.phone}</span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="w-3 h-3" />
                </div>
                <span>{settings.email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Truck className="w-3 h-3" />
              </div>
              التوصيل مجاني
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-3 h-3" />
              </div>
              توصيل في أقل من 48 ساعة
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Headphones className="w-3 h-3" />
              </div>
              دعم فني
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0px 10px 10px -10px rgb(0 0 0 / 15%)' }}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between relative">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo - Centered */}
            <Link to="/" className="flex-1 flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary))]">{settings.store_name}</h1>
            </Link>

            {/* Cart button */}
            <button
              className="w-[45px] h-[45px] rounded-lg border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all flex items-center justify-center relative"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border-2 border-white">0</span>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 py-2 border-t border-gray-100 mt-2">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors py-1 ${isActive("/") ? "text-[hsl(var(--primary))]" : "text-gray-700 hover:text-[hsl(var(--primary))]"}`}
            >
              الرئيسية
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-semibold transition-colors py-1 ${isActive("/shop") || location.pathname.startsWith("/product") ? "text-[hsl(var(--primary))]" : "text-gray-700 hover:text-[hsl(var(--primary))]"}`}
            >
              المتجر
            </Link>
          </nav>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-2 border-t border-gray-100 pt-2 pb-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold border-b border-gray-50 ${isActive("/") ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]" : "text-gray-700 hover:bg-[hsl(var(--primary)/0.05)] hover:pr-6"} transition-all`}
              >
                الرئيسية
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold ${isActive("/shop") ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]" : "text-gray-700 hover:bg-[hsl(var(--primary)/0.05)] hover:pr-6"} transition-all`}
              >
                المتجر
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-12">
        <div className="bg-[hsl(var(--primary))] text-white py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Store info */}
              <div className="md:col-span-1">
                <h3 className="text-xl font-extrabold mb-3">{settings.store_name}</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  أفضل متجر للدفع عند الاستلام
                </p>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">التصنيفات</h4>
                <ul className="space-y-3">
                  {categories.slice(0, 6).map((cat) => (
                    <li key={cat.id}>
                      <Link to={`/shop?category=${cat.id}`} className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">روابط مهمة</h4>
                <ul className="space-y-3">
                  <li><Link to="/" className="text-sm text-white/80 hover:text-white transition-all inline-block">الرئيسية</Link></li>
                  <li><Link to="/shop" className="text-sm text-white/80 hover:text-white transition-all inline-block">المتجر</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">تواصل معنا</h4>
                {settings.phone && (
                  <p className="text-sm text-white/80 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> <span dir="ltr">{settings.phone}</span>
                  </p>
                )}
                {settings.email && (
                  <p className="text-sm text-white/80 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {settings.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              &copy; {settings.store_name} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
