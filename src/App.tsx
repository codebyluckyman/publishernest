import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Auth } from "@/pages/Auth";
import { Formats } from "@/pages/Formats";
import { Products } from "@/pages/Products";
import { Suppliers } from "@/pages/Suppliers";
import { Organizations } from "@/pages/Organizations";
import { Users } from "@/pages/Users";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";
import { Layout } from "@/components/layout/Layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SupplierQuotes } from "@/pages/SupplierQuotes";
import { QuoteRequests } from "@/pages/QuoteRequests";
import { ProductSavedViews } from "@/pages/ProductSavedViews";
import { SalesPresentations } from "@/pages/SalesPresentations";
import { SalesPresentationDetail } from "@/pages/SalesPresentationDetail";
import { EditSalesPresentation } from "@/pages/EditSalesPresentation";
import { CreateSalesPresentation } from "@/pages/CreateSalesPresentation";
import SharedPresentationView from "@/pages/SharedPresentationView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster richColors closeButton position="top-center" />
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Public shared presentation route - no auth required */}
              <Route path="/shared/presentation/:accessCode" element={<SharedPresentationView />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/sales-presentations" />} />
                <Route path="/formats" element={<Formats />} />
                
                <Route path="/products" element={<Products />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/supplier-quotes" element={<SupplierQuotes />} />
                <Route path="/quote-requests" element={<QuoteRequests />} />
                <Route path="/product-saved-views" element={<ProductSavedViews />} />
                
                <Route path="/sales-presentations" element={<SalesPresentations />} />
                <Route
                  path="/sales-presentations/:id"
                  element={<SalesPresentationDetail />}
                />
                <Route
                  path="/sales-presentations/:id/edit"
                  element={<EditSalesPresentation />}
                />
                <Route
                  path="/sales-presentations/create"
                  element={<CreateSalesPresentation />}
                />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
