
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SupplierQuote } from '@/types/supplierQuote';
import { submitSupplierQuote } from '@/api/supplierQuotes/submitSupplierQuote';
import { toast } from '@/utils/toast-utils';

export function useSupplierQuotes() {
  const queryClient = useQueryClient();

  const submitQuote = useMutation({
    mutationFn: async ({ id, totalCost }: { id: string; totalCost: number }) => {
      return submitSupplierQuote(id, totalCost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotes'] });
      toast.success('Quote submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting quote:', error);
      toast.error('Failed to submit quote');
    }
  });

  return {
    submitQuote
  };
}
