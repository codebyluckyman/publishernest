import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import Formats from "./pages/Formats";
import Products from "./pages/Products";
import PublishingProgram from "./pages/PublishingProgram";
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
import QuoteRequests from "./pages/QuoteRequests";
import Quotes from "./pages/Quotes";
import QuoteComparison from "./pages/QuoteComparison";
import PrintRuns from "./pages/PrintRuns";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import CreateCustomer from "./pages/CreateCustomer";
import SupplierQuoteDetail from "./pages/SupplierQuoteDetail";
import Organizations from "./pages/Organizations";
import Stock from "./pages/Stock";
import EditPurchaseOrder from "./pages/EditPurchaseOrder";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <ProtectedRoute><Index /></ProtectedRoute>
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
        path: "publishing-program",
        element: <ProtectedRoute><PublishingProgram /></ProtectedRoute>
      },
      {
        path: "quote-requests",
        element: <ProtectedRoute><QuoteRequests /></ProtectedRoute>
      },
      {
        path: "quotes",
        element: <ProtectedRoute><Quotes /></ProtectedRoute>
      },
      {
        path: "quotes/compare",
        element: <ProtectedRoute><QuoteComparison /></ProtectedRoute>
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
        path: "purchase-orders/create",
        element: <ProtectedRoute><CreatePurchaseOrder /></ProtectedRoute>
      },
      {
        path: "purchase-orders/edit/:id",
        element: <ProtectedRoute><EditPurchaseOrder /></ProtectedRoute>
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
      },
      {
        path: "print-runs",
        element: <ProtectedRoute><PrintRuns /></ProtectedRoute>
      },
      {
        path: "suppliers",
        element: <ProtectedRoute><Suppliers /></ProtectedRoute>
      },
      {
        path: "customers",
        element: <ProtectedRoute><Customers /></ProtectedRoute>
      },
      {
        path: "customers/:id",
        element: <ProtectedRoute><CustomerDetail /></ProtectedRoute>
      },
      {
        path: "customers/create",
        element: <ProtectedRoute><CreateCustomer /></ProtectedRoute>
      },
      {
        path: "supplier-quotes/:id",
        element: <ProtectedRoute><SupplierQuoteDetail /></ProtectedRoute>
      },
      {
        path: "organizations",
        element: <ProtectedRoute><Organizations /></ProtectedRoute>
      },
      {
        path: "stock",
        element: <ProtectedRoute><Stock /></ProtectedRoute>
      }
    ]
  },
  {
    path: "/shared/presentation/:accessCode",
    element: <SharedPresentationView />
  },
  {
    path: "/auth",
    element: <Auth />
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
