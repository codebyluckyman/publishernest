
import { Home, LayoutGrid, FileText, Truck, FileCheck, Settings, Users } from "lucide-react";

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

export const NavigationMenuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Formats",
    href: "/formats",
    icon: LayoutGrid,
  },
  {
    name: "Products",
    href: "/products",
    icon: FileText,
  },
  {
    name: "Purchase Orders",
    href: "/purchase-orders",
    icon: Truck,
  },
  {
    name: "Sales Orders",
    href: "/sales-orders",
    icon: FileCheck,
  },
  {
    name: "Settings",
    href: "/organization-settings",
    icon: Settings,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: Users,
  },
];

export function getNavigationMenuItems() {
  return NavigationMenuItems;
}
