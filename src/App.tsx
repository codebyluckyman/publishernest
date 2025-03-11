
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/Layout";
import Dashboard from "./pages/Index";
import Products from "./pages/Products";
import Formats from "./pages/Formats";
import Organizations from "./pages/Organizations";
import Profile from "./pages/Profile";
import Stock from "./pages/Stock";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Suppliers from "./pages/Suppliers";
import Quotes from "./pages/Quotes";
import QuoteRequests from "./pages/QuoteRequests";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <OrganizationProvider>
            <Toaster />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/stock" element={
                <ProtectedRoute>
                  <Layout>
                    <Stock />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/formats" element={
                <ProtectedRoute>
                  <Layout>
                    <Formats />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <Layout>
                    <Suppliers />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <Layout>
                    <Quotes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/quote-requests" element={
                <ProtectedRoute>
                  <Layout>
                    <QuoteRequests />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/organizations" element={
                <ProtectedRoute>
                  <Layout>
                    <Organizations />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/shipments" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OrganizationProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
