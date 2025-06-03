
import { supabase } from "@/integrations/supabase/client";
import { 
  OrganizationReminderSettings, 
  CreateOrganizationReminderSettings, 
  UpdateOrganizationReminderSettings 
} from "@/types/organizationReminderSettings";

export const fetchOrganizationReminderSettings = async (organizationId: string): Promise<OrganizationReminderSettings | null> => {
  const { data, error } = await supabase
    .from('organization_reminder_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching reminder settings:', error);
    throw error;
  }

  return data;
};

export const createOrganizationReminderSettings = async (settings: CreateOrganizationReminderSettings): Promise<OrganizationReminderSettings> => {
  const { data, error } = await supabase
    .from('organization_reminder_settings')
    .insert({
      ...settings,
      reminder_enabled: settings.reminder_enabled ?? true,
      issue_quote_notifications_enabled: settings.issue_quote_notifications_enabled ?? true,
      reminder_days_before: settings.reminder_days_before ?? [5, 1]
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reminder settings:', error);
    throw error;
  }

  return data;
};

export const updateOrganizationReminderSettings = async (
  organizationId: string, 
  updates: UpdateOrganizationReminderSettings
): Promise<OrganizationReminderSettings> => {
  const { data, error } = await supabase
    .from('organization_reminder_settings')
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating reminder settings:', error);
    throw error;
  }

  return data;
};
