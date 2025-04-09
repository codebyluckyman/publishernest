
import { supabaseCustom } from "@/integrations/supabase/client-custom";

export async function deleteCustomerRequirement(requirementId: string): Promise<void> {
  const { error } = await supabaseCustom
    .from('customer_requirements')
    .delete()
    .eq('id', requirementId);

  if (error) {
    throw new Error(`Error deleting customer requirement: ${error.message}`);
  }
}
