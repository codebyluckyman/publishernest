
import { useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem, getNavigationMenuItems } from "./NavigationMenuItems";
import { usePublishingPrograms } from "@/hooks/usePublishingPrograms";

interface BreadcrumbNavigationProps {
  className?: string;
}

export const BreadcrumbNavigation = ({ className }: BreadcrumbNavigationProps) => {
  const location = useLocation();
  const menuItems = getNavigationMenuItems();
  
  // Make the publishing programs hook conditional to avoid errors
  let programs: any[] = [];
  try {
    const { programs: fetchedPrograms } = usePublishingPrograms();
    programs = fetchedPrograms || [];
  } catch (error) {
    // Silently handle error - programs will remain empty array
  }
  
  // Split the current path into segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // If we're on the root path, don't show breadcrumbs
  if (pathSegments.length === 0) {
    return null;
  }
  
  // Create breadcrumb items based on path segments
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    
    // Special handling for publishing program detail pages
    if (pathSegments[0] === 'publishing-programs' && index === 1) {
      // This is the program ID segment, try to find the program name
      const program = programs.find(p => p.id === segment);
      return {
        label: program ? program.name : 'Loading...',
        path
      };
    }
    
    // Check if this path matches a menu item
    const menuItem = menuItems.find(item => item.path === path);
    if (menuItem) {
      return {
        label: menuItem.label,
        path
      };
    }
    
    // Check submenu items
    for (const item of menuItems) {
      if (item.submenu) {
        const subItem = item.submenu.find(subItem => 
          path === subItem.path || 
          (path.includes(subItem.path) && subItem.path !== '/')
        );
        if (subItem) {
          return {
            label: subItem.label,
            path
          };
        }
      }
    }
    
    // Fallback to segment name
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center space-x-1 text-sm text-gray-700">
        <li className="flex items-center">
          <a
            href="/"
            className="flex items-center hover:text-gray-900 transition-colors text-gray-600"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <a
              href={item.path}
              className={cn(
                "hover:text-gray-900 transition-colors truncate", 
                index === breadcrumbItems.length - 1 ? "font-medium text-gray-900" : "text-gray-600"
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
