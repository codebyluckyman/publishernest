
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/auth/Login'));
const Profile = lazy(() => import('../pages/auth/Profile'));
const Organizations = lazy(() => import('../pages/organizations/Organizations'));
const OrganizationSettings = lazy(() => import('../pages/organizations/OrganizationSettings'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const FormatsPage = lazy(() => import('../pages/FormatsPage'));
const FormatDetailPage = lazy(() => import('../pages/FormatDetailPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const QuoteRequestsPage = lazy(() => import('../pages/QuoteRequestsPage'));
const QuoteRequestDetailPage = lazy(() => import('../pages/QuoteRequestDetailPage'));
const SuppliersPage = lazy(() => import('../pages/SuppliersPage'));
const SupplierDetailPage = lazy(() => import('../pages/SupplierDetailPage'));
const QuotesPage = lazy(() => import('../pages/QuotesPage'));
const SupplierQuoteDetail = lazy(() => import('../pages/SupplierQuoteDetail'));
const SupplierQuoteCreate = lazy(() => import('../pages/SupplierQuoteCreate'));
const PrintRunsPage = lazy(() => import('../pages/PrintRunsPage'));
const PurchaseOrdersPage = lazy(() => import('../pages/PurchaseOrdersPage'));
const CreatePurchaseOrderPage = lazy(() => import('../pages/CreatePurchaseOrderPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Define path constants to avoid typos
export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  ORGANIZATIONS: "/organizations",
  ORGANIZATION_SETTINGS: "/organizations/:id/settings",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  FORMATS: "/formats",
  FORMAT_DETAIL: "/formats/:id",
  QUOTE_REQUESTS: "/quote-requests",
  QUOTE_REQUEST_DETAIL: "/quote-requests/:id",
  SUPPLIERS: "/suppliers",
  SUPPLIER_DETAIL: "/suppliers/:id",
  QUOTES: "/quotes",
  QUOTE_NEW: "/quotes/new",
  QUOTE_DETAIL: "/quotes/:id",
  QUOTE_DETAILS: "/quotes/:id/details",
  PRINT_RUNS: "/print-runs",
  PURCHASE_ORDERS: "/purchase-orders",
  PURCHASE_ORDER_NEW: "/purchase-orders/new",
  NOT_FOUND: "*"
};

// Export the routes config
export const routes: RouteObject[] = [
  {
    path: PATHS.LOGIN,
    element: <Login />
  },
  {
    path: PATHS.NOT_FOUND,
    element: <NotFound />
  }
];

// Export protected routes that require authentication
export const protectedRoutes: RouteObject[] = [
  {
    path: PATHS.HOME,
    element: <Dashboard />
  },
  {
    path: PATHS.PROFILE,
    element: <Profile />
  },
  {
    path: PATHS.ORGANIZATIONS,
    element: <Organizations />
  },
  {
    path: PATHS.ORGANIZATION_SETTINGS,
    element: <OrganizationSettings />
  },
  {
    path: PATHS.PRODUCTS,
    element: <ProductsPage />
  },
  {
    path: PATHS.PRODUCT_DETAIL,
    element: <ProductDetailPage />
  },
  {
    path: PATHS.FORMATS,
    element: <FormatsPage />
  },
  {
    path: PATHS.FORMAT_DETAIL,
    element: <FormatDetailPage />
  },
  {
    path: PATHS.QUOTE_REQUESTS,
    element: <QuoteRequestsPage />
  },
  {
    path: PATHS.QUOTE_REQUEST_DETAIL,
    element: <QuoteRequestDetailPage />
  },
  {
    path: PATHS.SUPPLIERS,
    element: <SuppliersPage />
  },
  {
    path: PATHS.SUPPLIER_DETAIL,
    element: <SupplierDetailPage />
  },
  {
    path: PATHS.QUOTES,
    element: <QuotesPage />
  },
  {
    path: PATHS.QUOTE_NEW,
    element: <SupplierQuoteCreate />
  },
  {
    path: PATHS.QUOTE_DETAIL,
    element: <SupplierQuoteDetail />
  },
  {
    path: PATHS.QUOTE_DETAILS,
    element: <SupplierQuoteDetail />
  },
  {
    path: PATHS.PRINT_RUNS,
    element: <PrintRunsPage />
  },
  {
    path: PATHS.PURCHASE_ORDERS,
    element: <PurchaseOrdersPage />
  },
  {
    path: PATHS.PURCHASE_ORDER_NEW,
    element: <CreatePurchaseOrderPage />
  }
];
