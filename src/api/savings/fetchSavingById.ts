
import { supabase } from "@/integrations/supabase/client";
import { SavingTableItem } from "@/types/saving";

export async function fetchSavingById(id: string): Promise<SavingTableItem | null> {
  if (!id) return null;
  
  const { data, error } = await supabase
    .from('savings')
    .select(`
      *,
      unit_of_measures(id, name, abbreviation, is_inventory_unit)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned error
      return null;
    }
    throw error;
  }
  
  if (!data) return null;
  
  const unitOfMeasure = data.unit_of_measures ? data.unit_of_measures : null;
  let unitName = null;
  
  if (unitOfMeasure && unitOfMeasure.name) {
    unitName = unitOfMeasure.abbreviation 
      ? `${unitOfMeasure.name} (${unitOfMeasure.abbreviation})` 
      : unitOfMeasure.name;
  }
  
  return {
    ...data,
    unit_of_measure_id: data.unit_of_measure_id || null,
    unit_of_measure_name: unitName,
    is_inventory_unit: unitOfMeasure?.is_inventory_unit || false
  } as SavingTableItem;
}
