
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/ProtectedRoute";

import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationProvider";
import { Toaster as SonnerToaster } from "sonner";

// Pages
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Formats from "./pages/Formats";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import OrganizationSettings from "./pages/OrganizationSettings";
import Organizations from "./pages/Organizations";
import Suppliers from "./pages/Suppliers";
import Stock from "./pages/Stock";
import QuoteRequests from "./pages/QuoteRequests";
import Quotes from "./pages/Quotes";
import SupplierQuoteDetail from "./pages/SupplierQuoteDetail";
import QuoteComparison from "./pages/QuoteComparison";

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <OrganizationProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Index />} />
                  <Route path="formats" element={<Formats />} />
                  <Route path="products" element={<Products />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="organization-settings" element={<OrganizationSettings />} />
                  <Route path="organizations" element={<Organizations />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="stock" element={<Stock />} />
                  <Route path="quote-requests" element={<QuoteRequests />} />
                  <Route path="quotes" element={<Quotes />} />
                  <Route path="quotes/:id" element={<SupplierQuoteDetail />} />
                  <Route path="quotes/compare" element={<QuoteComparison />} />
                </Route>

                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              <SonnerToaster position="top-right" richColors />
              <Toaster />
            </OrganizationProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
