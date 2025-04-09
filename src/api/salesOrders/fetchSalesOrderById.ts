
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder } from "@/types/salesOrder";

export async function fetchSalesOrderById(id: string): Promise<SalesOrder> {
  // Fetch the sales order with expanded details
  const { data: salesOrder, error: orderError } = await supabase
    .from('sales_orders')
    .select(`
      *,
      customer:customer_id (*),
      delivery_location:delivery_location_id (*),
      created_by_user:created_by (
        id,
        email,
        first_name,
        last_name
      ),
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

  // Ensure the response matches the expected SalesOrder type
  return salesOrder as unknown as SalesOrder;
}
