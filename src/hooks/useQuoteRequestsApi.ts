
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteRequest, SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';
import { Organization } from '@/types/organization';

export const useQuoteRequestsApi = (currentOrganization: Organization | null) => {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortQuoteRequestField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<'draft' | 'open' | 'closed' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuoteRequests = async () => {
    if (!currentOrganization) return [];

    try {
      let query = supabase
        .from('quote_requests')
        .select(`
          *,
          quotes_count:supplier_quotes(count)
        `)
        .eq('organization_id', currentOrganization.id)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching quote requests:', error);
        toast.error('Failed to load quote requests');
        return [];
      }

      // Transform the data to match our expected type
      // The quotes_count is returned as an array with a single object containing the count
      return data.map(item => ({
        ...item,
        quotes_count: item.quotes_count?.length > 0 ? item.quotes_count[0].count : 0
      })) as QuoteRequest[];
    } catch (error) {
      console.error('Error in fetchQuoteRequests:', error);
      toast.error('An unexpected error occurred');
      return [];
    }
  };

  const { data: quoteRequests, isLoading, refetch } = useQuery({
    queryKey: ['quoteRequests', currentOrganization?.id, sortField, sortDirection, statusFilter, searchQuery],
    queryFn: fetchQuoteRequests,
    enabled: !!currentOrganization,
  });

  const createQuoteRequest = useMutation({
    mutationFn: async (quoteRequest: Omit<QuoteRequest, 'id' | 'created_at' | 'updated_at' | 'quotes_count'>) => {
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

  const handleSort = (field: SortQuoteRequestField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    quoteRequests,
    isLoading,
    createQuoteRequest,
    updateQuoteRequest,
    deleteQuoteRequest,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery
  };
};
