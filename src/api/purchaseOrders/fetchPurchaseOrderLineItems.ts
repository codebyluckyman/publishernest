
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PurchaseOrderLineItem } from '@/types/purchaseOrderLineItem';

export async function fetchPurchaseOrderLineItems(
  purchaseOrderId: string
): Promise<PurchaseOrderLineItem[]> {
  const { data, error } = await supabaseCustom
    .from('purchase_order_line_items')
    .select(`
      *,
      product:product_id(*),
      format:format_id(*),
      supplier_quote:supplier_quote_id(*)
    `)
    .eq('purchase_order_id', purchaseOrderId)
    .order('created_at');

  if (error) {
    console.error('Error fetching purchase order line items:', error);
    throw error;
  }

  return data as unknown as PurchaseOrderLineItem[];
}
