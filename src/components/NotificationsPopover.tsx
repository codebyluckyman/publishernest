
import React, { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";

// Sample notification data
const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Order Received",
    description: "You have received a new order from Penguin Books",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    title: "Quote Approved",
    description: "Your quote #Q-2023-0042 has been approved",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    title: "Shipment Delayed",
    description: "Shipment #SH-2023-0011 has been delayed",
    time: "Yesterday",
    read: true,
  },
  {
    id: "4",
    title: "Product Update",
    description: "Product 'Harmony Tales' has been updated",
    time: "3 days ago",
    read: true,
  },
];

const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto py-1">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${notification.read ? 'opacity-70' : 'bg-blue-50/30'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
