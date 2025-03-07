
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Printer, ShoppingCart, Truck, BarChart3, Package, LogOut, User, Building, BookOpen, BellRing, HelpCircle, Archive, Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrganizationSwitcher from "./OrganizationSwitcher";
import NotificationsPopover from "./NotificationsPopover";
import HelpCenterPopover from "./HelpCenterPopover";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    user,
    signOut
  } = useAuth();
  const {
    currentOrganization
  } = useOrganization();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: BookOpen, label: "Formats", path: "/formats" },
    { icon: Archive, label: "Stock", path: "/stock" },
    { icon: FileText, label: "Quotes", path: "/quotes" },
    { icon: ShoppingCart, label: "Purchase Orders", path: "/orders" },
    { icon: Truck, label: "Shipments", path: "/shipments" },
    { icon: Building, label: "Organizations", path: "/organizations" }
  ];
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const currentPageLabel = menuItems.find(item => item.path === location.pathname)?.label || "Dashboard";
  
  // Mobile navigation dropdown menu
  const MobileNav = () => (
    <div className="md:hidden">
      <div className="flex items-center">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{currentPageLabel}</h1>
      </div>
      
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[85%] p-0 bg-white">
          <div className="flex flex-col h-full">
            {/* Header with logo */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {currentOrganization?.logo_url && (
                <img src={currentOrganization.logo_url} alt={`${currentOrganization.name} logo`} className="h-16 w-auto object-contain rounded-sm mx-auto mb-4" />
              )}
              <div className="mb-2">
                <OrganizationSwitcher />
              </div>
            </div>
            
            {/* Menu items */}
            <div className="flex-1 overflow-y-auto">
              <nav className="px-2 py-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <Link 
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-base rounded-md ${location.pathname === item.path ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            {/* User profile section */}
            {user && (
              <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium truncate">{user.email}</span>
                </div>
                <div className="space-y-2">
                  <button 
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm rounded-md border hover:bg-gray-50"
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm rounded-md border hover:bg-gray-50"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Desktop Sidebar - hidden on mobile */}
        <Sidebar className="border-r border-gray-200 hidden md:flex" collapsible={isMobile ? "offcanvas" : "icon"}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {currentOrganization?.logo_url && (
                  <div className="flex justify-center my-2">
                    <img src={currentOrganization.logo_url} alt={`${currentOrganization.name} logo`} className="h-24 w-auto object-contain rounded-sm" />
                  </div>
                )}
                <div className="px-3 mb-2">
                  <OrganizationSwitcher />
                </div>
                <SidebarMenu>
                  {menuItems.map(item => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link to={item.path} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${location.pathname === item.path ? "bg-accent text-white" : "hover:bg-gray-100"}`}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
              
              {user && (
                <div className="mt-auto p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4 md:p-8 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            {/* Mobile Navigation */}
            <MobileNav />
            
            {/* Desktop Navigation Title - hidden on mobile */}
            <h1 className="text-2xl font-bold hidden md:block">
              {currentPageLabel}
            </h1>
            
            <div className="flex items-center gap-4">
              <NotificationsPopover />
              <HelpCenterPopover />
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
