import { lazy } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import StoreLayout from "./components/store/StoreLayout";
import StoreHome from "./pages/StoreHome";
import ProtectedRoute from "./components/ProtectedRoute";
import "./storefront.css";
import { formPages, guidePages } from './lib/site-pages';

const queryClient = new QueryClient();
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const StoreAuth = lazy(() => import('./pages/StoreAuth'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AboutPage = lazy(() => import('./pages/CompanyPages').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/CompanyPages').then(m => ({ default: m.ContactPage })));
const BrandsPage = lazy(() => import('./pages/CompanyPages').then(m => ({ default: m.BrandsPage })));
const HelpCenter = lazy(() => import('./pages/InformationPages').then(m => ({ default: m.HelpCenter })));
const InformationPage = lazy(() => import('./pages/InformationPages').then(m => ({ default: m.InformationPage })));
const TrackingPage = lazy(() => import('./pages/InformationPages').then(m => ({ default: m.TrackingPage })));

export const AppContent = ({ client = queryClient }: { client?: QueryClient }) => (
  <QueryClientProvider client={client}>
    <LanguageProvider>
      <AuthProvider>
          <Sonner />
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
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

const App = () => <BrowserRouter><AppContent /></BrowserRouter>;
export default App;
