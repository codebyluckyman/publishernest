
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrderLineItem } from '@/types/purchaseOrder';

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
  lineItems?: (PurchaseOrderLineItem & { isNew?: boolean; isDeleted?: boolean })[];
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
  lineItems,
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

  // Calculate total amount if line items are provided
  if (lineItems && lineItems.length > 0) {
    const totalAmount = lineItems
      .filter(item => !item.isDeleted)
      .reduce((sum, item) => sum + (item.total_cost || 0), 0);
    updateData.total_amount = totalAmount;
  }

  // Update the purchase order
  const { error } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }

  // Create audit entry
  await supabase.rpc('record_purchase_order_audit', {
    p_purchase_order_id: id,
    p_changed_by: updatedBy,
    p_action: 'update',
    p_changes: updateData,
  });

  // Update line items if provided
  if (lineItems && lineItems.length > 0) {
    // Handle new line items
    const newItems = lineItems.filter(item => item.isNew && !item.isDeleted);
    if (newItems.length > 0) {
      const formattedNewItems = newItems.map(item => ({
        purchase_order_id: id,
        product_id: item.product_id,
        format_id: item.format_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
      }));

      const { error: newItemError } = await supabase
        .from('purchase_order_line_items')
        .insert(formattedNewItems);

      if (newItemError) {
        console.error('Error creating new purchase order line items:', newItemError);
        throw newItemError;
      }
    }

    // Handle updated line items
    const updatedItems = lineItems.filter(item => !item.isNew && !item.isDeleted);
    for (const item of updatedItems) {
      const { error: updateItemError } = await supabase
        .from('purchase_order_line_items')
        .update({
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
        })
        .eq('id', item.id);

      if (updateItemError) {
        console.error('Error updating purchase order line item:', updateItemError);
        throw updateItemError;
      }
    }

    // Handle deleted line items
    const deletedItemIds = lineItems
      .filter(item => !item.isNew && item.isDeleted)
      .map(item => item.id);
    
    if (deletedItemIds.length > 0) {
      const { error: deleteItemError } = await supabase
        .from('purchase_order_line_items')
        .delete()
        .in('id', deletedItemIds);

      if (deleteItemError) {
        console.error('Error deleting purchase order line items:', deleteItemError);
        throw deleteItemError;
      }
    }
  }
}
