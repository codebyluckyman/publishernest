
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Printer, ShoppingCart, Truck, BarChart3, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: FileText, label: "Quotes", path: "/quotes" },
    { icon: ShoppingCart, label: "Purchase Orders", path: "/orders" },
    { icon: Truck, label: "Shipments", path: "/shipments" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarContent>
            <SidebarGroup>
              <div className="p-4">
                <h1 className="text-xl font-bold text-primary">PublishFlow</h1>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                            location.pathname === item.path
                              ? "bg-secondary text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-8 animate-fadeIn">
          <SidebarTrigger className="mb-6" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
