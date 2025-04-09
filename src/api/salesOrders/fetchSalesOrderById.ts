
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder } from "@/types/salesOrder";
import { fetchUserById } from "@/services/userService";

export async function fetchSalesOrderById(id: string): Promise<SalesOrder> {
  // Fetch the sales order with expanded details
  const { data: salesOrder, error: orderError } = await supabase
    .from('sales_orders')
    .select(`
      *,
      customer:customer_id (*),
      delivery_location:delivery_location_id (*),
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

  // Separately fetch the user who created the sales order
  if (salesOrder && salesOrder.created_by) {
    const createdByUser = await fetchUserById(salesOrder.created_by);
    if (createdByUser) {
      // Add the created_by_user to the sales order
      salesOrder.created_by_user = createdByUser;
    }
  }

  // Ensure the response matches the expected SalesOrder type
  return salesOrder as unknown as SalesOrder;
}
