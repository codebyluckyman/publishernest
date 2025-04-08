
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationProvider";
import { routes, protectedRoutes, routeComponents } from "./routes/routesConfig";
import { createElement } from "react";
import "./App.css";

// Helper function to create route elements
const createRouteElement = (element: { type: React.LazyExoticComponent<() => JSX.Element> }) => {
  return createElement(element.type);
};

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
                  element={createRouteElement(route.element as any)} 
                />
              ))}
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
                {protectedRoutes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={createRouteElement(route.element as any)} 
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
