import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Building,
  ChevronDown,
  ChevronRight,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import OrganizationSwitcher from "../OrganizationSwitcher";
import { MenuItem } from "./NavigationMenuItems";
import { useState, useEffect } from "react";
import UserAvatar from "../UserAvatar";
import { supabase } from "@/integrations/supabase/client";

interface DesktopSidebarProps {
  menuItems: MenuItem[];
}

const DesktopSidebar = ({ menuItems }: DesktopSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut, userProfile } = useAuth();
  const { currentOrganization } = useOrganization();

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const currentPath = location.pathname;

    menuItems.forEach((item) => {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some(
          (subItem) =>
            currentPath === subItem.path ||
            (currentPath.includes("/quote-requests") &&
              subItem.path === "/quote-requests")
        );

        if (isSubmenuActive) {
          setOpenSubmenus((prev) => ({
            ...prev,
            [item.label]: true,
          }));
        }
      }
    });
  }, [location.pathname, menuItems]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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

  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    return user?.email ? user.email[0].toUpperCase() : undefined;
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return user?.email || "";
  };

  return (
    <Sidebar
      className="border-r border-gray-200 hidden md:flex bg-white"
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {currentOrganization?.logo_url && (
              <div className="flex justify-center my-2">
                <img
                  src={currentOrganization.logo_url}
                  alt={`${currentOrganization.name} logo`}
                  className="h-24 w-auto object-contain rounded-sm"
                />
              </div>
            )}
            <div className="px-3 mb-2">
              <OrganizationSwitcher />
            </div>
            <SidebarMenu>
              {menuItems.map((item, key) => (
                <SidebarMenuItem key={key}>
                  {item.submenu ? (
                    <div className="flex flex-col w-full">
                      <button
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100`}
                        onClick={() => toggleSubmenu(item.label)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {openSubmenus[item.label] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {openSubmenus[item.label] && (
                        <div className="ml-6 pl-2 border-l border-gray-200 mt-1">
                          {item.submenu.map((subItem) => (
                            <SidebarMenuButton
                              key={subItem.path}
                              asChild
                              tooltip={subItem.label}
                            >
                              <Link
                                to={subItem.path}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                  location.pathname === subItem.path ||
                                  (location.pathname.includes(subItem.path) &&
                                    subItem.path !== "/")
                                    ? "bg-accent text-white"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <subItem.icon className="w-5 h-5" />
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          location.pathname === item.path
                            ? "bg-accent text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          {user && (
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar
                  avatarUrl={userProfile?.avatar_url}
                  fallback={getUserInitials()}
                  className="h-9 w-9"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DesktopSidebar;
