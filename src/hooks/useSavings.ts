
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSavings, createSaving, updateSaving, deleteSaving, fetchSavingById } from "@/api/savings";
import { SavingTableItem } from "@/types/saving";

export function useSavings(organizationId?: string) {
  const queryClient = useQueryClient();
  
  // Fetch all savings
  const { data: savings, isLoading, isError, error } = useQuery({
    queryKey: ["savings", organizationId],
    queryFn: () => fetchSavings(organizationId),
    enabled: !!organizationId,
  });

  // Fetch a single saving by ID
  const useSavingById = (id: string | null) => {
    return useQuery({
      queryKey: ["saving", id],
      queryFn: () => fetchSavingById(id!),
      enabled: !!id,
    });
  };
  
  // Create a new saving
  const createMutation = useMutation({
    mutationFn: (data: { 
      organizationId: string; 
      saving: { 
        name: string; 
        description?: string; 
        unit_of_measure_id?: string;
      } 
    }) => {
      return createSaving(data.organizationId, data.saving);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      toast.success("Saving created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create saving: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Update an existing saving
  const updateMutation = useMutation({
    mutationFn: (data: { 
      id: string; 
      updates: { 
        name: string; 
        description?: string; 
        unit_of_measure_id?: string;
      } 
    }) => {
      return updateSaving(data.id, data.updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      toast.success("Saving updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update saving: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Delete a saving
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteSaving(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      toast.success("Saving deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete saving: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  return {
    savings,
    isLoading,
    isError,
    error,
    useSavingById,
    createSaving: createMutation.mutate,
    updateSaving: updateMutation.mutate,
    deleteSaving: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
