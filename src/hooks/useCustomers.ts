
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from './useOrganization';
import { 
  fetchCustomers, 
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '@/api/customers';
import { toast } from 'sonner';

export function useCustomers() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ['customers', currentOrganization?.id],
    queryFn: () => fetchCustomers(currentOrganization!.id),
    enabled: !!currentOrganization,
  });

  const customerByIdQuery = (customerId: string) => useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => fetchCustomerById(customerId),
    enabled: !!customerId,
  });

  const createCustomerMutation = useMutation({
    mutationFn: (customerData: any) => {
      return createCustomer({
        ...customerData,
        organization_id: currentOrganization!.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });

  return {
    customers: customersQuery.data || [],
    isLoadingCustomers: customersQuery.isLoading,
    isErrorCustomers: customersQuery.isError,
    errorCustomers: customersQuery.error,
    
    getCustomerById: customerByIdQuery,
    
    createCustomer: createCustomerMutation.mutate,
    isCreatingCustomer: createCustomerMutation.isPending,
    
    updateCustomer: updateCustomerMutation.mutate,
    isUpdatingCustomer: updateCustomerMutation.isPending,
    
    deleteCustomer: deleteCustomerMutation.mutate,
    isDeletingCustomer: deleteCustomerMutation.isPending,
  };
}
