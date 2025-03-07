
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrganizationSwitcher from "../OrganizationSwitcher";
import { MenuItem } from "./NavigationMenuItems";

interface MobileNavigationProps {
  menuItems: MenuItem[];
  currentPageLabel: string;
}

const MobileNavigation = ({ menuItems, currentPageLabel }: MobileNavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentOrganization } = useOrganization();

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
};

export default MobileNavigation;
