
import { supabase } from "@/integrations/supabase/client";

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting customer: ${error.message}`);
  }

  return true;
}
