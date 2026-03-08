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
      {/* Announcement Bar */}
      <div className="hidden md:block bg-[hsl(var(--primary))] text-white text-xs py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:opacity-80">
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{settings.phone}</span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:opacity-80">
                <Mail className="w-3.5 h-3.5" />
                <span>{settings.email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> التوصيل مجاني</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> توصيل في أقل من 48 ساعة</span>
            <span className="flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5" /> دعم فني</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-1 md:flex-none text-center">
              <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">{settings.store_name}</h1>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${isActive("/") ? "text-[hsl(var(--primary))]" : "text-gray-700 hover:text-[hsl(var(--primary))]"}`}
              >
                الرئيسية
              </Link>
              <Link
                to="/shop"
                className={`text-sm font-medium transition-colors ${isActive("/shop") || location.pathname.startsWith("/shop") ? "text-[hsl(var(--primary))]" : "text-gray-700 hover:text-[hsl(var(--primary))]"}`}
              >
                المتجر
              </Link>
            </nav>

            {/* Cart button */}
            <Link
              to="/shop"
              className="p-2.5 rounded-lg border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 border-t pt-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive("/") ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "text-gray-700"}`}
              >
                الرئيسية
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive("/shop") ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "text-gray-700"}`}
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
      <footer className="bg-[hsl(var(--primary))] text-white mt-12">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-3">{settings.store_name}</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                أفضل متجر للدفع عند الاستلام
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">التصنيفات</h4>
              <ul className="space-y-2">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/shop?category=${cat.id}`} className="text-sm text-white/80 hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">روابط مهمة</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-white/80 hover:text-white">الرئيسية</Link></li>
                <li><Link to="/shop" className="text-sm text-white/80 hover:text-white">المتجر</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">تواصل معنا</h4>
              {settings.phone && (
                <p className="text-sm text-white/80 mb-2 flex items-center gap-2">
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
        <div className="border-t border-white/20 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-white/60">
            &copy; {settings.store_name} {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
