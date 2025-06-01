
import React, { useState } from 'react';
import { useAllOrganizationNotifications, useOrganizationNotifications } from '@/hooks/useOrganizationNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Check, X, Search, CheckAll } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OrganizationNotification } from '@/types/organizationNotification';

const NotificationCard = ({ 
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
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'normal': return 'border-blue-200 bg-blue-50';
      case 'low': return 'border-gray-200 bg-gray-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityTextColor = (priority: string) => {
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
    <Card className={`p-4 transition-colors ${!notification.is_read ? getPriorityColor(notification.priority) : 'bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{getNotificationIcon(notification.notification_type)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{notification.title}</h3>
              {!notification.is_read && (
                <Badge variant="secondary" className="text-xs">New</Badge>
              )}
              <Badge variant="outline" className={`text-xs ${getPriorityTextColor(notification.priority)}`}>
                {notification.priority}
              </Badge>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
              <span className="capitalize">{notification.notification_type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!notification.is_read && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              Mark Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
};

const Notifications = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'unread' | 'read',
    priority: 'all',
    type: 'all',
    search: ''
  });

  const { markAsRead, dismiss, markAllAsRead, isMarkingAllRead } = useOrganizationNotifications();
  const { notifications, totalCount, totalPages, isLoading } = useAllOrganizationNotifications(
    currentPage,
    20,
    filters
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">Stay updated with your organization's activities</p>
        </div>
        {hasUnreadNotifications && (
          <Button 
            onClick={markAllAsRead} 
            disabled={isMarkingAllRead}
            className="gap-2"
          >
            <CheckAll className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="supplier_quote_submitted">Quote Submitted</SelectItem>
              <SelectItem value="quote_request_response">Quote Response</SelectItem>
              <SelectItem value="system_alert">System Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {totalCount > 0 ? (
            <>Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalCount)} of {totalCount} notifications</>
          ) : (
            'No notifications found'
          )}
        </p>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={markAsRead}
              onDismiss={dismiss}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No notifications found</h3>
            <p>
              {filters.status !== 'all' || filters.priority !== 'all' || filters.type !== 'all' || filters.search
                ? "Try adjusting your filters to see more notifications."
                : "You're all caught up! New notifications will appear here."}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
