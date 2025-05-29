
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchOrganizationNotifications,
  createOrganizationNotification,
  markOrganizationNotificationRead,
  dismissOrganizationNotification,
  getOrganizationUnreadNotificationCount
} from '@/api/organizations/notifications';
import { CreateOrganizationNotification } from '@/types/organizationNotification';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrganizationNotifications = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const notificationsKey = ['organization-notifications', currentOrganization?.id, user?.id];
  const unreadCountKey = ['organization-unread-count', currentOrganization?.id, user?.id];

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: notificationsKey,
    queryFn: () => fetchOrganizationNotifications(currentOrganization!.id, user!.id),
    enabled: !!currentOrganization?.id && !!user?.id,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: unreadCountKey,
    queryFn: () => getOrganizationUnreadNotificationCount(currentOrganization!.id, user!.id),
    enabled: !!currentOrganization?.id && !!user?.id,
  });

  const createNotificationMutation = useMutation({
    mutationFn: createOrganizationNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markOrganizationNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });

  const dismissMutation = useMutation({
    mutationFn: dismissOrganizationNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    },
    onError: (error) => {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    },
  });

  // Set up real-time updates
  useEffect(() => {
    if (!currentOrganization?.id || !user?.id) return;

    const channel = supabase
      .channel('organization-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_notifications',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: notificationsKey });
          queryClient.invalidateQueries({ queryKey: unreadCountKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrganization?.id, user?.id, queryClient, notificationsKey, unreadCountKey]);

  const createNotification = (notification: CreateOrganizationNotification) => {
    createNotificationMutation.mutate(notification);
  };

  const markAsRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const dismiss = (notificationId: string) => {
    dismissMutation.mutate(notificationId);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    createNotification,
    markAsRead,
    dismiss,
    isCreating: createNotificationMutation.isPending,
    isMarkingRead: markReadMutation.isPending,
    isDismissing: dismissMutation.isPending,
  };
};
