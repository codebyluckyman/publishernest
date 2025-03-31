
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrganizationSwitcher from "../OrganizationSwitcher";
import { MenuItem } from "./NavigationMenuItems";
import UserAvatar from "../UserAvatar";
import { supabase } from "@/integrations/supabase/client";

interface MobileNavigationProps {
  menuItems: MenuItem[];
  currentPageLabel: string;
}

const MobileNavigation = ({ menuItems, currentPageLabel }: MobileNavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentOrganization } = useOrganization();
  const [userProfile, setUserProfile] = useState<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  // Auto-expand submenus based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check all menu items with submenus
    menuItems.forEach(item => {
      if (item.submenu) {
        // Check if current path matches any submenu item
        const isSubmenuActive = item.submenu.some(subItem => 
          currentPath === subItem.path || 
          (currentPath.includes('/quote-requests') && subItem.path === '/quote-requests')
        );
        
        if (isSubmenuActive) {
          setOpenSubmenus(prev => ({
            ...prev,
            [item.title]: true
          }));
        }
      }
    });
  }, [location.pathname, menuItems]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          
          if (data) {
            console.log("Fetched profile in mobile nav:", data);
            setUserProfile(data);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [title]: !prev[title]
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

  // Generate user initials for avatar fallback
  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    return user?.email ? user.email[0].toUpperCase() : undefined;
  };

  // Get display name
  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return user?.email || "";
  };

  return (
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
                      {item.submenu ? (
                        <div className="flex flex-col w-full">
                          <button 
                            className="flex items-center justify-between w-full px-4 py-3 text-base rounded-md text-gray-700 hover:bg-gray-100"
                            onClick={() => toggleSubmenu(item.title)}
                          >
                            <div className="flex items-center">
                              {/* @ts-ignore - passing the real icon component here */}
                              <item.icon className="w-5 h-5 mr-3" />
                              {item.label}
                            </div>
                            {openSubmenus[item.title] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          
                          {openSubmenus[item.title] && (
                            <div className="ml-8 pl-2 border-l border-gray-200 mt-1">
                              {item.submenu.map(subItem => (
                                <Link
                                  key={subItem.path}
                                  to={subItem.path}
                                  className={`flex items-center px-4 py-3 text-base rounded-md ${
                                    location.pathname === subItem.path || 
                                    (location.pathname.includes(subItem.path) && subItem.path !== '/') 
                                    ? 'bg-accent text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {/* @ts-ignore - passing the real icon component here */}
                                  <subItem.icon className="w-5 h-5 mr-3" />
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          to={item.path}
                          className={`flex items-center px-4 py-3 text-base rounded-md ${location.pathname === item.path ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {/* @ts-ignore - passing the real icon component here */}
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            
            {/* User profile section */}
            {user && (
              <div className="p-4 border-t mt-auto">
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
};

export default MobileNavigation;
