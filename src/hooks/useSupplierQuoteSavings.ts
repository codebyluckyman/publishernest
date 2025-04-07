
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchSupplierQuoteSavings, 
  createSupplierQuoteSaving,
  updateSupplierQuoteSaving,
  deleteSupplierQuoteSaving 
} from "@/api/supplierQuoteSavings";
import { SupplierQuoteSaving } from "@/types/supplierQuote";

export function useSupplierQuoteSavings(supplierQuoteId?: string) {
  const queryClient = useQueryClient();
  
  // Fetch all savings for a supplier quote
  const { data: savings, isLoading, isError, error } = useQuery({
    queryKey: ["supplier-quote-savings", supplierQuoteId],
    queryFn: () => fetchSupplierQuoteSavings(supplierQuoteId!),
    enabled: !!supplierQuoteId,
  });
  
  // Create a new supplier quote saving
  const createMutation = useMutation({
    mutationFn: (saving: Omit<SupplierQuoteSaving, 'id'>) => {
      return createSupplierQuoteSaving(saving);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-quote-savings", supplierQuoteId] });
      queryClient.invalidateQueries({ queryKey: ["supplierQuote", supplierQuoteId] });
      toast.success("Saving added to quote successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add saving to quote: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Update an existing supplier quote saving
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<SupplierQuoteSaving> }) => {
      return updateSupplierQuoteSaving(data.id, data.updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-quote-savings", supplierQuoteId] });
      queryClient.invalidateQueries({ queryKey: ["supplierQuote", supplierQuoteId] });
      toast.success("Saving updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update saving: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Delete a supplier quote saving
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteSupplierQuoteSaving(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-quote-savings", supplierQuoteId] });
      queryClient.invalidateQueries({ queryKey: ["supplierQuote", supplierQuoteId] });
      toast.success("Saving removed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to remove saving: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  return {
    savings,
    isLoading,
    isError,
    error,
    createSaving: createMutation.mutate,
    updateSaving: updateMutation.mutate,
    deleteSaving: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
