
import { supabase } from "@/integrations/supabase/client";

interface UpdateSalesOrderStatusParams {
  id: string;
  status: string;
  changedBy: string;
  cancellationReason?: string;
}

export async function updateSalesOrderStatus({
  id,
  status,
  changedBy,
  cancellationReason
}: UpdateSalesOrderStatusParams) {
  // Get original order for comparison
  const { data: originalOrder, error: fetchError } = await supabase
    .from('sales_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching original sales order: ${fetchError.message}`);
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    status
  };

  // Add additional fields based on status
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = changedBy;
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancelled_by = changedBy;
    if (cancellationReason) {
      updateData.cancellation_reason = cancellationReason;
    }
  }

  // Update the sales order
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
    p_changed_by: changedBy,
    p_action: `status_changed_to_${status}`,
    p_changes: {
      old: { status: originalOrder.status },
      new: { status: updatedOrder.status }
    }
  });

  return updatedOrder;
}
