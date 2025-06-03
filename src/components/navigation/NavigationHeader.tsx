
import { OrganizationNotificationsPopover } from "@/components/organizations/OrganizationNotificationsPopover";
import HelpCenterPopover from "@/components/HelpCenterPopover";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  onMobileMenuToggle: () => void;
}

export function NavigationHeader({ onMobileMenuToggle }: NavigationHeaderProps) {
  return (
    <header className="border-b bg-white w-full">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6 w-full">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <OrganizationNotificationsPopover />
          <HelpCenterPopover />
        </div>
      </div>
    </header>
  );
}
