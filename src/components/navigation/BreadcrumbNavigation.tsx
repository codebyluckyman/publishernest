
import { useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem, getNavigationMenuItems } from "./NavigationMenuItems";

interface BreadcrumbNavigationProps {
  className?: string;
}

const BreadcrumbNavigation = ({ className }: BreadcrumbNavigationProps) => {
  const location = useLocation();
  const menuItems = getNavigationMenuItems();
  
  // Split the current path into segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // If we're on the root path, don't show breadcrumbs
  if (pathSegments.length === 0) {
    return null;
  }
  
  // Create breadcrumb items based on path segments
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const menuItem = menuItems.find(item => item.path === path);
    
    return {
      label: menuItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
      path
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4", className)}>
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li className="flex items-center">
          <a
            href="/"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <a
              href={item.path}
              className={cn(
                "hover:text-foreground transition-colors", 
                index === breadcrumbItems.length - 1 ? "font-medium text-foreground" : ""
              )}
              aria-current={index === breadcrumbItems.length - 1 ? "page" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;
