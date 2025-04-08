
import { supabase } from "@/integrations/supabase/client";

interface UpdateStatusParams {
  id: string;
  status: 'draft' | 'pending' | 'approved' | 'cancelled' | 'completed';
  userId: string;
  reason?: string;
}

export async function updateSalesOrderStatus({
  id,
  status,
  userId,
  reason
}: UpdateStatusParams) {
  // Get original order for comparison
  const { data: originalOrder, error: fetchError } = await supabase
    .from('sales_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching sales order: ${fetchError.message}`);
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    status
  };

  // Add specific fields based on status
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = userId;
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancelled_by = userId;
    updateData.cancellation_reason = reason;
  }

  // Update sales order
  const { data: updatedOrder, error: updateError } = await supabase
    .from('sales_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Error updating sales order status: ${updateError.message}`);
  }

  // Record audit
  await supabase.rpc('record_sales_order_audit', {
    p_sales_order_id: id,
    p_changed_by: userId,
    p_action: `status_changed_to_${status}`,
    p_changes: {
      old_status: originalOrder.status,
      new_status: status,
      reason: reason
    }
  });

  return updatedOrder;
}
