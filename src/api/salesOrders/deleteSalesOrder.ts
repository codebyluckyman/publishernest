
import { supabase } from "@/integrations/supabase/client";

export async function deleteSalesOrder(id: string, userId: string) {
  // Get original order for audit
  const { data: originalOrder, error: fetchError } = await supabase
    .from('sales_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching sales order for deletion: ${fetchError.message}`);
  }

  // Record audit before deletion
  await supabase.rpc('record_sales_order_audit', {
    p_sales_order_id: id,
    p_changed_by: userId,
    p_action: 'deleted',
    p_changes: originalOrder
  });

  // Delete sales order (line items and charges will cascade)
  const { error } = await supabase
    .from('sales_orders')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting sales order: ${error.message}`);
  }

  return true;
}
