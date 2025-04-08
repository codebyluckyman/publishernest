
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPurchaseOrders,
  fetchPurchaseOrderById, 
  createPurchaseOrder, 
  updatePurchaseOrder, 
  deletePurchaseOrder,
  updatePurchaseOrderStatus
} from '@/api/purchaseOrders';
import { useOrganization } from './useOrganization';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { PurchaseOrderStatus } from '@/types/purchaseOrder';

export function usePurchaseOrders(options?: {
  printRunId?: string;
  supplierId?: string;
  status?: string;
}) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  const { printRunId, supplierId, status } = options || {};
  
  const purchaseOrdersQuery = useQuery({
    queryKey: ['purchaseOrders', currentOrganization?.id, printRunId, supplierId, status],
    queryFn: () => {
      if (!currentOrganization) return Promise.resolve([]);
      return fetchPurchaseOrders({
        organizationId: currentOrganization.id,
        printRunId,
        supplierId,
        status
      });
    },
    enabled: !!currentOrganization,
  });

  const { user } = useAuth();

  const createPurchaseOrderMutation = useMutation({
    mutationFn: (data: Parameters<typeof createPurchaseOrder>[0]) => {
      if (!currentOrganization || !user) throw new Error('Organization or user not available');
      return createPurchaseOrder({
        ...data,
        organizationId: currentOrganization.id,
        createdBy: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success('Purchase order created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updatePurchaseOrderMutation = useMutation({
    mutationFn: (data: Parameters<typeof updatePurchaseOrder>[0]) => {
      if (!user) throw new Error('User not available');
      return updatePurchaseOrder({
        ...data,
        updatedBy: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success('Purchase order updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const deletePurchaseOrderMutation = useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('User not available');
      return deletePurchaseOrder(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success('Purchase order deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting purchase order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: PurchaseOrderStatus; reason?: string }) => {
      if (!user) throw new Error('User not available');
      return updatePurchaseOrderStatus({ id, status, userId: user.id, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success('Purchase order status updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating purchase order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  return {
    purchaseOrders: purchaseOrdersQuery.data || [],
    isLoading: purchaseOrdersQuery.isLoading,
    isError: purchaseOrdersQuery.isError,
    error: purchaseOrdersQuery.error,
    createPurchaseOrder: createPurchaseOrderMutation.mutate,
    updatePurchaseOrder: updatePurchaseOrderMutation.mutate,
    deletePurchaseOrder: deletePurchaseOrderMutation.mutate,
    updatePurchaseOrderStatus: updateStatusMutation.mutate,
  };
}

export function usePurchaseOrderDetails(id?: string) {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return fetchPurchaseOrderById(id);
    },
    enabled: !!id,
  });
}
