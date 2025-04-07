
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteSaving } from "@/types/supplierQuote";

export async function updateSupplierQuoteSaving(id: string, updates: Partial<SupplierQuoteSaving>): Promise<SupplierQuoteSaving> {
  const updateData: Record<string, any> = {};
  
  // Only include fields that are actually being updated
  if (updates.unit_cost !== undefined) updateData.unit_cost = updates.unit_cost;
  if (updates.unit_cost_1 !== undefined) updateData.unit_cost_1 = updates.unit_cost_1;
  if (updates.unit_cost_2 !== undefined) updateData.unit_cost_2 = updates.unit_cost_2;
  if (updates.unit_cost_3 !== undefined) updateData.unit_cost_3 = updates.unit_cost_3;
  if (updates.unit_cost_4 !== undefined) updateData.unit_cost_4 = updates.unit_cost_4;
  if (updates.unit_cost_5 !== undefined) updateData.unit_cost_5 = updates.unit_cost_5;
  if (updates.unit_cost_6 !== undefined) updateData.unit_cost_6 = updates.unit_cost_6;
  if (updates.unit_cost_7 !== undefined) updateData.unit_cost_7 = updates.unit_cost_7;
  if (updates.unit_cost_8 !== undefined) updateData.unit_cost_8 = updates.unit_cost_8;
  if (updates.unit_cost_9 !== undefined) updateData.unit_cost_9 = updates.unit_cost_9;
  if (updates.unit_cost_10 !== undefined) updateData.unit_cost_10 = updates.unit_cost_10;
  if (updates.unit_of_measure_id !== undefined) updateData.unit_of_measure_id = updates.unit_of_measure_id;

  const { data, error } = await supabase
    .from('supplier_quote_savings')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) throw error;
  
  if (!data) {
    throw new Error("Failed to update supplier quote saving");
  }
  
  // Convert the response to the expected type
  return {
    id: data.id,
    supplier_quote_id: data.supplier_quote_id,
    saving_id: data.saving_id,
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
    unit_of_measure_id: data.unit_of_measure_id,
    ...updates // Include any additional properties from the input
  } as SupplierQuoteSaving;
}
