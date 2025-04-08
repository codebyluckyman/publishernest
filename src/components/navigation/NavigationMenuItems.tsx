import {
  HomeIcon,
  LayoutIcon,
  Package2Icon,
  BuildingIcon,
  FileTextIcon,
  PrinterIcon,
  ClipboardListIcon,
  PackageIcon,
  ShoppingCartIcon
} from 'lucide-react';
import { MainNavItem } from "@/types"

interface Props {
  items: MainNavItem[]
}

export const NavigationMenuItems = ({ items }: Props) => {
  return (
    <>
      {items?.length ? (
        items.map((item) => (
          item.href ? (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center text-sm font-medium transition-colors hover:text-foreground"
            >
              {item.icon && (
                <item.icon className="mr-2 h-4 w-4" />
              )}
              {item.title}
            </a>
          ) : null
        ))
      ) : null}
    </>
  )
}

export const navigationItems = [
  {
    id: 'home',
    name: 'Home',
    path: '/',
    icon: <HomeIcon className="h-5 w-5" />
  },
  {
    id: 'formats',
    name: 'Formats',
    path: '/formats',
    icon: <LayoutIcon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'products',
    name: 'Products',
    path: '/products',
    icon: <Package2Icon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'suppliers',
    name: 'Suppliers',
    path: '/suppliers',
    icon: <BuildingIcon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'quotes',
    name: 'Quote Requests',
    path: '/quotes',
    icon: <FileTextIcon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'print-runs',
    name: 'Print Runs',
    path: '/print-runs',
    icon: <PrinterIcon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'purchase-orders',
    name: 'Purchase Orders',
    path: '/purchase-orders',
    icon: <ClipboardListIcon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'sales-orders',
    name: 'Sales Orders',
    path: '/sales-orders',
    icon: <ShoppingCartIcon className="h-5 w-5" />,
    requiresAuth: true
  },
  {
    id: 'stock',
    name: 'Stock',
    path: '/stock',
    icon: <PackageIcon className="h-5 w-5" />,
    requiresAuth: true
  }
];

