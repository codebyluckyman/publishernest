import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import Auth from './pages/Auth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Formats from './pages/Formats';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import PrintRuns from './pages/PrintRuns';
import PurchaseOrders from './pages/PurchaseOrders';
import SalesOrders from './pages/SalesOrders';
import SalesPresentations from './pages/SalesPresentations';
import SalesPresentationDetail from './pages/SalesPresentationDetail';
import SalesPresentationEdit from './pages/SalesPresentationEdit';
import NotFound from './pages/NotFound';

// Add this import for the shared presentation view
import SharedPresentationView from './pages/SharedPresentationView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/shared/presentation/:accessCode" element={<SharedPresentationView />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/formats" element={<Formats />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/print-runs" element={<PrintRuns />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/sales-presentations" element={<SalesPresentations />} />
              <Route path="/sales-presentations/create" element={<SalesPresentationEdit />} />
              <Route path="/sales-presentations/:id" element={<SalesPresentationDetail />} />
              <Route path="/sales-presentations/:id/edit" element={<SalesPresentationEdit />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
