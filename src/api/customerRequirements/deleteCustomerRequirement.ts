
import { supabase } from "@/integrations/supabase/client";

export async function deleteCustomerRequirement(requirementId: string): Promise<void> {
  const { error } = await supabase
    .from('customer_requirements')
    .delete()
    .eq('id', requirementId);

  if (error) {
    throw new Error(`Error deleting customer requirement: ${error.message}`);
  }
}
