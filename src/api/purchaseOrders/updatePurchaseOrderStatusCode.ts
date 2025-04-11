
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PurchaseOrderStatusCode } from '@/types/purchaseOrder';

interface UpdatePurchaseOrderStatusCodeInput {
  id: string;
  statusCode: PurchaseOrderStatusCode;
  userId: string;
  notes?: string;
}

export async function updatePurchaseOrderStatusCode({
  id,
  statusCode,
  userId,
  notes,
}: UpdatePurchaseOrderStatusCodeInput): Promise<void> {
  const updateData: Record<string, any> = { 
    status_code: statusCode 
  };
  
  // Set appropriate timestamps and user IDs based on status code
  switch (statusCode) {
    case '10':
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = userId;
      break;
    case '15':
      updateData.issued_at = new Date().toISOString();
      updateData.issued_by = userId;
      break;
    case '20':
      updateData.scheduled_at = new Date().toISOString();
      updateData.scheduled_by = userId;
      break;
    case '30':
      updateData.production_started_at = new Date().toISOString();
      updateData.production_started_by = userId;
      break;
    case '40':
      updateData.production_completed_at = new Date().toISOString();
      updateData.production_completed_by = userId;
      break;
    case '50':
      updateData.awaiting_shipment_at = new Date().toISOString();
      updateData.awaiting_shipment_by = userId;
      break;
    case '60':
      updateData.shipped_at = new Date().toISOString();
      updateData.shipped_by = userId;
      break;
    case '70':
      updateData.received_at = new Date().toISOString();
      updateData.received_by = userId;
      break;
    case '80':
      updateData.goods_checked_at = new Date().toISOString();
      updateData.goods_checked_by = userId;
      break;
    case '90':
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = userId;
      break;
  }

  // Update the purchase order status
  const { error } = await supabaseCustom
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating purchase order status code:', error);
    throw error;
  }

  // Create audit entry for status change
  await supabaseCustom.rpc('record_purchase_order_audit', {
    p_purchase_order_id: id,
    p_changed_by: userId,
    p_action: 'status_code_change',
    p_changes: { 
      status_code: statusCode, 
      notes: notes || null 
    },
  });
}
