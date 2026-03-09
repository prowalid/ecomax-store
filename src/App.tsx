import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Customers from "./pages/admin/Customers";
import Discounts from "./pages/admin/Discounts";
import Shipping from "./pages/admin/Shipping";
import Marketing from "./pages/admin/Marketing";
import Analytics from "./pages/admin/Analytics";
import Notifications from "./pages/admin/Notifications";
import Pages from "./pages/admin/Pages";
import Appearance from "./pages/admin/Appearance";
import Settings from "./pages/admin/Settings";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminLogin from "./pages/admin/AdminLogin";
import StoreLayout from "./components/store/StoreLayout";
import StorePage from "./pages/store/StorePage";
import ProductPage from "./pages/store/ProductPage";
import CheckoutPage from "./pages/store/CheckoutPage";
import DynamicPage from "./pages/store/DynamicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Store (Customer-facing) */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<StorePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/page/:slug" element={<DynamicPage />} />
            </Route>

            {/* Admin Auth */}
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Dashboard (Protected) */}
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="customers" element={<Customers />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="pages" element={<Pages />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
