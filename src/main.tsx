import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import NotFound from './components/NotFound'
import Index from './components/Index'
import ProtectedRoute from './components/ProtectedRoute'
import Formats from './components/Formats'
import Products from './components/Products'
import PurchaseOrders from './components/PurchaseOrders'
import PurchaseOrderDetail from './components/PurchaseOrderDetail'
import CreatePurchaseOrder from './components/CreatePurchaseOrder'
import SalesOrders from './components/SalesOrders'
import OrganizationSettings from './components/OrganizationSettings'
import Profile from './components/Profile'
import Auth from './components/Auth'

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
