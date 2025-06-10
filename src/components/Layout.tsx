
import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { NavigationHeader } from './navigation/NavigationHeader';
import DesktopSidebar from './navigation/DesktopSidebar';
import MobileNavigation from './navigation/MobileNavigation';
import BreadcrumbNavigation from './navigation/BreadcrumbNavigation';
import Footer from './navigation/Footer';
import { AIAssistant } from './ai-assistant/AIAssistant';
import { getNavigationMenuItems } from './navigation/NavigationMenuItems';

const Layout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = getNavigationMenuItems();

  // Get current page label for mobile navigation
  const getCurrentPageLabel = () => {
    const currentPath = location.pathname;
    
    // Check main menu items
    const menuItem = menuItems.find(item => item.path === currentPath);
    if (menuItem) return menuItem.label;
    
    // Check submenu items
    for (const item of menuItems) {
      if (item.submenu) {
        const subItem = item.submenu.find(subItem => 
          currentPath === subItem.path || 
          (currentPath.includes(subItem.path) && subItem.path !== '/')
        );
        if (subItem) return subItem.label;
      }
    }
    
    // Default fallback
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1">
        <DesktopSidebar menuItems={menuItems} />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
            <div className="container mx-auto px-4 py-3">
              <BreadcrumbNavigation />
            </div>
          </div>
          <div className="flex-1 container mx-auto p-4">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
      <MobileNavigation 
        menuItems={menuItems} 
        currentPageLabel={getCurrentPageLabel()}
      />
      
      {/* AI Assistant - now integrated into every page */}
      <AIAssistant 
        currentPage={location.pathname}
        contextData={{
          route: location.pathname,
          search: location.search
        }}
      />
    </div>
  );
};

export default Layout;
