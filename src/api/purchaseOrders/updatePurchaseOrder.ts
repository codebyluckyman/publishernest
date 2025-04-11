
import { supabaseCustom } from '@/integrations/supabase/client-custom';

interface UpdatePurchaseOrderInput {
  id: string;
  supplierId?: string;
  currency?: string;
  issueDate?: string;
  deliveryDate?: string;
  notes?: string;
  terms?: string;
  shippingAddress?: string;
  shippingMethod?: string;
  updatedBy: string;
}

export async function updatePurchaseOrder({
  id,
  supplierId,
  currency,
  issueDate,
  deliveryDate,
  notes,
  terms,
  shippingAddress,
  shippingMethod,
  updatedBy,
}: UpdatePurchaseOrderInput): Promise<void> {
  const updateData: any = {};
  
  if (supplierId) updateData.supplier_id = supplierId;
  if (currency) updateData.currency = currency;
  if (issueDate) updateData.issue_date = issueDate;
  if (deliveryDate) updateData.delivery_date = deliveryDate;
  if (notes !== undefined) updateData.notes = notes;
  if (terms !== undefined) updateData.terms = terms;
  if (shippingAddress !== undefined) updateData.shipping_address = shippingAddress;
  if (shippingMethod !== undefined) updateData.shipping_method = shippingMethod;

  // Update the purchase order
  const { error } = await supabaseCustom
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }

  // Create audit entry
  await supabaseCustom.rpc('record_purchase_order_audit', {
    p_purchase_order_id: id,
    p_changed_by: updatedBy,
    p_action: 'update',
    p_changes: updateData,
  });
}
