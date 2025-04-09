
import { 
  LayoutDashboard, 
  Book, 
  Landmark, 
  ShoppingCart, 
  FileText, 
  ClipboardList,
  Presentation,
  Settings, 
  Users,
  Building,
  CreditCard,
  Truck,
  Map,
  Calculator
} from 'lucide-react';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  submenu?: MenuItem[];
}

export const NavigationMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    path: '/products',
    icon: Book,
  },
  {
    label: 'Formats',
    path: '/formats',
    icon: ClipboardList,
  },
  {
    label: 'Quote Requests',
    path: '/quote-requests',
    icon: FileText,
  },
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    icon: ShoppingCart,
  },
  {
    label: 'Sales Orders',
    path: '/sales-orders',
    icon: CreditCard,
  },
  {
    label: 'Sales Presentations',
    path: '/sales-presentations',
    icon: Presentation,
  },
  {
    label: 'Organization',
    path: '/organization-settings',
    icon: Landmark,
  },
];

export const getNavigationMenuItems = (): MenuItem[] => {
  return NavigationMenuItems;
};
