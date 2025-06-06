import { LucideIcon } from "lucide-react"
import { Book, Package, FileText, Users, BarChart3, BookOpen, Calendar, Printer, ShoppingCart, DollarSign, Truck, Package2, Presentation } from "lucide-react";

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon | string;
  submenu?: MenuItem[];
}

export const getNavigationMenuItems = (): MenuItem[] => [
  {
    label: "Formats",
    path: "/formats",
    icon: Book
  },
  {
    label: "Products",
    path: "/products",
    icon: Package
  },
  {
    label: "Quotes",
    path: "/quotes",
    icon: FileText,
    submenu: [
      {
        label: "Quote Requests",
        path: "/quote-requests",
        icon: FileText
      },
      {
        label: "Supplier Quotes",
        path: "/supplier-quotes",
        icon: Users
      },
      {
        label: "Quote Comparison",
        path: "/quote-comparison",
        icon: BarChart3
      }
    ]
  },
  {
    label: "Publishing",
    path: "/publishing",
    icon: BookOpen,
    submenu: [
      {
        label: "Publishing Program",
        path: "/publishing-program",
        icon: Calendar
      },
      {
        label: "Print Runs",
        path: "/print-runs",
        icon: Printer
      }
    ]
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
    submenu: [
      {
        label: "Purchase Orders",
        path: "/purchase-orders",
        icon: ShoppingCart
      },
      {
        label: "Sales Orders",
        path: "/sales-orders",
        icon: DollarSign
      }
    ]
  },
  {
    label: "Customers",
    path: "/customers",
    icon: Users
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: Truck
  },
  {
    label: "Stock",
    path: "/stock",
    icon: Package2
  },
  {
    label: "Sales Presentations",
    path: "/sales-presentations",
    icon: Presentation
  }
];
