import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/context/AuthContext';
import Layout from './components/Layout';
import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import PrintRuns from './pages/PrintRuns';
import PrintRunDetail from './pages/PrintRunDetail';
import CreatePrintRun from './pages/CreatePrintRun';
import EditPrintRun from './pages/EditPrintRun';
import SalesOrders from './pages/SalesOrders';
import SalesOrderDetail from './pages/SalesOrderDetail';
import CreateSalesOrder from './pages/CreateSalesOrder';
import EditSalesOrder from './pages/EditSalesOrder';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import EditPurchaseOrder from './pages/EditPurchaseOrder';
import SalesPresentations from './pages/SalesPresentations';
import SalesPresentationDetail from './pages/SalesPresentationDetail';
import CreateSalesPresentation from './pages/CreateSalesPresentation';
import EditSalesPresentation from './pages/EditSalesPresentation';
import SharedPresentationView from './pages/SharedPresentationView';
import PresentationAnalytics from './pages/PresentationAnalytics';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
          {/* Authentication routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Public routes (no auth required) */}
          <Route path="/shared/presentation/:accessCode" element={<SharedPresentationView />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/print-runs" element={<PrintRuns />} />
              <Route path="/print-runs/create" element={<CreatePrintRun />} />
              <Route path="/print-runs/:id" element={<PrintRunDetail />} />
              <Route path="/print-runs/:id/edit" element={<EditPrintRun />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/sales-orders/create" element={<CreateSalesOrder />} />
              <Route path="/sales-orders/:id" element={<SalesOrderDetail />} />
              <Route path="/sales-orders/:id/edit" element={<EditSalesOrder />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/purchase-orders/create" element={<CreatePurchaseOrder />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
              <Route path="/purchase-orders/:id/edit" element={<EditPurchaseOrder />} />
              <Route path="/sales-presentations" element={<SalesPresentations />} />
              <Route path="/sales-presentations/create" element={<CreateSalesPresentation />} />
              <Route path="/sales-presentations/:id" element={<SalesPresentationDetail />} />
              <Route path="/sales-presentations/:id/edit" element={<EditSalesPresentation />} />
              
              {/* New analytics route */}
              <Route path="/sales-presentations/:id/analytics" element={<PresentationAnalytics />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
