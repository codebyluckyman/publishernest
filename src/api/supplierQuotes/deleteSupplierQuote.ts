
import { supabase } from "@/integrations/supabase/client";

export async function deleteSupplierQuote(id: string): Promise<void> {
  // Delete related records first
  
  // Delete price breaks
  const { error: priceBreaksError } = await supabase
    .from('supplier_quote_price_breaks')
    .delete()
    .eq('supplier_quote_id', id);
  
  if (priceBreaksError) {
    console.error("Error deleting supplier quote price breaks:", priceBreaksError);
  }
  
  // Delete extra costs
  const { error: extraCostsError } = await supabase
    .from('supplier_quote_extra_costs')
    .delete()
    .eq('supplier_quote_id', id);
  
  if (extraCostsError) {
    console.error("Error deleting supplier quote extra costs:", extraCostsError);
  }
  
  // Delete savings
  const { error: savingsError } = await supabase
    .from('supplier_quote_savings')
    .delete()
    .eq('supplier_quote_id', id);
  
  if (savingsError) {
    console.error("Error deleting supplier quote savings:", savingsError);
  }
  
  // Delete formats
  const { error: formatsError } = await supabase
    .from('supplier_quote_formats')
    .delete()
    .eq('supplier_quote_id', id);
  
  if (formatsError) {
    console.error("Error deleting supplier quote formats:", formatsError);
  }
  
  // Finally, delete the quote itself
  const { error } = await supabase
    .from('supplier_quotes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
