import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./hooks/useAuth";
import AdminGuard from "./components/admin/AdminGuard";
import AdminGuestGuard from "./components/admin/AdminGuestGuard";
import AdminLayout from "./components/admin/AdminLayout";
import StoreLayout from "./components/store/StoreLayout";

const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Products = lazy(() => import("./pages/admin/Products"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Discounts = lazy(() => import("./pages/admin/Discounts"));
const Shipping = lazy(() => import("./pages/admin/Shipping"));
const Marketing = lazy(() => import("./pages/admin/Marketing"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Notifications = lazy(() => import("./pages/admin/Notifications"));
const Pages = lazy(() => import("./pages/admin/Pages"));
const Appearance = lazy(() => import("./pages/admin/Appearance"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminSetup = lazy(() => import("./pages/admin/AdminSetup"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const StorePage = lazy(() => import("./pages/store/StorePage"));
const ProductPage = lazy(() => import("./pages/store/ProductPage"));
const CheckoutPage = lazy(() => import("./pages/store/CheckoutPage"));
const DynamicPage = lazy(() => import("./pages/store/DynamicPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default cache to avoid waterfall fetch loops
      refetchOnWindowFocus: false, // Prevents sudden loading indicators on tab switches
      retry: 1,
    },
  },
});

const RouteLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    جاري التحميل...
  </div>
);

const withSuspense = (element: JSX.Element) => (
  <Suspense fallback={<RouteLoader />}>
    {element}
  </Suspense>
);

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
              <Route path="/" element={withSuspense(<StorePage />)} />
              <Route path="/shop" element={withSuspense(<StorePage />)} />
              <Route path="/product/:id" element={withSuspense(<ProductPage />)} />
              <Route path="/checkout" element={withSuspense(<CheckoutPage />)} />
              <Route path="/page/:slug" element={withSuspense(<DynamicPage />)} />
            </Route>

            {/* Admin Auth */}
            <Route
              path="/admin/setup"
              element={(
                <AdminGuestGuard mode="setup">
                  {withSuspense(<AdminSetup />)}
                </AdminGuestGuard>
              )}
            />
            <Route
              path="/admin/login"
              element={(
                <AdminGuestGuard mode="login">
                  {withSuspense(<AdminLogin />)}
                </AdminGuestGuard>
              )}
            />

            {/* Admin Dashboard (Protected) */}
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={withSuspense(<Dashboard />)} />
              <Route path="orders" element={withSuspense(<Orders />)} />
              <Route path="products" element={withSuspense(<Products />)} />
              <Route path="categories" element={withSuspense(<Categories />)} />
              <Route path="customers" element={withSuspense(<Customers />)} />
              <Route path="discounts" element={withSuspense(<Discounts />)} />
              <Route path="shipping" element={withSuspense(<Shipping />)} />
              <Route path="marketing" element={withSuspense(<Marketing />)} />
              <Route path="analytics" element={withSuspense(<Analytics />)} />
              <Route path="notifications" element={withSuspense(<Notifications />)} />
              <Route path="pages" element={withSuspense(<Pages />)} />
              <Route path="appearance" element={withSuspense(<Appearance />)} />
              <Route path="settings" element={withSuspense(<Settings />)} />
            </Route>

            <Route path="*" element={withSuspense(<NotFound />)} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
