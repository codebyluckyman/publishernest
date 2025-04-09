
import { supabaseCustom } from '@/integrations/supabase/client-custom';

export async function deletePrintRun(id: string): Promise<void> {
  // Check if there are any purchase orders associated with this print run
  const { data: purchaseOrders, error: checkError } = await supabaseCustom
    .from('purchase_orders')
    .select('id')
    .eq('print_run_id', id)
    .limit(1);

  if (checkError) {
    console.error('Error checking for related purchase orders:', checkError);
    throw checkError;
  }

  // If there are related purchase orders, prevent deletion
  if (purchaseOrders && purchaseOrders.length > 0) {
    throw new Error('Cannot delete print run with associated purchase orders');
  }

  // Delete the print run
  const { error } = await supabaseCustom
    .from('print_runs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting print run:', error);
    throw error;
  }
}
