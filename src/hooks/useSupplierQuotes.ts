
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupplierQuote } from '@/types/supplierQuote';
import { useOrganization } from '@/context/OrganizationContext';
import { submitSupplierQuote } from '@/api/supplierQuotes/submitSupplierQuote';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';

export function useSupplierQuotes() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const user = useUser();

  // Fetch supplier quotes list
  const useSupplierQuotesList = (quoteRequestId?: string) => {
    return useQuery({
      queryKey: ['supplier-quotes', currentOrganization?.id, quoteRequestId],
      queryFn: async () => {
        if (!currentOrganization?.id) return [];

        let query = supabase
          .from('supplier_quotes')
          .select(`
            *,
            supplier:suppliers(id, supplier_name),
            quote_request:quote_requests(id, title, description),
            formats:supplier_quote_formats(
              id,
              format_id,
              quote_request_format_id,
              format_name
            ),
            price_breaks:supplier_quote_price_breaks(*),
            extra_costs:supplier_quote_extra_costs(*),
            savings:supplier_quote_savings(*),
            attachments:supplier_quote_attachments(*)
          `)
          .eq('organization_id', currentOrganization.id);

        if (quoteRequestId) {
          query = query.eq('quote_request_id', quoteRequestId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as SupplierQuote[];
      },
      enabled: !!currentOrganization?.id,
    });
  };

  // Create supplier quote
  const useCreateSupplierQuote = () => {
    return useMutation({
      mutationFn: async (quoteData: Partial<SupplierQuote>) => {
        if (!currentOrganization?.id) throw new Error('No organization selected');

        const { data, error } = await supabase
          .from('supplier_quotes')
          .insert({
            ...quoteData,
            organization_id: currentOrganization.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
        toast.success('Quote created successfully');
      },
      onError: (error: any) => {
        toast.error(`Failed to create quote: ${error.message}`);
      }
    });
  };

  // Update supplier quote
  const useUpdateSupplierQuote = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }: Partial<SupplierQuote> & { id: string }) => {
        const { data, error } = await supabase
          .from('supplier_quotes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
        toast.success('Quote updated successfully');
      },
      onError: (error: any) => {
        toast.error(`Failed to update quote: ${error.message}`);
      }
    });
  };

  // Submit supplier quote
  const useSubmitSupplierQuote = () => {
    return useMutation({
      mutationFn: async ({ id }: { id: string }) => {
        if (!user?.id) throw new Error('User not authenticated');
        return await submitSupplierQuote(id, user.id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
        toast.success('Quote submitted successfully');
      },
      onError: (error: any) => {
        toast.error(`Failed to submit quote: ${error.message}`);
      }
    });
  };

  // Delete supplier quote
  const useDeleteSupplierQuote = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('supplier_quotes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
        toast.success('Quote deleted successfully');
      },
      onError: (error: any) => {
        toast.error(`Failed to delete quote: ${error.message}`);
      }
    });
  };

  // Approve supplier quote
  const useApproveSupplierQuote = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        if (!user?.id) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('supplier_quotes')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: user.id
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
        toast.success('Quote approved successfully');
      },
      onError: (error: any) => {
        toast.error(`Failed to approve quote: ${error.message}`);
      }
    });
  };

  // Reject supplier quote
  const useRejectSupplierQuote = () => {
    return useMutation({
      mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
        if (!user?.id) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('supplier_quotes')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString(),
            rejected_by: user.id,
            rejection_reason: reason
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
        toast.success('Quote rejected successfully');
      },
      onError: (error: any) => {
        toast.error(`Failed to reject quote: ${error.message}`);
      }
    });
  };

  // Audit history
  const useSupplierQuoteAudit = (quoteId: string) => {
    return useQuery({
      queryKey: ['supplier-quote-audit', quoteId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('supplier_quote_audit')
          .select('*')
          .eq('supplier_quote_id', quoteId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!quoteId,
    });
  };

  return {
    useSupplierQuotesList,
    useCreateSupplierQuote,
    useUpdateSupplierQuote,
    useSubmitSupplierQuote,
    useDeleteSupplierQuote,
    useApproveSupplierQuote,
    useRejectSupplierQuote,
    useSupplierQuoteAudit,
  };
}
