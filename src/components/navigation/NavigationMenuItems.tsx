
import { FileText, LayoutDashboard, ShoppingCart } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/products",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Quote Requests",
    href: "/quote-requests",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: <FileText className="h-5 w-5" />,
  },
];

// Function to convert the navigation items to MenuItem objects for use in different components
export function getNavigationMenuItems(): MenuItem[] {
  return navigationItems.map(item => ({
    title: item.title,
    label: item.title, // Using title as label
    path: item.href,
    icon: item.icon.type
  }));
}
