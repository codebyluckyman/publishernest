
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSupplierCommunications, createSupplierCommunication } from '@/api/supplierCommunications';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { SupplierCommunication } from '@/api/supplierCommunications/fetchSupplierCommunications';

export function useSupplierCommunications(purchaseOrderId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const communicationsQuery = useQuery({
    queryKey: ['supplierCommunications', purchaseOrderId],
    queryFn: () => {
      if (!purchaseOrderId) return Promise.resolve([]);
      return fetchSupplierCommunications(purchaseOrderId);
    },
    enabled: !!purchaseOrderId,
  });

  const createCommunicationMutation = useMutation({
    mutationFn: ({ message, communicationType }: { message: string; communicationType: 'email' | 'phone' | 'note' | 'other' }) => {
      if (!purchaseOrderId || !user) throw new Error('Purchase order ID or user not available');
      
      return createSupplierCommunication({
        purchaseOrderId,
        createdBy: user.id,
        message,
        communicationType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierCommunications', purchaseOrderId] });
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      toast.error(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  return {
    communications: communicationsQuery.data as SupplierCommunication[],
    isLoading: communicationsQuery.isLoading,
    isError: communicationsQuery.isError,
    error: communicationsQuery.error,
    createCommunication: createCommunicationMutation.mutate,
    isCreating: createCommunicationMutation.isPending,
  };
}
