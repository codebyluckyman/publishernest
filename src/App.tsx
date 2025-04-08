
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationProvider";
import { routes, protectedRoutes } from "./routes/routesConfig";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <Routes>
              {/* Public routes */}
              {routes.map((route) => (
                <Route 
                  key={route.path} 
                  path={route.path} 
                  element={route.element} 
                />
              ))}
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
                {protectedRoutes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={route.element} 
                  />
                ))}
              </Route>
            </Routes>
          </Suspense>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
