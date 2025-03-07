
import { 
  BarChart3, 
  Package, 
  BookOpen, 
  Archive, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Building 
} from "lucide-react";

export interface MenuItem {
  icon: typeof BarChart3;
  label: string;
  path: string;
}

export const getNavigationMenuItems = (): MenuItem[] => {
  return [
    { icon: BarChart3, label: "Dashboard", path: "/" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: BookOpen, label: "Formats", path: "/formats" },
    { icon: Archive, label: "Stock", path: "/stock" },
    { icon: FileText, label: "Quotes", path: "/quotes" },
    { icon: ShoppingCart, label: "Purchase Orders", path: "/orders" },
    { icon: Truck, label: "Shipments", path: "/shipments" },
    { icon: Building, label: "Organizations", path: "/organizations" }
  ];
};
