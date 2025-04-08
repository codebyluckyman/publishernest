
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

// Create a mapping of components for routes
export const routeComponents = {
  login: Login,
  notFound: NotFound,
  dashboard: Dashboard,
  profile: Profile,
  organizations: Organizations,
  organizationSettings: OrganizationSettings,
  products: ProductsPage,
  productDetail: ProductDetailPage,
  formats: FormatsPage,
  formatDetail: FormatDetailPage,
  quoteRequests: QuoteRequestsPage,
  quoteRequestDetail: QuoteRequestDetailPage,
  suppliers: SuppliersPage,
  supplierDetail: SupplierDetailPage,
  quotes: QuotesPage,
  quoteNew: SupplierQuoteCreate,
  quoteDetail: SupplierQuoteDetail,
  printRuns: PrintRunsPage,
  purchaseOrders: PurchaseOrdersPage,
  purchaseOrderNew: CreatePurchaseOrderPage
};

// Export the routes config without using JSX
export const routes: RouteObject[] = [
  {
    path: PATHS.LOGIN,
    element: { type: routeComponents.login }
  },
  {
    path: PATHS.NOT_FOUND,
    element: { type: routeComponents.notFound }
  }
];

// Export protected routes that require authentication
export const protectedRoutes: RouteObject[] = [
  {
    path: PATHS.HOME,
    element: { type: routeComponents.dashboard }
  },
  {
    path: PATHS.PROFILE,
    element: { type: routeComponents.profile }
  },
  {
    path: PATHS.ORGANIZATIONS,
    element: { type: routeComponents.organizations }
  },
  {
    path: PATHS.ORGANIZATION_SETTINGS,
    element: { type: routeComponents.organizationSettings }
  },
  {
    path: PATHS.PRODUCTS,
    element: { type: routeComponents.products }
  },
  {
    path: PATHS.PRODUCT_DETAIL,
    element: { type: routeComponents.productDetail }
  },
  {
    path: PATHS.FORMATS,
    element: { type: routeComponents.formats }
  },
  {
    path: PATHS.FORMAT_DETAIL,
    element: { type: routeComponents.formatDetail }
  },
  {
    path: PATHS.QUOTE_REQUESTS,
    element: { type: routeComponents.quoteRequests }
  },
  {
    path: PATHS.QUOTE_REQUEST_DETAIL,
    element: { type: routeComponents.quoteRequestDetail }
  },
  {
    path: PATHS.SUPPLIERS,
    element: { type: routeComponents.suppliers }
  },
  {
    path: PATHS.SUPPLIER_DETAIL,
    element: { type: routeComponents.supplierDetail }
  },
  {
    path: PATHS.QUOTES,
    element: { type: routeComponents.quotes }
  },
  {
    path: PATHS.QUOTE_NEW,
    element: { type: routeComponents.quoteNew }
  },
  {
    path: PATHS.QUOTE_DETAIL,
    element: { type: routeComponents.quoteDetail }
  },
  {
    path: PATHS.QUOTE_DETAILS,
    element: { type: routeComponents.quoteDetail }
  },
  {
    path: PATHS.PRINT_RUNS,
    element: { type: routeComponents.printRuns }
  },
  {
    path: PATHS.PURCHASE_ORDERS,
    element: { type: routeComponents.purchaseOrders }
  },
  {
    path: PATHS.PURCHASE_ORDER_NEW,
    element: { type: routeComponents.purchaseOrderNew }
  }
];
