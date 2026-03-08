import { Outlet, Link, useLocation } from "react-router-dom";
import { Phone, Mail, Truck, Clock, User, ShoppingBag, Menu, X } from "lucide-react";
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
      <div className="hidden md:block bg-[#f8f9fa] border-b border-gray-200 text-xs py-2.5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <span dir="ltr" className="font-medium">{settings.phone}</span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium">{settings.email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-600">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium">التوصيل مجاني</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium">توصيل في أقل من 48 ساعة</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-medium">دعم فني</span>
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
              className="md:hidden p-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo - Centered */}
            <Link to="/" className="flex-1 flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary">{settings.store_name}</h1>
            </Link>

            {/* Cart button */}
            <button
              className="w-[45px] h-[45px] rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center relative"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border-2 border-white">0</span>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 py-2 border-t border-gray-100 mt-2">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors py-1 ${isActive("/") ? "text-primary" : "text-gray-700 hover:text-primary"}`}
            >
              الرئيسية
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-semibold transition-colors py-1 ${isActive("/shop") || location.pathname.startsWith("/product") ? "text-primary" : "text-gray-700 hover:text-primary"}`}
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
                className={`block px-4 py-3 text-sm font-semibold border-b border-gray-50 ${isActive("/") ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-primary/5 hover:pr-6"} transition-all`}
              >
                الرئيسية
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold ${isActive("/shop") ? "text-primary bg-primary/5" : "text-gray-700 hover:bg-primary/5 hover:pr-6"} transition-all`}
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
        <div className="bg-[#1a1a2e] text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Store info */}
              <div className="md:col-span-1">
                <h3 className="text-xl font-extrabold mb-3">{settings.store_name}</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  أفضل متجر للدفع عند الاستلام
                </p>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-sm mb-4 text-primary uppercase tracking-wider">التصنيفات</h4>
                <ul className="space-y-2.5">
                  {categories.slice(0, 6).map((cat) => (
                    <li key={cat.id}>
                      <Link to={`/shop?category=${cat.id}`} className="text-sm text-white/60 hover:text-primary transition-colors inline-block">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-bold text-sm mb-4 text-primary uppercase tracking-wider">روابط مهمة</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/" className="text-sm text-white/60 hover:text-primary transition-colors inline-block">الرئيسية</Link></li>
                  <li><Link to="/shop" className="text-sm text-white/60 hover:text-primary transition-colors inline-block">المتجر</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-bold text-sm mb-4 text-primary uppercase tracking-wider">تواصل معنا</h4>
                {settings.phone && (
                  <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> <span dir="ltr">{settings.phone}</span>
                  </p>
                )}
                {settings.email && (
                  <p className="text-sm text-white/60 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> {settings.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-[#12122a] py-4">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <p className="text-xs text-white/40">
              &copy; {settings.store_name} {new Date().getFullYear()} — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
