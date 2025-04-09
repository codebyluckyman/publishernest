import {
  BarChart,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  Package,
  Presentation,
  Receipt,
  Settings,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";

const dashboardItems = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
];

const productItems = [
  { label: "Products", path: "/products", icon: <Package className="h-4 w-4" /> },
  { label: "Formats", path: "/formats", icon: <FileText className="h-4 w-4" /> },
];

const purchaseItems = [
  { label: "Suppliers", path: "/suppliers", icon: <Building2 className="h-4 w-4" /> },
  { label: "Supplier Quotes", path: "/supplier-quotes", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Purchase Orders", path: "/purchase-orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Print Runs", path: "/print-runs", icon: <ListChecks className="h-4 w-4" /> },
];

const salesItems = [
  { label: "Sales Orders", path: "/sales-orders", icon: <Receipt className="h-4 w-4" /> },
  { label: "Sales Presentations", path: "/sales-presentations", icon: <Presentation className="h-4 w-4" /> },
];

const customerItems = [
  { label: "Customers", path: "/customers", icon: <Users className="h-4 w-4" /> },
  { label: "Customer Requirements", path: "/customer-requirements", icon: <User className="h-4 w-4" /> },
];

const reportItems = [
  { label: "Reports", path: "/reports", icon: <BarChart className="h-4 w-4" /> },
  { label: "Calendar", path: "/calendar", icon: <Calendar className="h-4 w-4" /> },
];

const settingsItems = [
  { label: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" /> },
];

export const NavigationMenuItems = {
  dashboardItems,
  productItems,
  purchaseItems,
  salesItems,
  customerItems,
  reportItems,
  settingsItems,
};
