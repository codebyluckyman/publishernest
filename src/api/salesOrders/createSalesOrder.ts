
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder, SalesOrderLineItem, SalesOrderCharge } from "@/types/salesOrder";

interface CreateSalesOrderParams {
  organizationId: string;
  customerId: string;
  printRunId?: string;
  currency: string;
  lineItems: Omit<SalesOrderLineItem, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>[];
  charges?: Omit<SalesOrderCharge, 'id' | 'sales_order_id' | 'created_at' | 'updated_at'>[];
  notes?: string;
  taxRate?: number;
  paymentTerms?: string;
  deliveryDate?: string;
  createdBy: string;
}

export async function createSalesOrder({
  organizationId,
  customerId,
  printRunId,
  currency,
  lineItems,
  charges = [],
  notes,
  taxRate = 0,
  paymentTerms,
  deliveryDate,
  createdBy
}: CreateSalesOrderParams) {
  // Calculate totals
  const totalAmount = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const taxAmount = totalAmount * (taxRate / 100);
  const chargesTotal = charges.reduce((sum, charge) => {
    return sum + (charge.amount || 0);
  }, 0);
  const grandTotal = totalAmount + taxAmount + chargesTotal;

  // Insert sales order
  const { data: salesOrder, error: orderError } = await supabase
    .from('sales_orders')
    .insert({
      organization_id: organizationId,
      customer_id: customerId,
      print_run_id: printRunId,
      currency,
      total_amount: totalAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      notes,
      payment_terms: paymentTerms,
      delivery_date: deliveryDate,
      created_by: createdBy
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Error creating sales order: ${orderError.message}`);
  }

  // Insert line items
  if (lineItems.length > 0) {
    const salesOrderLineItems = lineItems.map(item => ({
      sales_order_id: salesOrder.id,
      ...item
    }));

    const { error: lineItemsError } = await supabase
      .from('sales_order_line_items')
      .insert(salesOrderLineItems);

    if (lineItemsError) {
      throw new Error(`Error creating line items: ${lineItemsError.message}`);
    }
  }

  // Insert charges
  if (charges.length > 0) {
    const salesOrderCharges = charges.map(charge => ({
      sales_order_id: salesOrder.id,
      ...charge
    }));

    const { error: chargesError } = await supabase
      .from('sales_order_charges')
      .insert(salesOrderCharges);

    if (chargesError) {
      throw new Error(`Error creating charges: ${chargesError.message}`);
    }
  }

  // Record audit
  await supabase.rpc('record_sales_order_audit', {
    p_sales_order_id: salesOrder.id,
    p_changed_by: createdBy,
    p_action: 'created',
    p_changes: salesOrder
  });

  return salesOrder;
}
