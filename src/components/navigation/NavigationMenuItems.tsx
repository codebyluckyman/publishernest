
import { Home, LayoutGrid, FileText, Truck, ShoppingCart, Settings, Users, FileCheck, Quote, Factory, ShoppingBag } from "lucide-react";

export interface MenuItem {
  name: string;
  href: string;
  path?: string; // Alias for href for backward compatibility
  label?: string; // Alias for name for backward compatibility
  title?: string; // Alias for name for backward compatibility
  icon: React.ElementType;
  submenu?: MenuItem[];
  children?: MenuItem[]; // Alias for submenu for backward compatibility
}

export const NavigationMenuItems = [
  {
    name: "Dashboard",
    label: "Dashboard",
    title: "Dashboard",
    href: "/",
    path: "/",
    icon: Home,
  },
  {
    name: "Formats",
    label: "Formats",
    title: "Formats",
    href: "/formats",
    path: "/formats",
    icon: LayoutGrid,
  },
  {
    name: "Products",
    label: "Products",
    title: "Products", 
    href: "/products",
    path: "/products",
    icon: FileText,
  },
  {
    name: "Quotes",
    label: "Quotes",
    title: "Quotes",
    href: "#",
    path: "#",
    icon: Quote,
    submenu: [
      {
        name: "Quote Requests",
        label: "Quote Requests",
        title: "Quote Requests",
        href: "/quote-requests",
        path: "/quote-requests",
        icon: FileText,
      },
      {
        name: "Supplier Quotes",
        label: "Supplier Quotes",
        title: "Supplier Quotes",
        href: "/quotes",
        path: "/quotes",
        icon: Quote,
      }
    ]
  },
  {
    name: "Production",
    label: "Production",
    title: "Production",
    href: "#",
    path: "#",
    icon: Factory,
    submenu: [
      {
        name: "Print Runs",
        label: "Print Runs",
        title: "Print Runs",
        href: "/print-runs",
        path: "/print-runs",
        icon: FileCheck,
      },
      {
        name: "Purchase Orders",
        label: "Purchase Orders",
        title: "Purchase Orders",
        href: "/purchase-orders",
        path: "/purchase-orders",
        icon: Truck,
      }
    ]
  },
  {
    name: "Sales",
    label: "Sales",
    title: "Sales",
    href: "#",
    path: "#",
    icon: ShoppingBag,
    submenu: [
      {
        name: "Customers",
        label: "Customers",
        title: "Customers",
        href: "/customers",
        path: "/customers",
        icon: Users,
      },
      {
        name: "Sales Orders",
        label: "Sales Orders",
        title: "Sales Orders",
        href: "/sales-orders",
        path: "/sales-orders",
        icon: ShoppingCart,
      }
    ]
  },
  {
    name: "Settings",
    label: "Settings",
    title: "Settings",
    href: "/organization-settings",
    path: "/organization-settings",
    icon: Settings,
  },
  {
    name: "Profile",
    label: "Profile", 
    title: "Profile",
    href: "/profile",
    path: "/profile",
    icon: Users,
  },
];

export function getNavigationMenuItems() {
  return NavigationMenuItems;
}
