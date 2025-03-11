
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupplierQuote, SortQuoteField, SortDirection, QuoteStatus } from '@/types/quote';
import { Organization } from '@/types/organization';

export const useQuotesQuery = (
  currentOrganization: Organization | null,
  sortField: SortQuoteField,
  sortDirection: SortDirection,
  statusFilter: QuoteStatus | 'all',
  searchQuery: string,
  quoteRequestFilter: string | null
) => {
  const fetchQuotes = async () => {
    if (!currentOrganization) return [];

    try {
      let query = supabase
        .from('supplier_quotes')
        .select(`
          *,
          items:quote_items(
            *,
            product:products(
              title,
              isbn13
            )
          ),
          quote_request:quote_requests(title),
          supplier:suppliers!fk_supplier_quotes_supplier(
            id,
            supplier_name,
            contact_email,
            contact_phone
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (quoteRequestFilter) {
        query = query.eq('quote_request_id', quoteRequestFilter);
      }

      if (searchQuery) {
        query = query.or(`supplier_name.ilike.%${searchQuery}%,quote_number.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching quotes:', error);
        toast.error('Failed to load quotes');
        return [];
      }

      return data as SupplierQuote[];
    } catch (error) {
      console.error('Error in fetchQuotes:', error);
      toast.error('An unexpected error occurred');
      return [];
    }
  };

  const { data: quotes, isLoading, refetch } = useQuery({
    queryKey: ['quotes', currentOrganization?.id, sortField, sortDirection, statusFilter, searchQuery, quoteRequestFilter],
    queryFn: fetchQuotes,
    enabled: !!currentOrganization,
  });

  return {
    quotes,
    isLoading,
    refetch
  };
};
