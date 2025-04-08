
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from './useOrganization';
import { 
  fetchSalesOrders, 
  fetchSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  updateSalesOrderStatus
} from '@/api/salesOrders';
import { toast } from 'sonner';

export function useSalesOrders() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const salesOrdersQuery = useQuery({
    queryKey: ['sales-orders', currentOrganization?.id],
    queryFn: () => fetchSalesOrders(currentOrganization!.id),
    enabled: !!currentOrganization,
  });

  const salesOrderByIdQuery = (orderId: string) => useQuery({
    queryKey: ['sales-order', orderId],
    queryFn: () => fetchSalesOrderById(orderId),
    enabled: !!orderId,
  });

  const createSalesOrderMutation = useMutation({
    mutationFn: (orderData: any) => {
      return createSalesOrder({
        ...orderData,
        organizationId: currentOrganization!.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Sales order created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create sales order: ${error.message}`);
    },
  });

  const updateSalesOrderMutation = useMutation({
    mutationFn: updateSalesOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', data.id] });
      toast.success('Sales order updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update sales order: ${error.message}`);
    },
  });

  const deleteSalesOrderMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      deleteSalesOrder(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Sales order deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete sales order: ${error.message}`);
    },
  });

  const updateSalesOrderStatusMutation = useMutation({
    mutationFn: updateSalesOrderStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', data.id] });
      toast.success(`Sales order status updated to ${data.status}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update sales order status: ${error.message}`);
    },
  });

  return {
    salesOrders: salesOrdersQuery.data || [],
    isLoadingSalesOrders: salesOrdersQuery.isLoading,
    isErrorSalesOrders: salesOrdersQuery.isError,
    errorSalesOrders: salesOrdersQuery.error,
    
    getSalesOrderById: salesOrderByIdQuery,
    
    createSalesOrder: createSalesOrderMutation.mutate,
    isCreatingSalesOrder: createSalesOrderMutation.isPending,
    
    updateSalesOrder: updateSalesOrderMutation.mutate,
    isUpdatingSalesOrder: updateSalesOrderMutation.isPending,
    
    deleteSalesOrder: deleteSalesOrderMutation.mutate,
    isDeletingSalesOrder: deleteSalesOrderMutation.isPending,
    
    updateSalesOrderStatus: updateSalesOrderStatusMutation.mutate,
    isUpdatingStatus: updateSalesOrderStatusMutation.isPending,
  };
}
