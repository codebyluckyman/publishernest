
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationProvider";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Profile from "./pages/auth/Profile";
import Organizations from "./pages/organizations/Organizations";
import OrganizationSettings from "./pages/organizations/OrganizationSettings";
import ProductsPage from "./pages/ProductsPage";
import FormatsPage from "./pages/FormatsPage";
import FormatDetailPage from "./pages/FormatDetailPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import QuoteRequestsPage from "./pages/QuoteRequestsPage";
import QuoteRequestDetailPage from "./pages/QuoteRequestDetailPage";
import SuppliersPage from "./pages/SuppliersPage";
import SupplierDetailPage from "./pages/SupplierDetailPage";
import QuotesPage from "./pages/QuotesPage";
import SupplierQuoteDetail from "./pages/SupplierQuoteDetail";
import SupplierQuoteCreate from "./pages/SupplierQuoteCreate";
import PrintRunsPage from "./pages/PrintRunsPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import CreatePurchaseOrderPage from "./pages/CreatePurchaseOrderPage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:id/settings" element={<OrganizationSettings />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="formats" element={<FormatsPage />} />
            <Route path="formats/:id" element={<FormatDetailPage />} />
            <Route path="quote-requests" element={<QuoteRequestsPage />} />
            <Route path="quote-requests/:id" element={<QuoteRequestDetailPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="quotes/new" element={<SupplierQuoteCreate />} />
            <Route path="quotes/:id" element={<SupplierQuoteDetail />} />
            <Route path="quotes/:id/details" element={<SupplierQuoteDetail />} />

            {/* New Print Runs and Purchase Orders Routes */}
            <Route path="print-runs" element={<PrintRunsPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="purchase-orders/new" element={<CreatePurchaseOrderPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
