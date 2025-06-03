
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { 
  fetchOrganizationReminderSettings,
  createOrganizationReminderSettings,
  updateOrganizationReminderSettings
} from '@/api/organizations/reminderSettings';
import { toast } from 'sonner';
import { OrganizationReminderSettings, UpdateOrganizationReminderSettings } from '@/types/organizationReminderSettings';

export const useOrganizationReminderSettings = () => {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const queryKey = ['organization-reminder-settings', currentOrganization?.id];

  const { data: reminderSettings, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchOrganizationReminderSettings(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  const createMutation = useMutation({
    mutationFn: createOrganizationReminderSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      toast.success('Reminder settings created successfully');
    },
    onError: (error) => {
      console.error('Error creating reminder settings:', error);
      toast.error('Failed to create reminder settings');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ organizationId, updates }: { organizationId: string; updates: UpdateOrganizationReminderSettings }) =>
      updateOrganizationReminderSettings(organizationId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      toast.success('Reminder settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating reminder settings:', error);
      toast.error('Failed to update reminder settings');
    },
  });

  const createSettings = (settings: { 
    reminder_days_before?: number[]; 
    reminder_enabled?: boolean;
    issue_quote_notifications_enabled?: boolean;
  }) => {
    if (!currentOrganization?.id) return;
    
    createMutation.mutate({
      organization_id: currentOrganization.id,
      ...settings,
    });
  };

  const updateSettings = (updates: UpdateOrganizationReminderSettings) => {
    if (!currentOrganization?.id) return;
    
    updateMutation.mutate({
      organizationId: currentOrganization.id,
      updates,
    });
  };

  return {
    reminderSettings,
    isLoading,
    createSettings,
    updateSettings,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
