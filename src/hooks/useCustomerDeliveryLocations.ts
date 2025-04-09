
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCustomerDeliveryLocations,
  fetchCustomerDeliveryLocationById,
  createCustomerDeliveryLocation,
  updateCustomerDeliveryLocation,
  deleteCustomerDeliveryLocation
} from '@/api/customerDeliveryLocations';
import { CustomerDeliveryLocationFormValues } from '@/types/customerDeliveryLocation';
import { toast } from 'sonner';

export function useCustomerDeliveryLocations(customerId?: string) {
  const queryClient = useQueryClient();

  const deliveryLocationsQuery = useQuery({
    queryKey: ['customer-delivery-locations', customerId],
    queryFn: () => fetchCustomerDeliveryLocations(customerId!),
    enabled: !!customerId,
  });

  const deliveryLocationByIdQuery = (locationId: string) => useQuery({
    queryKey: ['customer-delivery-location', locationId],
    queryFn: () => fetchCustomerDeliveryLocationById(locationId),
    enabled: !!locationId,
  });

  const createDeliveryLocationMutation = useMutation({
    mutationFn: (locationData: CustomerDeliveryLocationFormValues) => {
      if (!customerId) throw new Error('Customer ID is required');
      return createCustomerDeliveryLocation(customerId, locationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-delivery-locations', customerId] });
      toast.success('Delivery location created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create delivery location: ${error.message}`);
    },
  });

  const updateDeliveryLocationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerDeliveryLocationFormValues }) => {
      if (!customerId) throw new Error('Customer ID is required');
      return updateCustomerDeliveryLocation(id, customerId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-delivery-locations', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-delivery-location', data.id] });
      toast.success('Delivery location updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update delivery location: ${error.message}`);
    },
  });

  const deleteDeliveryLocationMutation = useMutation({
    mutationFn: (id: string) => deleteCustomerDeliveryLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-delivery-locations', customerId] });
      toast.success('Delivery location deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete delivery location: ${error.message}`);
    },
  });

  return {
    deliveryLocations: deliveryLocationsQuery.data || [],
    isLoadingDeliveryLocations: deliveryLocationsQuery.isLoading,
    isErrorDeliveryLocations: deliveryLocationsQuery.isError,
    errorDeliveryLocations: deliveryLocationsQuery.error,
    
    getDeliveryLocationById: deliveryLocationByIdQuery,
    
    createDeliveryLocation: createDeliveryLocationMutation.mutate,
    isCreatingDeliveryLocation: createDeliveryLocationMutation.isPending,
    
    updateDeliveryLocation: updateDeliveryLocationMutation.mutate,
    isUpdatingDeliveryLocation: updateDeliveryLocationMutation.isPending,
    
    deleteDeliveryLocation: deleteDeliveryLocationMutation.mutate,
    isDeletingDeliveryLocation: deleteDeliveryLocationMutation.isPending,
  };
}
