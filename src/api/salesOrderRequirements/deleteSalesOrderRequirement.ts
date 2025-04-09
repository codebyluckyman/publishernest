
import { supabaseCustom } from "@/integrations/supabase/client-custom";

export async function deleteSalesOrderRequirement(requirementId: string): Promise<void> {
  const { error } = await supabaseCustom
    .from('sales_order_requirements')
    .delete()
    .eq('id', requirementId);

  if (error) {
    throw new Error(`Error deleting sales order requirement: ${error.message}`);
  }
}
