
import { supabase } from '@/integrations/supabase/client';

export async function deletePurchaseOrder(id: string, userId: string): Promise<void> {
  // First, delete related line items
  const { error: lineItemError } = await supabase
    .from('purchase_order_line_items')
    .delete()
    .eq('purchase_order_id', id);

  if (lineItemError) {
    console.error('Error deleting purchase order line items:', lineItemError);
    throw lineItemError;
  }

  // Create audit entry for deletion
  await supabase.rpc('record_purchase_order_audit', {
    p_purchase_order_id: id,
    p_changed_by: userId,
    p_action: 'delete',
    p_changes: {},
  });

  // Delete the purchase order
  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase order:', error);
    throw error;
  }
}
