import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Mail, Truck, Clock, User, Menu, ShoppingBag, ChevronLeft, ChevronUp, X, Loader2, Home, LayoutGrid } from "lucide-react";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { useAppearanceSettings, defaultAppearance } from "@/hooks/useAppearanceSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useMarketingSettings } from "@/hooks/useMarketingSettings";
import { usePublishedPages } from "@/hooks/usePages";
import { initPixel, trackEvent } from "@/lib/facebook-pixel";
import { normalizePageSlug } from "@/lib/storePages";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";
import CartDrawer from "./CartDrawer";

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '220 53 69';
};

const StoreLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalCount } = useCart();
  const { settings: theme, loading } = useAppearanceSettings();
  const { settings: marketing } = useMarketingSettings();
  const { data: headerPages = [] } = usePublishedPages("header");
  const { data: footerPages = [] } = usePublishedPages("footer");
  const { settings: generalSettings, loading: generalLoading } = useStoreSettings("general", { phone: "", whatsapp_phone: "", email: "", store_name: "ECOMAX", currency: "DZD", meta_title: "", meta_description: "" });
  const effectiveStoreName = generalSettings.store_name || theme.store_name || "ECOMAX";
  const effectiveMetaTitle = generalSettings.meta_title?.trim() || `${effectiveStoreName} — متجر إلكتروني`;
  const effectiveMetaDescription =
    generalSettings.meta_description?.trim() ||
    "متجر إلكتروني احترافي للدفع عند الاستلام مع تجربة شراء سريعة وآمنة داخل الجزائر.";
  const normalizedHeaderPages = headerPages.map((page) => ({ ...page, slug: normalizePageSlug(page.slug) }));
  const normalizedFooterPages = footerPages.map((page) => ({ ...page, slug: normalizePageSlug(page.slug) }));
  const footerLinks = normalizedFooterPages;
  const whatsappDigits = normalizeWhatsAppPhone(generalSettings.whatsapp_phone || "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;

  useEffect(() => {
    if (marketing.pixel_id) {
      initPixel(marketing.pixel_id);
    }
  }, [marketing.pixel_id]);

  useEffect(() => {
    if (!marketing.pixel_id || !marketing.pixel_configured) return;
    if (marketing.enabled_events?.PageView === false) return;

    trackEvent("PageView", {}, {});
  }, [location.pathname, location.search, marketing.pixel_id, marketing.pixel_configured, marketing.enabled_events]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 12);
      setShowScrollTop(y > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  // Dynamic page title for SEO
  useEffect(() => {
    if (generalLoading) {
      return;
    }

    document.title = effectiveMetaTitle;
    try {
      localStorage.setItem("etk:store-title", effectiveMetaTitle);
    } catch {
      // Ignore storage failures; title still updates in the current tab.
    }
  }, [effectiveMetaTitle, generalLoading]);

  useEffect(() => {
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute("content", effectiveMetaDescription);

    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (!ogTitleTag) {
      ogTitleTag = document.createElement("meta");
      ogTitleTag.setAttribute("property", "og:title");
      document.head.appendChild(ogTitleTag);
    }
    ogTitleTag.setAttribute("content", effectiveMetaTitle);

    let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    if (!ogDescriptionTag) {
      ogDescriptionTag = document.createElement("meta");
      ogDescriptionTag.setAttribute("property", "og:description");
      document.head.appendChild(ogDescriptionTag);
    }
    ogDescriptionTag.setAttribute("content", effectiveMetaDescription);
  }, [effectiveMetaDescription, effectiveMetaTitle]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const faviconHref = theme.favicon_url?.trim();
    let faviconTag = document.getElementById("app-favicon");
    if (!faviconTag) {
      faviconTag = document.createElement("link");
      faviconTag.setAttribute("id", "app-favicon");
      faviconTag.setAttribute("rel", "icon");
      faviconTag.setAttribute("type", "image/svg+xml");
      document.head.appendChild(faviconTag);
    }

    const resolvedFavicon = faviconHref || "/images/logo-cart.svg";
    faviconTag.setAttribute("href", resolvedFavicon);

    try {
      if (faviconHref) {
        localStorage.setItem("etk:favicon-url", faviconHref);
      } else {
        localStorage.removeItem("etk:favicon-url");
      }
    } catch {
      // Ignore storage failures; favicon fallback still works.
    }
  }, [loading, theme.favicon_url]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSectionNavigation = useCallback(
    (sectionId: "products" | "offers", closeMobileMenu = false) => {
      if (closeMobileMenu) {
        setMobileMenuOpen(false);
      }

      if (location.pathname === "/") {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", `/#${sectionId}`);
          return;
        }
      }

      navigate(`/#${sectionId}`);
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }



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


      {/* Desktop Announcement Bar */}
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

      {/* Mobile Announcement Bar */}
      <div
        className="md:hidden fixed inset-x-0 top-0 z-50 h-[30px] overflow-hidden text-xs font-medium"
        style={{ backgroundColor: theme.top_bar_bg, color: theme.top_bar_text }}
      >
        <div className="flex h-full items-center justify-center gap-4 animate-marquee whitespace-nowrap px-4">
          <span className="flex items-center gap-1"><Truck size={12} /> توصيل سريع لكل الولايات</span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1"><Clock size={12} /> أقل من 48 ساعة</span>
          {generalSettings.phone && (
            <>
              <span className="opacity-40">•</span>
              <a href={`tel:${generalSettings.phone}`} className="flex items-center gap-1" dir="ltr">
                <Phone size={12} /> {generalSettings.phone}
              </a>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <header
        className={`fixed inset-x-0 top-[30px] md:top-0 md:sticky z-40 transition-all duration-300 will-change-transform ${isScrolled ? "shadow-lg backdrop-blur-md" : "shadow-[0px_10px_10px_-10px_rgba(0,0,0,0.15)]"}`}
        style={{
          backgroundColor: isScrolled ? `${theme.header_bg}f2` : theme.header_bg,
          color: theme.header_text,
        }}
      >
        <div className={`container mx-auto px-4 flex justify-between items-center transition-all duration-300 ${isScrolled ? "py-2" : "py-3"}`}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border rounded p-1 transition-colors"
            style={{ color: theme.header_text, borderColor: theme.header_text + '33' }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="flex-1 min-w-0 text-center md:text-right px-2">
            <Link
              to="/"
              className={`font-black tracking-tight flex items-center justify-center md:justify-start transition-all duration-300 ${isScrolled ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}
              style={{ color: theme.header_text }}
            >
              {theme.logo_url ? (
                <img
                  src={theme.logo_url}
                  alt={effectiveStoreName}
                  className={`object-contain transition-all duration-300 ${isScrolled ? "h-8" : "h-10"}`}
                />
              ) : (
                <span className="tracking-tight font-black">{effectiveStoreName}</span>
              )}
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center space-x-8 space-x-reverse font-bold">
            <button
              type="button"
              onClick={() => handleSectionNavigation("products")}
              className="hover:opacity-80 transition-opacity"
              style={{ color: theme.header_text }}
            >
              المنتجات
            </button>
            <button
              type="button"
              onClick={() => handleSectionNavigation("offers")}
              className="hover:opacity-80 transition-opacity"
              style={{ color: theme.header_text }}
            >
              العروض
            </button>
            {normalizedHeaderPages.map((page) => (
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
              className={`relative border-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${isScrolled ? "p-2.5" : "p-2"}`}
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

        {/* Mobile Nav with slide animation */}
        <nav
          className="md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            borderColor: theme.header_text + '1a',
            maxHeight: mobileMenuOpen ? '300px' : '0',
            opacity: mobileMenuOpen ? 1 : 0,
          }}
        >
          <div className="pt-2 pb-1 px-4">
            <button
              type="button"
              onClick={() => handleSectionNavigation("products", true)}
              className="block w-full px-4 py-3 text-right text-sm font-semibold transition-all"
              style={{ color: theme.header_text }}
            >
              المنتجات
            </button>
            <button
              type="button"
              onClick={() => handleSectionNavigation("offers", true)}
              className="block w-full px-4 py-3 text-right text-sm font-semibold transition-all"
              style={{ color: theme.header_text }}
            >
              العروض
            </button>
            {normalizedHeaderPages.map((page) => (
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
          </div>
        </nav>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Main Content */}
      <main className="pt-[106px] md:pt-0 pb-16 md:pb-0 overflow-x-clip min-h-[80vh]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="pt-16 pb-8" style={{ backgroundColor: theme.footer_bg, color: theme.footer_text, borderTop: `4px solid ${theme.footer_accent}` }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black mb-6">
                {theme.footer_logo_url || theme.logo_url ? (
                  <img src={theme.footer_logo_url || theme.logo_url} alt={effectiveStoreName} className="h-10 object-contain brightness-0 invert" />
                ) : (
                  <span className="tracking-tight font-black">{effectiveStoreName}</span>
                )}
              </h3>
              <p className="leading-relaxed max-w-md" style={{ color: theme.footer_text + 'aa' }}>
                أفضل متجر للدفع عند الاستلام في الجزائر. نوفر لك جودة استثنائية، سرعة في التوصيل، وتجربة تسوق آمنة تماماً.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 inline-block" style={{ borderBottom: `1px solid ${theme.footer_text}33` }}>روابط سريعة</h4>
              <ul className="space-y-3 font-medium" style={{ color: theme.footer_text + 'aa' }}>
                <li>
                  <button
                    type="button"
                    className="flex items-center transition-colors"
                    style={{ color: theme.footer_text + 'aa' }}
                    onClick={() => handleSectionNavigation("products")}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.footer_accent}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.footer_text + 'aa'}
                  >
                    <ChevronLeft size={16} className="ml-1" /> المنتجات
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center transition-colors"
                    style={{ color: theme.footer_text + 'aa' }}
                    onClick={() => handleSectionNavigation("offers")}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.footer_accent}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.footer_text + 'aa'}
                  >
                    <ChevronLeft size={16} className="ml-1" /> العروض
                  </button>
                </li>
                {footerLinks.map((page) => (
                  <li key={page.slug}>
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
            <p className="mb-4 md:mb-0 font-medium">&copy; {new Date().getFullYear()} {effectiveStoreName || "المتجر"} — جميع الحقوق محفوظة</p>
            <div className="flex space-x-4 space-x-reverse">
              <span className="px-3 py-1 rounded" style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_text + 'aa' }}>الدفع عند الاستلام</span>
              <span className="px-3 py-1 rounded" style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_text + 'aa' }}>توصيل سريع</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <div 
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around h-16 pb-safe border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: theme.header_bg, borderTopColor: theme.header_text + '22' }}
      >
        <button 
          onClick={() => { scrollToTop(); navigate('/'); }} 
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
          style={{ color: location.pathname === '/' ? theme.accent_color : theme.header_text + 'cc' }}
        >
          <Home size={20} className={location.pathname === '/' ? 'fill-current' : ''} />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button 
          onClick={() => handleSectionNavigation("products")} 
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
          style={{ color: theme.header_text + 'cc' }}
        >
          <LayoutGrid size={20} />
          <span className="text-[10px] font-bold">المنتجات</span>
        </button>
        <button 
          onClick={() => setCartOpen(true)} 
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative transition-colors"
          style={{ color: cartOpen ? theme.accent_color : theme.header_text + 'cc' }}
        >
          <div className="relative">
            <ShoppingBag size={20} className={cartOpen ? 'fill-current' : ''} />
            {totalCount > 0 && (
              <span 
                className="absolute -top-1.5 -right-2 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white"
                style={{ backgroundColor: theme.accent_color }}
              >
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">السلة</span>
        </button>
      </div>

      {/* Scroll to Top FAB */}
      <button
        onClick={scrollToTop}
        aria-label="العودة للأعلى"
        className={`fixed bottom-20 md:bottom-6 left-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: theme.accent_color, color: '#fff' }}
      >
        <ChevronUp size={22} />
      </button>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="مراسلة عبر واتساب"
          className="fixed bottom-20 md:bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
          style={{ backgroundColor: "#25D366", color: "#ffffff" }}
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current" aria-hidden="true">
            <path d="M19.11 17.24c-.3-.15-1.75-.86-2.02-.95-.27-.1-.47-.15-.67.15-.2.3-.77.95-.95 1.14-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.1 4.48 3 1.3 3 0 3.54-.03.54-.03 1.75-.72 2-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
            <path d="M26.7 5.28A13.2 13.2 0 0 0 5.86 21.22L4 28l6.94-1.82A13.2 13.2 0 1 0 26.7 5.28zm-10.5 21a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-4.12 1.08 1.1-4-.25-.41A10.68 10.68 0 1 1 16.2 26.3z" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default StoreLayout;
