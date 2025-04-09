
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
  Calculator,
  FileSpreadsheet,
  FileCog,
  Store
} from 'lucide-react';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  submenu?: MenuItem[];
}

/**
 * Navigation Menu Structure
 * 
 * This file defines the application's navigation structure with three main categories:
 * 1. Quotes - For managing quote requests and supplier quotes
 * 2. Production - For managing suppliers, print runs, and purchase orders
 * 3. Sales - For managing customers and sales orders
 * 
 * Each main category has its own submenu items to provide organized access to related features.
 * DO NOT remove or restructure these main categories as they represent core application functionality.
 */
export const NavigationMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Quotes',
    path: '#',
    icon: FileSpreadsheet,
    submenu: [
      {
        label: 'Quote Requests',
        path: '/quote-requests',
        icon: FileText,
      },
      {
        label: 'Quotes',
        path: '/quotes',
        icon: FileCog,
      }
    ]
  },
  {
    label: 'Production',
    path: '#',
    icon: Building,
    submenu: [
      {
        label: 'Suppliers',
        path: '/suppliers',
        icon: Store,
      },
      {
        label: 'Print Runs',
        path: '/print-runs',
        icon: Map,
      },
      {
        label: 'Purchase Orders',
        path: '/purchase-orders',
        icon: ShoppingCart,
      }
    ]
  },
  {
    label: 'Sales',
    path: '#',
    icon: Calculator,
    submenu: [
      {
        label: 'Customers',
        path: '/customers',
        icon: Users,
      },
      {
        label: 'Sales Orders',
        path: '/sales-orders',
        icon: CreditCard,
      }
    ]
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
