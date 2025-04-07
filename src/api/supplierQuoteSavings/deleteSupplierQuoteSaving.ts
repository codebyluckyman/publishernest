
import { supabase } from "@/integrations/supabase/client";

export async function deleteSupplierQuoteSaving(id: string): Promise<void> {
  const { error } = await supabase
    .from('supplier_quote_savings')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw error;
  }
}
