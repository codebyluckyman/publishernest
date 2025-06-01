
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

  // Transform the data to match our type
  const notifications: OrganizationNotification[] = (data || []).map((item: any) => ({
    id: item.id,
    organization_id: item.organization_id,
    user_id: item.user_id,
    notification_type: item.notification_type,
    title: item.title,
    message: item.message,
    data: typeof item.data === 'object' ? item.data : {},
    is_read: item.is_read,
    is_dismissed: item.is_dismissed,
    created_at: item.created_at,
    expires_at: item.expires_at,
    priority: item.priority
  }));

  return notifications;
};

export const fetchAllOrganizationNotifications = async (
  organizationId: string,
  userId?: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: 'all' | 'unread' | 'read';
    priority?: string;
    type?: string;
    search?: string;
  }
): Promise<{ notifications: OrganizationNotification[], totalCount: number }> => {
  let query = supabase
    .from('organization_notifications')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.is.null`);
  }

  // Apply filters
  if (filters?.status === 'unread') {
    query = query.eq('is_read', false);
  } else if (filters?.status === 'read') {
    query = query.eq('is_read', true);
  }

  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('notification_type', filters.type);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
  }

  // Always exclude dismissed notifications and expired ones
  query = query
    .eq('is_dismissed', false)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching all organization notifications:', error);
    throw error;
  }

  const notifications: OrganizationNotification[] = (data || []).map((item: any) => ({
    id: item.id,
    organization_id: item.organization_id,
    user_id: item.user_id,
    notification_type: item.notification_type,
    title: item.title,
    message: item.message,
    data: typeof item.data === 'object' ? item.data : {},
    is_read: item.is_read,
    is_dismissed: item.is_dismissed,
    created_at: item.created_at,
    expires_at: item.expires_at,
    priority: item.priority
  }));

  return {
    notifications,
    totalCount: count || 0
  };
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

export const markAllOrganizationNotificationsRead = async (
  organizationId: string,
  userId?: string
): Promise<void> => {
  let query = supabase
    .from('organization_notifications')
    .update({ is_read: true })
    .eq('organization_id', organizationId)
    .eq('is_read', false)
    .eq('is_dismissed', false);

  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.is.null`);
  }

  const { error } = await query;

  if (error) {
    console.error('Error marking all notifications as read:', error);
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
