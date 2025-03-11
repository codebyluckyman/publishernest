
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupplierQuote, QuoteItem, SortQuoteField, SortDirection, QuoteStatus } from '@/types/quote';
import { Organization } from '@/types/organization';

export const useQuotesApi = (currentOrganization: Organization | null) => {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortQuoteField>('quote_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteRequestFilter, setQuoteRequestFilter] = useState<string | null>(null);

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
          supplier:suppliers(
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

  const createQuote = useMutation({
    mutationFn: async (quote: Omit<SupplierQuote, 'id' | 'created_at' | 'updated_at'> & { items: Omit<QuoteItem, 'id' | 'quote_id' | 'created_at' | 'updated_at'>[] }) => {
      if (!currentOrganization) throw new Error('No organization selected');

      try {
        // If this is a new supplier (no supplier_id but has supplier_name)
        if (!quote.supplier_id && quote.supplier_name) {
          // Check if we need to create a new supplier
          const { data: existingSuppliers, error: supplierCheckError } = await supabase
            .from('suppliers')
            .select('id')
            .eq('organization_id', currentOrganization.id)
            .eq('supplier_name', quote.supplier_name)
            .limit(1);
            
          if (supplierCheckError) throw supplierCheckError;
          
          // If no existing supplier with this name, create one
          if (!existingSuppliers || existingSuppliers.length === 0) {
            const { data: newSupplier, error: createSupplierError } = await supabase
              .from('suppliers')
              .insert({
                organization_id: currentOrganization.id,
                supplier_name: quote.supplier_name,
                contact_email: quote.contact_email,
                contact_phone: quote.contact_phone,
                status: 'active'
              })
              .select()
              .single();
              
            if (createSupplierError) throw createSupplierError;
            if (newSupplier) {
              quote.supplier_id = newSupplier.id;
            }
          } else {
            quote.supplier_id = existingSuppliers[0].id;
          }
        }

        // Insert quote
        const { data: quoteData, error: quoteError } = await supabase
          .from('supplier_quotes')
          .insert({
            ...quote,
            organization_id: currentOrganization.id
          })
          .select()
          .single();

        if (quoteError) throw quoteError;
        if (!quoteData) throw new Error('Failed to create quote');

        // Insert quote items
        if (quote.items && quote.items.length > 0) {
          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(
              quote.items.map(item => ({
                ...item,
                quote_id: quoteData.id
              }))
            );

          if (itemsError) throw itemsError;
        }

        return quoteData as SupplierQuote;
      } catch (error) {
        console.error('Error in createQuote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', currentOrganization?.id] });
      toast.success('Quote created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating quote:', error);
      toast.error(error.message || 'Failed to create quote');
    }
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, ...quote }: Partial<SupplierQuote> & { id: string }) => {
      try {
        // If this is a new supplier (no supplier_id but has supplier_name)
        if (!quote.supplier_id && quote.supplier_name) {
          // Check if we need to create a new supplier
          const { data: existingSuppliers, error: supplierCheckError } = await supabase
            .from('suppliers')
            .select('id')
            .eq('organization_id', currentOrganization?.id as string)
            .eq('supplier_name', quote.supplier_name)
            .limit(1);
            
          if (supplierCheckError) throw supplierCheckError;
          
          // If no existing supplier with this name, create one
          if (!existingSuppliers || existingSuppliers.length === 0) {
            const { data: newSupplier, error: createSupplierError } = await supabase
              .from('suppliers')
              .insert({
                organization_id: currentOrganization?.id as string,
                supplier_name: quote.supplier_name,
                contact_email: quote.contact_email,
                contact_phone: quote.contact_phone,
                status: 'active'
              })
              .select()
              .single();
              
            if (createSupplierError) throw createSupplierError;
            if (newSupplier) {
              quote.supplier_id = newSupplier.id;
            }
          } else {
            quote.supplier_id = existingSuppliers[0].id;
          }
        }

        const { error } = await supabase
          .from('supplier_quotes')
          .update(quote)
          .eq('id', id);

        if (error) throw error;
        return id;
      } catch (error) {
        console.error('Error in updateQuote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', currentOrganization?.id] });
      toast.success('Quote updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating quote:', error);
      toast.error(error.message || 'Failed to update quote');
    }
  });

  const deleteQuote = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('supplier_quotes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return id;
      } catch (error) {
        console.error('Error in deleteQuote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', currentOrganization?.id] });
      toast.success('Quote deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting quote:', error);
      toast.error(error.message || 'Failed to delete quote');
    }
  });

  const handleSort = (field: SortQuoteField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    quoteRequestFilter,
    setQuoteRequestFilter
  };
};
