
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteRequest, SortQuoteRequestField, SortDirection } from '@/types/quoteRequest';
import { Organization } from '@/types/organization';

interface UseQuoteRequestsQueryOptions {
  searchQuery?: string;
  filters?: {
    status: null | string;
    dueDate: null | string;
    [key: string]: any;
  };
  sortField?: SortQuoteRequestField;
  sortDirection?: SortDirection;
  refreshTrigger?: number;
}

export const useQuoteRequestsQuery = (
  currentOrganization: Organization | null, 
  options: UseQuoteRequestsQueryOptions = {}
) => {
  const { 
    searchQuery = '', 
    filters = { status: null, dueDate: null },
    sortField: initialSortField = 'created_at',
    sortDirection: initialSortDirection = 'desc',
    refreshTrigger = 0
  } = options;
  
  const [sortField, setSortField] = useState<SortQuoteRequestField>(initialSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [statusFilter, setStatusFilter] = useState<string | null>(filters.status);
  const [searchQueryState, setSearchQuery] = useState(searchQuery);

  const fetchQuoteRequests = async () => {
    if (!currentOrganization) return [];

    try {
      let query = supabase
        .from('quote_requests')
        .select(`
          *,
          quotes_count:supplier_quotes(count),
          formats:quote_request_formats(
            format_id,
            format:formats(
              id,
              format_name
            )
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (searchQueryState) {
        query = query.ilike('title', `%${searchQueryState}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching quote requests:', error);
        toast.error('Failed to load quote requests');
        return [];
      }

      // Transform the data to match our expected type
      return data.map(item => ({
        ...item,
        quotes_count: item.quotes_count?.length > 0 ? item.quotes_count[0].count : 0,
        formats: item.formats?.map((f: any) => f.format) || []
      })) as QuoteRequest[];
    } catch (error) {
      console.error('Error in fetchQuoteRequests:', error);
      toast.error('An unexpected error occurred');
      return [];
    }
  };

  const { data: quoteRequests, isLoading, refetch } = useQuery({
    queryKey: ['quoteRequests', currentOrganization?.id, sortField, sortDirection, statusFilter, searchQueryState, refreshTrigger],
    queryFn: fetchQuoteRequests,
    enabled: !!currentOrganization,
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
    refetch,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter,
    searchQuery: searchQueryState,
    setSearchQuery
  };
};
