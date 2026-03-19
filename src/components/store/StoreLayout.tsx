import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Mail, Truck, Clock, User, Menu, ShoppingBag, ChevronLeft, ChevronUp, X, Loader2, Home, LayoutGrid } from "lucide-react";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useMarketingSettings } from "@/hooks/useMarketingSettings";
import { usePublishedPages } from "@/hooks/usePages";
import { initPixel, trackEvent } from "@/lib/facebook-pixel";
import { getTrackingProfile } from "@/lib/trackingProfile";
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
  const { settings: generalSettings, loading: generalLoading } = useStoreSettings("general", { phone: "", whatsapp_phone: "", email: "", store_name: "ECOMAX", currency: "DZD", meta_title: "", meta_description: "", social_facebook: "", social_instagram: "", social_tiktok: "" });
  const effectiveStoreName = generalSettings.store_name || theme.store_name || "ECOMAX";
  const effectiveMetaTitle = generalSettings.meta_title?.trim() || `${effectiveStoreName} — متجر إلكتروني`;
  const effectiveMetaDescription =
    generalSettings.meta_description?.trim() ||
    "أفضل متجر للدفع عند الاستلام في الجزائر. نوفر لك جودة استثنائية، سرعة في التوصيل، وتجربة تسوق آمنة تماماً.";
  const normalizedHeaderPages = headerPages.map((page) => ({ ...page, slug: normalizePageSlug(page.slug) }));
  const normalizedFooterPages = footerPages.map((page) => ({ ...page, slug: normalizePageSlug(page.slug) }));
  const footerLinks = normalizedFooterPages;
  const whatsappDigits = normalizeWhatsAppPhone(generalSettings.whatsapp_phone || "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;

  const socialLinks = [
    { key: "facebook", url: generalSettings.social_facebook, icon: (
      <svg viewBox="0 0 320 512" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5 16.3 0 29.4.4 37 1.2V7.9C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"/></svg>
    )},
    { key: "instagram", url: generalSettings.social_instagram, icon: (
      <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
    )},
    { key: "tiktok", url: generalSettings.social_tiktok, icon: (
      <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.8A162.6 162.6 0 11185 188.3v89.9a74.6 74.6 0 1052.2 71.2V0h88a121 121 0 00122.8 121v88.9z"/></svg>
    )},
  ].filter(s => s.url?.trim());


  useEffect(() => {
    if (marketing.pixel_id) {
      initPixel(marketing.pixel_id, getTrackingProfile());
    }
  }, [marketing.pixel_id]);

  useEffect(() => {
    if (!marketing.pixel_id || !marketing.pixel_configured) return;
    if (marketing.enabled_events?.PageView === false) return;

    trackEvent("PageView", getTrackingProfile(), {});
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
            <span className="flex items-center"><Truck size={14} className="ml-1" /> التوصيل سريع</span>
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
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-center gap-4 px-4 pb-3 pt-1">
                {socialLinks.map(s => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: theme.header_text + 'aa', backgroundColor: theme.header_text + '11' }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
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
                {effectiveMetaDescription}
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
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-6">
                  {socialLinks.map(s => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg transition-all duration-200 hover:scale-110"
                      style={{ backgroundColor: theme.footer_text + '1a', color: theme.footer_text + 'bb' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.footer_accent; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.footer_text + '1a'; e.currentTarget.style.color = theme.footer_text + 'bb'; }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
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
          className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 whatsapp-btn-pulse"
          style={{ backgroundColor: "#25D366", color: "#ffffff" }}
        >
          <svg 
            viewBox="0 0 448 512" 
            className="w-8 h-8 md:w-9 md:h-9 fill-current drop-shadow-md" 
            aria-hidden="true"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.4 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.4-29.8-17-41.1-4.5-10.9-9.1-9.4-12.4-9.6H173c-4.1 0-10.8 1.5-16.5 7.6-5.7 6.1-21.8 21.3-21.8 51.9s22.4 60.3 25.5 64.5c3.1 4.2 44 67.2 106.5 94.3 14.9 6.4 26.5 10.3 35.6 13.1 15 4.8 28.6 4.1 39.3 2.5 11.9-1.8 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default StoreLayout;
