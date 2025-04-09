
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from './useOrganization';
import { 
  fetchCustomerRequirements, 
  fetchCustomerRequirementById,
  createCustomerRequirement,
  updateCustomerRequirement,
  deleteCustomerRequirement
} from '@/api/customerRequirements';
import { toast } from 'sonner';
import { CustomerRequirement } from '@/types/customerRequirement';

export function useCustomerRequirements(customerId?: string) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const requirementsQuery = useQuery({
    queryKey: ['customer-requirements', customerId],
    queryFn: () => fetchCustomerRequirements(customerId!),
    enabled: !!customerId,
  });

  const requirementByIdQuery = (requirementId: string) => useQuery({
    queryKey: ['customer-requirement', requirementId],
    queryFn: () => fetchCustomerRequirementById(requirementId),
    enabled: !!requirementId,
  });

  const createRequirementMutation = useMutation({
    mutationFn: (requirementData: Omit<CustomerRequirement, 'id' | 'created_at' | 'updated_at'>) => {
      return createCustomerRequirement(requirementData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requirements', customerId] });
      toast.success('Customer requirement created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create customer requirement: ${error.message}`);
    },
  });

  const updateRequirementMutation = useMutation({
    mutationFn: updateCustomerRequirement,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-requirements', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-requirement', data.id] });
      toast.success('Customer requirement updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update customer requirement: ${error.message}`);
    },
  });

  const deleteRequirementMutation = useMutation({
    mutationFn: deleteCustomerRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-requirements', customerId] });
      toast.success('Customer requirement deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete customer requirement: ${error.message}`);
    },
  });

  return {
    requirements: requirementsQuery.data || [],
    isLoadingRequirements: requirementsQuery.isLoading,
    isErrorRequirements: requirementsQuery.isError,
    errorRequirements: requirementsQuery.error,
    
    getRequirementById: requirementByIdQuery,
    
    createRequirement: createRequirementMutation.mutate,
    isCreatingRequirement: createRequirementMutation.isPending,
    
    updateRequirement: updateRequirementMutation.mutate,
    isUpdatingRequirement: updateRequirementMutation.isPending,
    
    deleteRequirement: deleteRequirementMutation.mutate,
    isDeletingRequirement: deleteRequirementMutation.isPending,
  };
}
