
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchSalesOrderRequirements,
  createSalesOrderRequirement,
  updateSalesOrderRequirement,
  deleteSalesOrderRequirement
} from '@/api/salesOrderRequirements';
import { toast } from 'sonner';
import { SalesOrderRequirement } from '@/types/customerRequirement';

export function useSalesOrderRequirements(salesOrderId?: string) {
  const queryClient = useQueryClient();

  const requirementsQuery = useQuery({
    queryKey: ['sales-order-requirements', salesOrderId],
    queryFn: () => fetchSalesOrderRequirements(salesOrderId!),
    enabled: !!salesOrderId,
  });

  const createRequirementMutation = useMutation({
    mutationFn: (requirementData: Omit<SalesOrderRequirement, 'id' | 'created_at' | 'updated_at' | 'requirement'>) => {
      return createSalesOrderRequirement(requirementData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-order-requirements', salesOrderId] });
      toast.success('Sales order requirement created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create sales order requirement: ${error.message}`);
    },
  });

  const updateRequirementMutation = useMutation({
    mutationFn: updateSalesOrderRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-order-requirements', salesOrderId] });
      toast.success('Sales order requirement updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update sales order requirement: ${error.message}`);
    },
  });

  const deleteRequirementMutation = useMutation({
    mutationFn: deleteSalesOrderRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-order-requirements', salesOrderId] });
      toast.success('Sales order requirement deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete sales order requirement: ${error.message}`);
    },
  });

  return {
    requirements: requirementsQuery.data || [],
    isLoadingRequirements: requirementsQuery.isLoading,
    isErrorRequirements: requirementsQuery.isError,
    errorRequirements: requirementsQuery.error,
    
    createRequirement: createRequirementMutation.mutate,
    isCreatingRequirement: createRequirementMutation.isPending,
    
    updateRequirement: updateRequirementMutation.mutate,
    isUpdatingRequirement: updateRequirementMutation.isPending,
    
    deleteRequirement: deleteRequirementMutation.mutate,
    isDeletingRequirement: deleteRequirementMutation.isPending,
  };
}
