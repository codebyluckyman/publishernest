
import { supabase } from "@/integrations/supabase/client";
import { SalesOrderRequirement } from "@/types/customerRequirement";

export async function fetchSalesOrderRequirements(salesOrderId: string): Promise<SalesOrderRequirement[]> {
  const { data, error } = await supabase
    .from('sales_order_requirements')
    .select(`
      *,
      requirement:customer_requirements(*)
    `)
    .eq('sales_order_id', salesOrderId);

  if (error) {
    throw new Error(`Error fetching sales order requirements: ${error.message}`);
  }

  return data || [];
}
