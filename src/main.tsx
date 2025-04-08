
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Index from './pages/Index'
import ProtectedRoute from './components/ProtectedRoute'
import Formats from './pages/Formats'
import Products from './pages/Products'
import PurchaseOrders from './pages/PurchaseOrders'
import PurchaseOrderDetail from './pages/PurchaseOrderDetail'
import CreatePurchaseOrder from './pages/CreatePurchaseOrder'
import SalesOrders from './pages/SalesOrders'
import SalesOrderDetail from './pages/SalesOrderDetail'
import OrganizationSettings from './pages/OrganizationSettings'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: "formats",
        element: <ProtectedRoute><Formats /></ProtectedRoute>
      },
      {
        path: "products",
        element: <ProtectedRoute><Products /></ProtectedRoute>
      },
      {
        path: "purchase-orders",
        element: <ProtectedRoute><PurchaseOrders /></ProtectedRoute>
      },
      {
        path: "purchase-orders/:id",
        element: <ProtectedRoute><PurchaseOrderDetail /></ProtectedRoute>
      },
      {
        path: "create-purchase-order",
        element: <ProtectedRoute><CreatePurchaseOrder /></ProtectedRoute>
      },
      {
        path: "sales-orders",
        element: <ProtectedRoute><SalesOrders /></ProtectedRoute>
      },
      {
        path: "sales-orders/:id",
        element: <ProtectedRoute><SalesOrderDetail /></ProtectedRoute>
      },
      {
        path: "organization-settings",
        element: <ProtectedRoute><OrganizationSettings /></ProtectedRoute>
      },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: "auth",
        element: <Auth />
      }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(<App />);
