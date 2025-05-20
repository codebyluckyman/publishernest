
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
import SharedPresentationView from './pages/SharedPresentationView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/auth" element={<div>Auth page</div>} />
            <Route path="/shared/presentation/:accessCode" element={<SharedPresentationView />} />
            
            {/* Protected routes */}
            <Route path="/" element={<div>Layout with protected routes</div>}>
              <Route path="/" element={<div>Dashboard</div>} />
              <Route path="/dashboard" element={<div>Dashboard</div>} />
              <Route path="/products" element={<div>Products</div>} />
              <Route path="/formats" element={<div>Formats</div>} />
              <Route path="/customers" element={<div>Customers</div>} />
              <Route path="/suppliers" element={<div>Suppliers</div>} />
              <Route path="/print-runs" element={<div>Print Runs</div>} />
              <Route path="/purchase-orders" element={<div>Purchase Orders</div>} />
              <Route path="/sales-orders" element={<div>Sales Orders</div>} />
              <Route path="/sales-presentations" element={<div>Sales Presentations</div>} />
              <Route path="/sales-presentations/create" element={<div>Create Presentation</div>} />
              <Route path="/sales-presentations/:id" element={<div>Sales Presentation Detail</div>} />
              <Route path="/sales-presentations/:id/edit" element={<div>Edit Presentation</div>} />
            </Route>
            
            <Route path="*" element={<div>NotFound</div>} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
