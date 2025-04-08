
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderLineItem } from '@/types/purchaseOrder';

export async function fetchPurchaseOrderById(id: string): Promise<{
  purchaseOrder: PurchaseOrder;
  lineItems: PurchaseOrderLineItem[];
}> {
  // Fetch the purchase order
  const { data: purchaseOrder, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      print_run:print_run_id(*),
      supplier:supplier_id(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching purchase order:', error);
    throw error;
  }
  
  if (!purchaseOrder) {
    throw new Error('Purchase order not found');
  }

  // Fetch line items
  const { data: lineItems, error: lineItemsError } = await supabase
    .from('purchase_order_line_items')
    .select('*')
    .eq('purchase_order_id', id);

  if (lineItemsError) {
    console.error('Error fetching purchase order line items:', lineItemsError);
    throw lineItemsError;
  }

  return {
    purchaseOrder: purchaseOrder as PurchaseOrder,
    lineItems: lineItems as PurchaseOrderLineItem[] || [],
  };
}
