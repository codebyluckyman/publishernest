
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load pages that we know exist
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/auth/Login'));
const Profile = lazy(() => import('../pages/auth/Profile'));
const Organizations = lazy(() => import('../pages/organizations/Organizations'));
const OrganizationSettings = lazy(() => import('../pages/organizations/OrganizationSettings'));
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
