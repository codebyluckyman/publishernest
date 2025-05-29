
import React from 'react';
import { Bell, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useOrganizationNotifications } from '@/hooks/useOrganizationNotifications';
import { OrganizationNotification } from '@/types/organizationNotification';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ 
  notification, 
  onMarkRead, 
  onDismiss 
}: { 
  notification: OrganizationNotification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'supplier_quote_submitted':
        return '📋';
      case 'quote_request_response':
        return '💼';
      case 'system_alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`p-3 border-b last:border-b-0 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-lg">{getNotificationIcon(notification.notification_type)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm truncate">{notification.title}</p>
              {!notification.is_read && (
                <Badge variant="secondary" className="text-xs">New</Badge>
              )}
              <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export function OrganizationNotificationsPopover() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    dismiss
  } = useOrganizationNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDismiss={dismiss}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
