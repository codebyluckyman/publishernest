
export interface OrganizationReminderSettings {
  id: string;
  organization_id: string;
  reminder_days_before: number[];
  reminder_enabled: boolean;
  issue_quote_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationReminderSettings {
  organization_id: string;
  reminder_days_before?: number[];
  reminder_enabled?: boolean;
  issue_quote_notifications_enabled?: boolean;
}

export interface UpdateOrganizationReminderSettings {
  reminder_days_before?: number[];
  reminder_enabled?: boolean;
  issue_quote_notifications_enabled?: boolean;
}
