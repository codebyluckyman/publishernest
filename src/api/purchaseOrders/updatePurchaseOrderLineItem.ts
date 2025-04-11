
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PurchaseOrderLineItem } from '@/types/purchaseOrderLineItem';

export async function updatePurchaseOrderLineItem(
  id: string,
  data: Partial<PurchaseOrderLineItem>
): Promise<void> {
  const { error } = await supabaseCustom
    .from('purchase_order_line_items')
    .update({
      product_id: data.product_id,
      format_id: data.format_id,
      quantity: data.quantity,
      in_production_quantity: data.in_production_quantity,
      in_transit_quantity: data.in_transit_quantity, 
      received_quantity: data.received_quantity,
      unit_cost: data.unit_cost,
      tax_rate: data.tax_rate,
      tax_amount: data.tax_amount,
      total_cost: data.total_cost,
      supplier_quote_id: data.supplier_quote_id,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating purchase order line item:', error);
    throw error;
  }
}
