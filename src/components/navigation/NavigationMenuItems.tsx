import { FileText, LayoutDashboard, ShoppingCart } from "lucide-react";

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
