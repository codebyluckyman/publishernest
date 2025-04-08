
import { Home, LayoutGrid, FileText, Truck, FileCheck, Settings, Users, ShoppingCart } from "lucide-react";

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
    name: "Purchase Orders",
    label: "Purchase Orders",
    title: "Purchase Orders",
    href: "/purchase-orders",
    path: "/purchase-orders",
    icon: Truck,
  },
  {
    name: "Sales Orders",
    label: "Sales Orders",
    title: "Sales Orders",
    href: "/sales-orders",
    path: "/sales-orders",
    icon: ShoppingCart,
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
