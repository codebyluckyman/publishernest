import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationHeader } from './navigation/NavigationHeader';
import { DesktopSidebar } from './navigation/DesktopSidebar';
import { MobileNavigation } from './navigation/MobileNavigation';
import { BreadcrumbNavigation } from './navigation/BreadcrumbNavigation';
import { Footer } from './navigation/Footer';
import { AIAssistant } from './ai-assistant/AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader />
      <div className="flex flex-1">
        <DesktopSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
            <div className="container mx-auto px-4 py-3">
              <BreadcrumbNavigation />
            </div>
          </div>
          <div className="flex-1 container mx-auto p-4">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      <MobileNavigation />
      
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
