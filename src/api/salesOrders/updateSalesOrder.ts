
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder, SalesOrderLineItem, SalesOrderCharge } from "@/types/salesOrder";

interface UpdateSalesOrderParams {
  id: string;
  customerId?: string;
  printRunId?: string;
  currency?: string;
  lineItems?: Omit<SalesOrderLineItem, 'created_at' | 'updated_at'>[];
  charges?: Omit<SalesOrderCharge, 'created_at' | 'updated_at'>[];
  notes?: string;
  taxRate?: number;
  paymentTerms?: string;
  deliveryDate?: string;
  issueDate?: string;
  fileApprovalStatus?: string;
  advancePaymentStatus?: string;
  changedBy: string;
}

export async function updateSalesOrder({
  id,
  customerId,
  printRunId,
  currency,
  lineItems,
  charges,
  notes,
  taxRate,
  paymentTerms,
  deliveryDate,
  issueDate,
  fileApprovalStatus,
  advancePaymentStatus,
  changedBy
}: UpdateSalesOrderParams) {
  // Get original order for comparison
  const { data: originalOrder, error: fetchError } = await supabase
    .from('sales_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching original sales order: ${fetchError.message}`);
  }

  // Prepare update data
  const updateData: Record<string, any> = {};
  if (customerId) updateData.customer_id = customerId;
  if (printRunId !== undefined) updateData.print_run_id = printRunId;
  if (currency) updateData.currency = currency;
  if (notes !== undefined) updateData.notes = notes;
  if (taxRate !== undefined) updateData.tax_rate = taxRate;
  if (paymentTerms !== undefined) updateData.payment_terms = paymentTerms;
  if (deliveryDate !== undefined) updateData.delivery_date = deliveryDate;
  if (issueDate !== undefined) updateData.issue_date = issueDate;
  if (fileApprovalStatus !== undefined) updateData.file_approval_status = fileApprovalStatus;
  if (advancePaymentStatus !== undefined) updateData.advance_payment_status = advancePaymentStatus;

  // Calculate new totals if line items or tax rate changes
  if (lineItems || taxRate !== undefined) {
    const { data: currentItems } = !lineItems ? 
      await supabase.from('sales_order_line_items').select('*').eq('sales_order_id', id) : 
      { data: [] };
    
    const itemsToCalculate = lineItems || currentItems || [];
    const totalAmount = itemsToCalculate.reduce((sum, item) => sum + (item.total_price || 0), 0);
    
    updateData.total_amount = totalAmount;
    updateData.tax_amount = totalAmount * ((taxRate !== undefined ? taxRate : originalOrder.tax_rate) / 100);
    
    // Calculate charges total if available
    const { data: currentCharges } = !charges ? 
      await supabase.from('sales_order_charges').select('*').eq('sales_order_id', id) : 
      { data: [] };
    
    const chargesToCalculate = charges || currentCharges || [];
    const chargesTotal = chargesToCalculate.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    
    updateData.grand_total = totalAmount + updateData.tax_amount + chargesTotal;
  }

  // Update sales order
  const { data: updatedOrder, error: updateError } = await supabase
    .from('sales_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Error updating sales order: ${updateError.message}`);
  }

  // Update line items if provided
  if (lineItems) {
    // First delete existing line items
    await supabase
      .from('sales_order_line_items')
      .delete()
      .eq('sales_order_id', id);
    
    // Then insert new ones
    if (lineItems.length > 0) {
      const salesOrderLineItems = lineItems.map(item => ({
        ...item,
        sales_order_id: id
      }));

      const { error: lineItemsError } = await supabase
        .from('sales_order_line_items')
        .insert(salesOrderLineItems);

      if (lineItemsError) {
        throw new Error(`Error updating line items: ${lineItemsError.message}`);
      }
    }
  }

  // Update charges if provided
  if (charges) {
    // First delete existing charges
    await supabase
      .from('sales_order_charges')
      .delete()
      .eq('sales_order_id', id);
    
    // Then insert new ones
    if (charges.length > 0) {
      const salesOrderCharges = charges.map(charge => ({
        ...charge,
        sales_order_id: id
      }));

      const { error: chargesError } = await supabase
        .from('sales_order_charges')
        .insert(salesOrderCharges);

      if (chargesError) {
        throw new Error(`Error updating charges: ${chargesError.message}`);
      }
    }
  }

  // Record audit
  await supabase.rpc('record_sales_order_audit', {
    p_sales_order_id: id,
    p_changed_by: changedBy,
    p_action: 'updated',
    p_changes: {
      old: originalOrder,
      new: updatedOrder
    }
  });

  return updatedOrder;
}
