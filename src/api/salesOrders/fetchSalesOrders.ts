
import { supabase } from "@/integrations/supabase/client";
import { SalesOrder } from "@/types/salesOrder";

export async function fetchSalesOrders(organizationId: string) {
  const { data, error } = await supabase
    .from('sales_orders')
    .select(`
      *,
      customer:customer_id (customer_name)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching sales orders: ${error.message}`);
  }

  return data as (SalesOrder & { customer: { customer_name: string } })[];
}
