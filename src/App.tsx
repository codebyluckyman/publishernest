import {
  createBrowserRouter,
} from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";
import { ProductDetail } from "@/pages/ProductDetail";
import { EditProduct } from "@/pages/EditProduct";
import { CreateProduct } from "@/pages/CreateProduct";
import { Formats } from "@/pages/Formats";
import { FormatDetail } from "@/pages/FormatDetail";
import { EditFormat } from "@/pages/EditFormat";
import { CreateFormat } from "@/pages/CreateFormat";
import { Suppliers } from "@/pages/Suppliers";
import { SupplierDetail } from "@/pages/SupplierDetail";
import { EditSupplier } from "@/pages/EditSupplier";
import { CreateSupplier } from "@/pages/CreateSupplier";
import { Customers } from "@/pages/Customers";
import { CustomerDetail } from "@/pages/CustomerDetail";
import { EditCustomer } from "@/pages/EditCustomer";
import { CreateCustomer } from "@/pages/CreateCustomer";
import { DeliveryLocations } from "@/pages/DeliveryLocations";
import { DeliveryLocationDetail } from "@/pages/DeliveryLocationDetail";
import { EditDeliveryLocation } from "@/pages/EditDeliveryLocation";
import { CreateDeliveryLocation } from "@/pages/CreateDeliveryLocation";
import { Users } from "@/pages/Users";
import { UserDetail } from "@/pages/UserDetail";
import { EditUser } from "@/pages/EditUser";
import { CreateUser } from "@/pages/CreateUser";
import { Settings } from "@/pages/Settings";
import { SalesOrders } from "@/pages/SalesOrders";
import { SalesOrderDetail } from "@/pages/SalesOrderDetail";
import { EditSalesOrder } from "@/pages/EditSalesOrder";
import { CreateSalesOrder } from "@/pages/CreateSalesOrder";
import { PurchaseOrders } from "@/pages/PurchaseOrders";
import { PurchaseOrderDetail } from "@/pages/PurchaseOrderDetail";
import { EditPurchaseOrder } from "@/pages/EditPurchaseOrder";
import { CreatePurchaseOrder } from "@/pages/CreatePurchaseOrder";
import { PrintRuns } from "@/pages/PrintRuns";
import { PrintRunDetail } from "@/pages/PrintRunDetail";
import { EditPrintRun } from "@/pages/EditPrintRun";
import { CreatePrintRun } from "@/pages/CreatePrintRun";
import { QuoteRequests } from "@/pages/QuoteRequests";
import { QuoteRequestDetail } from "@/pages/QuoteRequestDetail";
import { EditQuoteRequest } from "@/pages/EditQuoteRequest";
import { CreateQuoteRequest } from "@/pages/CreateQuoteRequest";
import { SupplierQuotes } from "@/pages/SupplierQuotes";
import { SupplierQuoteDetail } from "@/pages/SupplierQuoteDetail";
import { EditSupplierQuote } from "@/pages/EditSupplierQuote";
import { CreateSupplierQuote } from "@/pages/CreateSupplierQuote";
import { Billing } from "@/pages/Billing";
import { SalesPresentations } from "@/pages/SalesPresentations";
import { CreateSalesPresentation } from "@/pages/CreateSalesPresentation";
import { SalesPresentationDetail } from "@/pages/SalesPresentationDetail";
import { EditSalesPresentation } from "@/pages/EditSalesPresentation";
import { SharedPresentationView } from "@/pages/SharedPresentationView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: "/products",
    element: <Layout><Products /></Layout>,
  },
  {
    path: "/products/:id",
    element: <Layout><ProductDetail /></Layout>,
  },
  {
    path: "/products/:id/edit",
    element: <Layout><EditProduct /></Layout>,
  },
  {
    path: "/products/create",
    element: <Layout><CreateProduct /></Layout>,
  },
  {
    path: "/formats",
    element: <Layout><Formats /></Layout>,
  },
  {
    path: "/formats/:id",
    element: <Layout><FormatDetail /></Layout>,
  },
  {
    path: "/formats/:id/edit",
    element: <Layout><EditFormat /></Layout>,
  },
  {
    path: "/formats/create",
    element: <Layout><CreateFormat /></Layout>,
  },
  {
    path: "/suppliers",
    element: <Layout><Suppliers /></Layout>,
  },
  {
    path: "/suppliers/:id",
    element: <Layout><SupplierDetail /></Layout>,
  },
  {
    path: "/suppliers/:id/edit",
    element: <Layout><EditSupplier /></Layout>,
  },
  {
    path: "/suppliers/create",
    element: <Layout><CreateSupplier /></Layout>,
  },
  {
    path: "/customers",
    element: <Layout><Customers /></Layout>,
  },
  {
    path: "/customers/:id",
    element: <Layout><CustomerDetail /></Layout>,
  },
  {
    path: "/customers/:id/edit",
    element: <Layout><EditCustomer /></Layout>,
  },
  {
    path: "/customers/create",
    element: <Layout><CreateCustomer /></Layout>,
  },
  {
    path: "/delivery-locations",
    element: <Layout><DeliveryLocations /></Layout>,
  },
  {
    path: "/delivery-locations/:id",
    element: <Layout><DeliveryLocationDetail /></Layout>,
  },
  {
    path: "/delivery-locations/:id/edit",
    element: <Layout><EditDeliveryLocation /></Layout>,
  },
  {
    path: "/delivery-locations/create",
    element: <Layout><CreateDeliveryLocation /></Layout>,
  },
  {
    path: "/users",
    element: <Layout><Users /></Layout>,
  },
  {
    path: "/users/:id",
    element: <Layout><UserDetail /></Layout>,
  },
  {
    path: "/users/:id/edit",
    element: <Layout><EditUser /></Layout>,
  },
  {
    path: "/users/create",
    element: <Layout><CreateUser /></Layout>,
  },
  {
    path: "/settings",
    element: <Layout><Settings /></Layout>,
  },
  {
    path: "/sales-orders",
    element: <Layout><SalesOrders /></Layout>,
  },
  {
    path: "/sales-orders/:id",
    element: <Layout><SalesOrderDetail /></Layout>,
  },
  {
    path: "/sales-orders/:id/edit",
    element: <Layout><EditSalesOrder /></Layout>,
  },
  {
    path: "/sales-orders/create",
    element: <Layout><CreateSalesOrder /></Layout>,
  },
  {
    path: "/purchase-orders",
    element: <Layout><PurchaseOrders /></Layout>,
  },
  {
    path: "/purchase-orders/:id",
    element: <Layout><PurchaseOrderDetail /></Layout>,
  },
  {
    path: "/purchase-orders/:id/edit",
    element: <Layout><EditPurchaseOrder /></Layout>,
  },
  {
    path: "/purchase-orders/create",
    element: <Layout><CreatePurchaseOrder /></Layout>,
  },
  {
    path: "/print-runs",
    element: <Layout><PrintRuns /></Layout>,
  },
  {
    path: "/print-runs/:id",
    element: <Layout><PrintRunDetail /></Layout>,
  },
  {
    path: "/print-runs/:id/edit",
    element: <Layout><EditPrintRun /></Layout>,
  },
  {
    path: "/print-runs/create",
    element: <Layout><CreatePrintRun /></Layout>,
  },
  {
    path: "/quote-requests",
    element: <Layout><QuoteRequests /></Layout>,
  },
  {
    path: "/quote-requests/:id",
    element: <Layout><QuoteRequestDetail /></Layout>,
  },
  {
    path: "/quote-requests/:id/edit",
    element: <Layout><EditQuoteRequest /></Layout>,
  },
  {
    path: "/quote-requests/create",
    element: <Layout><CreateQuoteRequest /></Layout>,
  },
  {
    path: "/supplier-quotes",
    element: <Layout><SupplierQuotes /></Layout>,
  },
  {
    path: "/supplier-quotes/:id",
    element: <Layout><SupplierQuoteDetail /></Layout>,
  },
  {
    path: "/supplier-quotes/:id/edit",
    element: <Layout><EditSupplierQuote /></Layout>,
  },
  {
    path: "/supplier-quotes/create",
    element: <Layout><CreateSupplierQuote /></Layout>,
  },
  {
    path: "/billing",
    element: <Layout><Billing /></Layout>,
  },
  {
    path: "/sales-presentations",
    element: <Layout><SalesPresentations /></Layout>,
  },
  {
    path: "/sales-presentations/create",
    element: <Layout><CreateSalesPresentation /></Layout>,
  },
  {
    path: "/sales-presentations/:id",
    element: <Layout><SalesPresentationDetail /></Layout>,
  },
  {
    path: "/sales-presentations/:id/edit",
    element: <Layout><EditSalesPresentation /></Layout>,
  },
  {
    path: "/shared/presentation/:accessCode",
    element: <SharedPresentationView />,
  },
]);

export default router;
