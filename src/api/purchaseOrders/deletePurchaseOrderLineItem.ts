
import { supabaseCustom } from '@/integrations/supabase/client-custom';

export async function deletePurchaseOrderLineItem(id: string): Promise<void> {
  const { error } = await supabaseCustom
    .from('purchase_order_line_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase order line item:', error);
    throw error;
  }
}
