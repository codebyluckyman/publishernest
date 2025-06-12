import { PanelLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationsPopover from "../NotificationsPopover";
import MobileNavigation from "./MobileNavigation";
import { MenuItem } from "./NavigationMenuItems";
import { MessagesPopover } from "../MessagesPopover";

import { OrganizationNotificationsPopover } from "@/components/organizations/OrganizationNotificationsPopover";
import HelpCenterPopover from "@/components/HelpCenterPopover";
import BreadcrumbNavigation from "./BreadcrumbNavigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  onMobileMenuToggle: () => void;
}

// const NavigationHeader = ({
//   currentPageLabel,
//   menuItems,
// }: NavigationHeaderProps) => {
//   return (
//     <div className="flex justify-between items-center mb-6">
//       {/* Mobile Navigation */}
//       <MobileNavigation
//         menuItems={menuItems}
//         currentPageLabel={currentPageLabel}
//       />

//       {/* Desktop Navigation Title - hidden on mobile */}
//       <div className="hidden md:flex items-center gap-2">
//         {/* Desktop Sidebar Toggle Button */}
//         <SidebarTrigger className="text-gray-500 hover:bg-gray-100">
//           <PanelLeft className="w-5 h-5" />
//         </SidebarTrigger>
//         <h1 className="text-2xl font-bold">{currentPageLabel}</h1>
//       </div>

//       <div className="flex items-center">
//         <MessagesPopover />
//         <NotificationsPopover />
//         <HelpCenterPopover />
//       </div>
//     </div>
export function NavigationHeader({
  onMobileMenuToggle,
}: NavigationHeaderProps) {
  return (
    <header className="border-b bg-white w-full">
      <div className="flex h-12 items-center gap-4 px-2 lg:px-4 w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden flex-shrink-0"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <BreadcrumbNavigation />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <OrganizationNotificationsPopover />
          <HelpCenterPopover />
        </div>
      </div>
    </header>
  );
}
