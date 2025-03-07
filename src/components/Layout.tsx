
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Printer, ShoppingCart, Truck, BarChart3, Package, LogOut, User, Building, BookOpen, BellRing, HelpCircle, Archive, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrganizationSwitcher from "./OrganizationSwitcher";
import NotificationsPopover from "./NotificationsPopover";
import HelpCenterPopover from "./HelpCenterPopover";

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
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200" collapsible={isMobile ? "offcanvas" : "icon"}>
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
        <main className="flex-1 p-8 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 md:hidden">
                <Menu className="w-6 h-6" />
              </SidebarTrigger>
              <h1 className="text-2xl font-bold">
                {menuItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
              </h1>
            </div>
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
