
import { supabase } from "@/integrations/supabase/client";

export async function deleteSalesOrderRequirement(requirementId: string): Promise<void> {
  const { error } = await supabase
    .from('sales_order_requirements')
    .delete()
    .eq('id', requirementId);

  if (error) {
    throw new Error(`Error deleting sales order requirement: ${error.message}`);
  }
}
