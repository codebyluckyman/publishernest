
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder } from "@/types/salesOrder";

export async function fetchSalesOrderById(id: string): Promise<SalesOrder> {
  // Fetch the sales order
  const { data: salesOrder, error: orderError } = await supabase
    .from('sales_orders')
    .select(`
      *,
      customer:customer_id (*),
      line_items:sales_order_line_items (
        *,
        product:product_id (*),
        format:format_id (*)
      ),
      charges:sales_order_charges (*)
    `)
    .eq('id', id)
    .single();

  if (orderError) {
    throw new Error(`Error fetching sales order: ${orderError.message}`);
  }

  return salesOrder as SalesOrder;
}
