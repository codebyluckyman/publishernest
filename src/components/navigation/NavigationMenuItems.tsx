
import { 
  BarChart3, 
  Package, 
  BookOpen, 
  Archive, 
  ShoppingCart, 
  Truck, 
  Building,
  LayoutDashboard,
  Store,
  FileText,
  MessageSquarePlus,
  Warehouse,
  Printer,
  ClipboardList
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  label: string;
  path: string;
  icon: LucideIcon;
  submenu?: MenuItem[];
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
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Formats",
    href: "/formats",
    icon: <BookOpen className="h-5 w-5" />,
  },  
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: <Store className="h-5 w-5" />,
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: <FileText className="h-5 w-5" />,
    submenu: [
      {
        title: "Quote Requests",
        href: "/quote-requests",
        icon: <MessageSquarePlus className="h-5 w-5" />,
      },
      {
        title: "Quotes",
        href: "/quotes",
        icon: <FileText className="h-5 w-5" />,
      }
    ]
  },
  {
    title: "Production",
    href: "/production",
    icon: <Printer className="h-5 w-5" />,
    submenu: [
      {
        title: "Print Runs",
        href: "/print-runs",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        title: "Purchase Orders",
        href: "/purchase-orders",
        icon: <ShoppingCart className="h-5 w-5" />,
      }
    ]
  },
  {
    title: "Shipments",
    href: "/shipments",
    icon: <Truck className="h-5 w-5" />,
  },  
  {
    title: "Stock Management",
    href: "/stock",
    icon: <Warehouse className="h-5 w-5" />,
  },    
  {
    title: "Organizations",
    href: "/organizations",
    icon: <Building className="h-5 w-5" />,
  },  
];

// Function to convert the navigation items to MenuItem objects for use in different components
export function getNavigationMenuItems(): MenuItem[] {
  return navigationItems.map(item => {
    // Create the MenuItem object
    const menuItem: MenuItem = {
      title: item.title,
      label: item.title, // Using title as label
      path: item.href,
      icon: item.icon.type,
      submenu: item.submenu ? item.submenu.map(subItem => ({
        title: subItem.title,
        label: subItem.title,
        path: subItem.href,
        icon: subItem.icon.type
      })) : undefined
    };
    
    return menuItem;
  });
}
