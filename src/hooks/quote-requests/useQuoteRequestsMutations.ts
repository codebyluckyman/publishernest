
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteRequest } from '@/types/quoteRequest';
import { Organization } from '@/types/organization';

export const useQuoteRequestsMutations = (currentOrganization: Organization | null) => {
  const queryClient = useQueryClient();

  const createQuoteRequest = useMutation({
    mutationFn: async (quoteRequest: Omit<QuoteRequest, 'id' | 'created_at' | 'updated_at' | 'quotes_count' | 'formats'>) => {
      if (!currentOrganization) throw new Error('No organization selected');

      try {
        const { data, error } = await supabase
          .from('quote_requests')
          .insert({
            ...quoteRequest,
            organization_id: currentOrganization.id
          })
          .select()
          .single();

        if (error) throw error;
        return data as QuoteRequest;
      } catch (error) {
        console.error('Error in createQuoteRequest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests', currentOrganization?.id] });
      toast.success('Quote request created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating quote request:', error);
      toast.error(error.message || 'Failed to create quote request');
    }
  });

  const updateQuoteRequest = useMutation({
    mutationFn: async ({ id, ...quoteRequest }: Partial<QuoteRequest> & { id: string }) => {
      try {
        const { error } = await supabase
          .from('quote_requests')
          .update(quoteRequest)
          .eq('id', id);

        if (error) throw error;
        return id;
      } catch (error) {
        console.error('Error in updateQuoteRequest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests', currentOrganization?.id] });
      toast.success('Quote request updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating quote request:', error);
      toast.error(error.message || 'Failed to update quote request');
    }
  });

  const deleteQuoteRequest = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('quote_requests')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return id;
      } catch (error) {
        console.error('Error in deleteQuoteRequest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests', currentOrganization?.id] });
      toast.success('Quote request deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting quote request:', error);
      toast.error(error.message || 'Failed to delete quote request');
    }
  });

  return {
    createQuoteRequest,
    updateQuoteRequest,
    deleteQuoteRequest
  };
};
