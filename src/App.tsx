
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import Formats from "./pages/Formats";
import Products from "./pages/Products";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";
import SalesOrders from "./pages/SalesOrders";
import SalesOrderDetail from "./pages/SalesOrderDetail";
import CreateSalesOrder from "./pages/CreateSalesOrder";
import OrganizationSettings from "./pages/OrganizationSettings";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import SalesPresentations from "./pages/SalesPresentations";
import CreateSalesPresentation from "./pages/CreateSalesPresentation";
import SalesPresentationDetail from "./pages/SalesPresentationDetail";
import EditSalesPresentation from "./pages/EditSalesPresentation";
import SharedPresentationView from "./pages/SharedPresentationView";

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
        path: "create-sales-order",
        element: <ProtectedRoute><CreateSalesOrder /></ProtectedRoute>
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
      },
      {
        path: "sales-presentations",
        element: <ProtectedRoute><SalesPresentations /></ProtectedRoute>
      },
      {
        path: "sales-presentations/create",
        element: <ProtectedRoute><CreateSalesPresentation /></ProtectedRoute>
      },
      {
        path: "sales-presentations/:id",
        element: <ProtectedRoute><SalesPresentationDetail /></ProtectedRoute>
      },
      {
        path: "sales-presentations/:id/edit",
        element: <ProtectedRoute><EditSalesPresentation /></ProtectedRoute>
      }
    ]
  },
  {
    path: "/shared/presentation/:accessCode",
    element: <SharedPresentationView />
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
