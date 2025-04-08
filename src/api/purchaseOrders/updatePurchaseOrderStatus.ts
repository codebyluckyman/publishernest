
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrderStatus } from '@/types/purchaseOrder';

interface UpdatePurchaseOrderStatusInput {
  id: string;
  status: PurchaseOrderStatus;
  userId: string;
  reason?: string;
}

export async function updatePurchaseOrderStatus({
  id,
  status,
  userId,
  reason,
}: UpdatePurchaseOrderStatusInput): Promise<void> {
  const updateData: any = { status };
  
  // Set appropriate timestamps and user IDs based on status
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = userId;
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancelled_by = userId;
    if (reason) {
      updateData.cancellation_reason = reason;
    }
  }

  // Update the purchase order status
  const { error } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating purchase order status:', error);
    throw error;
  }

  // Create audit entry for status change
  await supabase.rpc('record_purchase_order_audit', {
    p_purchase_order_id: id,
    p_changed_by: userId,
    p_action: 'status_change',
    p_changes: { 
      status, 
      reason: reason || null 
    },
  });
}
