import { PanelLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationsPopover from "../NotificationsPopover";
import HelpCenterPopover from "../HelpCenterPopover";
import MobileNavigation from "./MobileNavigation";
import { MenuItem } from "./NavigationMenuItems";
import { MessagesPopover } from "../MessagesPopover";

interface NavigationHeaderProps {
  currentPageLabel: string;
  menuItems: MenuItem[];
}

const NavigationHeader = ({
  currentPageLabel,
  menuItems,
}: NavigationHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Mobile Navigation */}
      <MobileNavigation
        menuItems={menuItems}
        currentPageLabel={currentPageLabel}
      />

      {/* Desktop Navigation Title - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        {/* Desktop Sidebar Toggle Button */}
        <SidebarTrigger className="text-gray-500 hover:bg-gray-100">
          <PanelLeft className="w-5 h-5" />
        </SidebarTrigger>
        <h1 className="text-2xl font-bold">{currentPageLabel}</h1>
      </div>

      <div className="flex items-center">
        <MessagesPopover />
        <NotificationsPopover />
        <HelpCenterPopover />
      </div>
    </div>
  );
};

export default NavigationHeader;
