import { Outlet, Link, useLocation } from "react-router-dom";
import { Phone, Mail, Truck, Clock, User, Menu, ShoppingBag, ChevronLeft, X } from "lucide-react";
import { useState } from "react";

const StoreLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 overflow-x-hidden" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Announcement Bar */}
      <div className="bg-[#dc3545] text-white py-2 text-sm hidden md:block transition-colors">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6 space-x-reverse">
            <a href="tel:+21239216250" className="flex items-center hover:text-gray-200 transition-colors"><Phone size={14} className="ml-1" /> +21239216250</a>
            <a href="mailto:support@codwoo.com" className="flex items-center hover:text-gray-200 transition-colors"><Mail size={14} className="ml-1" /> support@codwoo.com</a>
          </div>
          <div className="flex space-x-6 space-x-reverse font-medium">
            <span className="flex items-center"><Truck size={14} className="ml-1" /> التوصيل مجاني</span>
            <span className="flex items-center"><Clock size={14} className="ml-1" /> توصيل في أقل من 48 ساعة</span>
            <span className="flex items-center"><User size={14} className="ml-1" /> دعم فني</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-[0px_10px_10px_-10px_rgba(0,0,0,0.15)] sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-800 hover:text-[#dc3545] border border-gray-200 rounded p-1 transition-colors"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="flex-1 text-center md:text-right">
            <Link to="/" className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start">
              OUTER<span className="text-[#dc3545]">LUXE</span>
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center space-x-8 space-x-reverse font-bold text-gray-700">
            <Link to="/" className={`transition-colors ${isActive("/") ? "text-[#dc3545]" : "hover:text-[#dc3545]"}`}>الرئيسية</Link>
            <Link to="/shop" className={`transition-colors ${isActive("/shop") || location.pathname.startsWith("/product") ? "text-[#dc3545]" : "hover:text-[#dc3545]"}`}>المتجر</Link>
            <Link to="/shop" className="hover:text-[#dc3545] transition-colors">عروض حصرية</Link>
          </nav>

          <div className="flex-1 flex justify-end">
            <button className="relative p-2 border-2 border-[#dc3545] text-[#dc3545] rounded-lg hover:bg-[#dc3545] hover:text-white transition-all duration-300 transform hover:scale-105">
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -left-2 bg-[#dc3545] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">0</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-100 pt-2 pb-1 px-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 text-sm font-semibold border-b border-gray-50 ${isActive("/") ? "text-[#dc3545] bg-red-50/50" : "text-gray-700 hover:bg-red-50/30 hover:pr-6"} transition-all`}>الرئيسية</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 text-sm font-semibold ${isActive("/shop") ? "text-[#dc3545] bg-red-50/50" : "text-gray-700 hover:bg-red-50/30 hover:pr-6"} transition-all`}>المتجر</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-red-50/30 hover:pr-6 transition-all">عروض حصرية</Link>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-[#dc3545]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black mb-6">OUTER<span className="text-[#dc3545]">LUXE</span></h3>
              <p className="text-gray-400 leading-relaxed max-w-md">
                أفضل متجر للدفع عند الاستلام في الجزائر. نوفر لك جودة استثنائية، سرعة في التوصيل، وتجربة تسوق آمنة تماماً.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2 inline-block">روابط سريعة</h4>
              <ul className="space-y-3 text-gray-400 font-medium">
                <li><Link to="/" className="hover:text-[#dc3545] transition-colors flex items-center"><ChevronLeft size={16} className="ml-1" /> الرئيسية</Link></li>
                <li><Link to="/shop" className="hover:text-[#dc3545] transition-colors flex items-center"><ChevronLeft size={16} className="ml-1" /> المتجر</Link></li>
                <li><a href="#" className="hover:text-[#dc3545] transition-colors flex items-center"><ChevronLeft size={16} className="ml-1" /> اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2 inline-block">تواصل معنا</h4>
              <ul className="space-y-4 text-gray-400 font-medium">
                <li className="flex items-start">
                  <div className="bg-gray-800 p-2 rounded-lg ml-3 text-[#dc3545]"><Phone size={18} /></div>
                  <span className="pt-1" dir="ltr">+212 39 216 250</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gray-800 p-2 rounded-lg ml-3 text-[#dc3545]"><Mail size={18} /></div>
                  <span className="pt-1">support@codwoo.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p className="mb-4 md:mb-0 font-medium">&copy; {new Date().getFullYear()} OuterLuxe / Created by Walid</p>
            <div className="flex space-x-4 space-x-reverse">
              <span className="bg-gray-800 px-3 py-1 rounded text-gray-400">الدفع عند الاستلام</span>
              <span className="bg-gray-800 px-3 py-1 rounded text-gray-400">توصيل سريع</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
