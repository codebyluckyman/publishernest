
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder, SalesOrderLineItem, SalesOrderCharge } from "@/types/salesOrder";

export async function fetchSalesOrderById(id: string) {
  // Get the sales order
  const { data: salesOrder, error: orderError } = await supabase
    .from('sales_orders')
    .select(`
      *,
      customer:customer_id (*)
    `)
    .eq('id', id)
    .single();

  if (orderError) {
    throw new Error(`Error fetching sales order: ${orderError.message}`);
  }

  // Get line items
  const { data: lineItems, error: lineItemsError } = await supabase
    .from('sales_order_line_items')
    .select(`
      *,
      product:product_id (*),
      format:format_id (*)
    `)
    .eq('sales_order_id', id);

  if (lineItemsError) {
    throw new Error(`Error fetching line items: ${lineItemsError.message}`);
  }

  // Get charges
  const { data: charges, error: chargesError } = await supabase
    .from('sales_order_charges')
    .select('*')
    .eq('sales_order_id', id);

  if (chargesError) {
    throw new Error(`Error fetching charges: ${chargesError.message}`);
  }

  return {
    salesOrder,
    lineItems,
    charges
  };
}
