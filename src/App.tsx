import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import StoreLayout from "./components/store/StoreLayout";
import StoreHome from "./pages/StoreHome";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import { AboutPage, ContactPage, BrandsPage } from "./pages/CompanyPages";
import CartPage from "./pages/CartPage";
import StoreAuth from "./pages/StoreAuth";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./storefront.css";
import NotFound from "./pages/NotFound";
import { HelpCenter, InformationPage, TrackingPage } from './pages/InformationPages';
import { formPages, guidePages } from './lib/site-pages';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <StoreProvider>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<StoreHome />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {['company-profile', 'customers', 'careers', 'terms', 'privacy'].map(path => <Route key={path} path={`/${path}`} element={<InformationPage kind="company" />} />)}
                {formPages.map(page => <Route key={page.slug} path={`/forms/${page.slug}`} element={<InformationPage kind="form" />} />)}
                {guidePages.map(page => <Route key={page.slug} path={`/help/${page.slug}`} element={<InformationPage kind="guide" />} />)}
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth" element={<StoreAuth />} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </StoreProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
