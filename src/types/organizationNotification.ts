
export interface OrganizationNotification {
  id: string;
  organization_id: string;
  user_id?: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface OrganizationNotificationPreference {
  id: string;
  organization_id: string;
  user_id: string;
  notification_type: string;
  enabled: boolean;
  delivery_method: 'in_app' | 'email' | 'both';
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationNotification {
  organization_id: string;
  notification_type: string;
  title: string;
  message: string;
  user_id?: string;
  data?: Record<string, any>;
  expires_at?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}
