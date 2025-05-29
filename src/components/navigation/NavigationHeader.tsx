
import OrganizationSwitcher from "@/components/OrganizationSwitcher";
import UserAvatar from "@/components/UserAvatar";
import NotificationsPopover from "@/components/NotificationsPopover";
import { OrganizationNotificationsPopover } from "@/components/organizations/OrganizationNotificationsPopover";
import HelpCenterPopover from "@/components/HelpCenterPopover";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  onMobileMenuToggle: () => void;
}

export function NavigationHeader({ onMobileMenuToggle }: NavigationHeaderProps) {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
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
          <OrganizationSwitcher />
          <NotificationsPopover />
          <OrganizationNotificationsPopover />
          <HelpCenterPopover />
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
