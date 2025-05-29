
import { supabase } from "@/integrations/supabase/client";
import { OrganizationNotification, CreateOrganizationNotification } from "@/types/organizationNotification";

export const fetchOrganizationNotifications = async (
  organizationId: string,
  userId?: string,
  limit: number = 20
): Promise<OrganizationNotification[]> => {
  const { data, error } = await supabase.rpc('get_organization_notifications', {
    p_organization_id: organizationId,
    p_user_id: userId,
    p_limit: limit
  });

  if (error) {
    console.error('Error fetching organization notifications:', error);
    throw error;
  }

  return data || [];
};

export const createOrganizationNotification = async (
  notification: CreateOrganizationNotification
): Promise<string> => {
  const { data, error } = await supabase.rpc('create_organization_notification', {
    p_organization_id: notification.organization_id,
    p_notification_type: notification.notification_type,
    p_title: notification.title,
    p_message: notification.message,
    p_user_id: notification.user_id,
    p_data: notification.data || {},
    p_expires_at: notification.expires_at,
    p_priority: notification.priority || 'normal'
  });

  if (error) {
    console.error('Error creating organization notification:', error);
    throw error;
  }

  return data;
};

export const markOrganizationNotificationRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase.rpc('mark_organization_notification_read', {
    p_notification_id: notificationId
  });

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const dismissOrganizationNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase.rpc('dismiss_organization_notification', {
    p_notification_id: notificationId
  });

  if (error) {
    console.error('Error dismissing notification:', error);
    throw error;
  }
};

export const getOrganizationUnreadNotificationCount = async (
  organizationId: string,
  userId?: string
): Promise<number> => {
  const { data, error } = await supabase.rpc('get_organization_unread_notification_count', {
    p_organization_id: organizationId,
    p_user_id: userId
  });

  if (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }

  return data || 0;
};
