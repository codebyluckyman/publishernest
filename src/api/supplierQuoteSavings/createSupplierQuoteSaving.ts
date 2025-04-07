
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteSaving } from "@/types/supplierQuote";

export async function createSupplierQuoteSaving(saving: Omit<SupplierQuoteSaving, 'id'>): Promise<SupplierQuoteSaving> {
  // Since TypeScript doesn't recognize supplier_quote_savings in the type definitions yet,
  // we need to use the generic approach
  const { data, error } = await supabase
    .from('supplier_quote_savings')
    .insert({
      supplier_quote_id: saving.supplier_quote_id,
      saving_id: saving.saving_id,
      price_break_id: saving.price_break_id || null,
      unit_cost: saving.unit_cost,
      unit_cost_1: saving.unit_cost_1,
      unit_cost_2: saving.unit_cost_2,
      unit_cost_3: saving.unit_cost_3,
      unit_cost_4: saving.unit_cost_4,
      unit_cost_5: saving.unit_cost_5,
      unit_cost_6: saving.unit_cost_6,
      unit_cost_7: saving.unit_cost_7,
      unit_cost_8: saving.unit_cost_8,
      unit_cost_9: saving.unit_cost_9,
      unit_cost_10: saving.unit_cost_10,
      unit_of_measure_id: saving.unit_of_measure_id
    })
    .select('*')
    .single();
  
  if (error) throw error;
  
  if (!data) {
    throw new Error("Failed to create supplier quote saving");
  }
  
  // Convert the response to the expected type
  return {
    id: data.id,
    supplier_quote_id: data.supplier_quote_id,
    saving_id: data.saving_id,
    price_break_id: data.price_break_id || null,
    unit_cost: data.unit_cost,
    unit_cost_1: data.unit_cost_1,
    unit_cost_2: data.unit_cost_2,
    unit_cost_3: data.unit_cost_3,
    unit_cost_4: data.unit_cost_4,
    unit_cost_5: data.unit_cost_5,
    unit_cost_6: data.unit_cost_6,
    unit_cost_7: data.unit_cost_7,
    unit_cost_8: data.unit_cost_8,
    unit_cost_9: data.unit_cost_9,
    unit_cost_10: data.unit_cost_10,
    unit_of_measure_id: data.unit_of_measure_id
  } as SupplierQuoteSaving;
}
