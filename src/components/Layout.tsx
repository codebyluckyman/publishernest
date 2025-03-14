
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSidebar from "./navigation/DesktopSidebar";
import NavigationHeader from "./navigation/NavigationHeader";
import BreadcrumbNavigation from "./navigation/BreadcrumbNavigation";
import Footer from "./navigation/Footer";
import { getNavigationMenuItems } from "./navigation/NavigationMenuItems";

const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = getNavigationMenuItems();
  const currentPageLabel = menuItems.find(item => item.path === location.pathname)?.label || "Dashboard";
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex flex-col w-full bg-gray-50">
        <div className="flex flex-1 w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          <DesktopSidebar menuItems={menuItems} />
          
          <main className="flex-1 flex flex-col p-4 md:p-8 animate-fadeIn">
            <NavigationHeader currentPageLabel={currentPageLabel} menuItems={menuItems} />
            <BreadcrumbNavigation />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
