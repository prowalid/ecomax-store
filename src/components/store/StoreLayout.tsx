import { Outlet, Link, useLocation } from "react-router-dom";
import { Phone, Mail, Truck, Clock, User, Menu, ShoppingBag, ChevronLeft, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAppearanceSettings, defaultAppearance } from "@/hooks/useAppearanceSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useMarketingSettings } from "@/hooks/useMarketingSettings";
import { usePublishedPages } from "@/hooks/usePages";
import { initPixel } from "@/lib/facebook-pixel";
import CartDrawer from "./CartDrawer";

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '220 53 69';
};

const StoreLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const { totalCount } = useCart();
  const { settings: t, loading } = useAppearanceSettings();
  const { settings: marketing } = useMarketingSettings();
  const { data: headerPages = [] } = usePublishedPages("header");
  const { data: footerPages = [] } = usePublishedPages("footer");
  const { settings: generalSettings } = useStoreSettings("general", { phone: "", email: "", store_name: "ECOMAX", currency: "DZD" });

  useEffect(() => {
    if (marketing.pixel_id) {
      initPixel(marketing.pixel_id);
    }
  }, [marketing.pixel_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  const theme = t;

  return (
    <div dir="rtl" className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: theme.body_bg, fontFamily: `'${theme.body_font}', sans-serif` }}>
      <style>
        {`
          :root {
            --store-primary: ${hexToRgb(theme.accent_color)};
            --store-button: ${hexToRgb(theme.button_color)};
          }
        `}
      </style>


      {/* Announcement Bar */}
      <div className="py-2 text-sm hidden md:block transition-colors" style={{ backgroundColor: theme.top_bar_bg, color: theme.top_bar_text }}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6 space-x-reverse">
            {generalSettings.phone && (
              <a href={`tel:${generalSettings.phone}`} className="flex items-center hover:opacity-80 transition-opacity" dir="ltr">
                <Phone size={14} className="ml-1" /> {generalSettings.phone}
              </a>
            )}
            {generalSettings.email && (
              <a href={`mailto:${generalSettings.email}`} className="flex items-center hover:opacity-80 transition-opacity">
                <Mail size={14} className="ml-1" /> {generalSettings.email}
              </a>
            )}
          </div>
          <div className="flex space-x-6 space-x-reverse font-medium">
            <span className="flex items-center"><Truck size={14} className="ml-1" /> التوصيل مجاني</span>
            <span className="flex items-center"><Clock size={14} className="ml-1" /> توصيل في أقل من 48 ساعة</span>
            <span className="flex items-center"><User size={14} className="ml-1" /> دعم فني</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="shadow-[0px_10px_10px_-10px_rgba(0,0,0,0.15)] sticky top-0 z-40 transition-all duration-300" style={{ backgroundColor: theme.header_bg, color: theme.header_text }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border rounded p-1 transition-colors"
            style={{ color: theme.header_text, borderColor: theme.header_text + '33' }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="flex-1 text-center md:text-right">
            <Link to="/" className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start" style={{ color: theme.header_text }}>
              {theme.logo_url ? (
                <img src={theme.logo_url} alt={theme.store_name} className="h-10 object-contain" />
              ) : (
                <span className="tracking-tight font-black">{theme.store_name || "ECOMAX"}</span>
              )}
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center space-x-8 space-x-reverse font-bold">
            <a href="/#products" className="hover:opacity-80 transition-opacity" style={{ color: theme.header_text }}>المنتجات</a>
            <a href="/#offers" className="hover:opacity-80 transition-opacity" style={{ color: theme.header_text }}>العروض</a>
            {headerPages.map((page) => (
              <Link
                key={page.id}
                to={`/page/${page.slug}`}
                className="hover:opacity-80 transition-opacity"
                style={{ color: theme.header_text }}
              >
                {page.title}
              </Link>
            ))}
          </nav>

          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 border-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              style={{ borderColor: theme.accent_color, color: theme.accent_color }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.accent_color; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.accent_color; }}
            >
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -left-2 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white" style={{ backgroundColor: theme.accent_color }}>
                {totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t pt-2 pb-1 px-4" style={{ borderColor: theme.header_text + '1a' }}>
            <a href="/#products" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold transition-all" style={{ color: theme.header_text }}>المنتجات</a>
            <a href="/#offers" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold transition-all" style={{ color: theme.header_text }}>العروض</a>
            {headerPages.map((page) => (
              <Link
                key={page.id}
                to={`/page/${page.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold transition-all"
                style={{ color: theme.header_text }}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="pt-16 pb-8" style={{ backgroundColor: theme.footer_bg, color: theme.footer_text, borderTop: `4px solid ${theme.footer_accent}` }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black mb-6">
                {theme.footer_logo_url || theme.logo_url ? (
                  <img src={theme.footer_logo_url || theme.logo_url} alt={theme.store_name} className="h-10 object-contain brightness-0 invert" />
                ) : (
                  <span className="tracking-tight font-black">{theme.store_name || "ECOMAX"}</span>
                )}
              </h3>
              <p className="leading-relaxed max-w-md" style={{ color: theme.footer_text + 'aa' }}>
                أفضل متجر للدفع عند الاستلام في الجزائر. نوفر لك جودة استثنائية، سرعة في التوصيل، وتجربة تسوق آمنة تماماً.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 inline-block" style={{ borderBottom: `1px solid ${theme.footer_text}33` }}>روابط سريعة</h4>
              <ul className="space-y-3 font-medium" style={{ color: theme.footer_text + 'aa' }}>
                <li><a href="/#products" className="flex items-center transition-colors" style={{ color: theme.footer_text + 'aa' }} onMouseEnter={(e) => e.currentTarget.style.color = theme.footer_accent} onMouseLeave={(e) => e.currentTarget.style.color = theme.footer_text + 'aa'}><ChevronLeft size={16} className="ml-1" /> المنتجات</a></li>
                <li><a href="/#offers" className="flex items-center transition-colors" style={{ color: theme.footer_text + 'aa' }} onMouseEnter={(e) => e.currentTarget.style.color = theme.footer_accent} onMouseLeave={(e) => e.currentTarget.style.color = theme.footer_text + 'aa'}><ChevronLeft size={16} className="ml-1" /> العروض</a></li>
                {footerPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/page/${page.slug}`}
                      className="flex items-center transition-colors"
                      style={{ color: theme.footer_text + 'aa' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = theme.footer_accent}
                      onMouseLeave={(e) => e.currentTarget.style.color = theme.footer_text + 'aa'}
                    >
                      <ChevronLeft size={16} className="ml-1" /> {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 inline-block" style={{ borderBottom: `1px solid ${theme.footer_text}33` }}>تواصل معنا</h4>
              <ul className="space-y-4 font-medium" style={{ color: theme.footer_text + 'aa' }}>
                {generalSettings.phone && (
                  <li className="flex items-start">
                    <div className="p-2 rounded-lg ml-3" style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_accent }}><Phone size={18} /></div>
                    <span className="pt-1" dir="ltr">{generalSettings.phone}</span>
                  </li>
                )}
                {generalSettings.email && (
                  <li className="flex items-start">
                    <div className="p-2 rounded-lg ml-3" style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_accent }}><Mail size={18} /></div>
                    <span className="pt-1">{generalSettings.email}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm" style={{ borderTop: `1px solid ${theme.footer_text}22`, color: theme.footer_text + '88' }}>
            <p className="mb-4 md:mb-0 font-medium">&copy; {new Date().getFullYear()} {theme.store_name} / Created by Walid</p>
            <div className="flex space-x-4 space-x-reverse">
              <span className="px-3 py-1 rounded" style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_text + 'aa' }}>الدفع عند الاستلام</span>
              <span className="px-3 py-1 rounded" style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_text + 'aa' }}>توصيل سريع</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
