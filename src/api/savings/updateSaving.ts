
import { supabase } from "@/integrations/supabase/client";
import { SavingTableItem } from "@/types/saving";

export async function updateSaving(
  id: string,
  updates: { 
    name: string; 
    description?: string; 
    unit_of_measure_id?: string | null;
  }
): Promise<SavingTableItem> {
  const { data, error } = await supabase
    .from('savings')
    .update({
      name: updates.name,
      description: updates.description || null,
      unit_of_measure_id: updates.unit_of_measure_id || null
    })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) throw error;
  
  if (!data) {
    throw new Error("Failed to update saving");
  }
  
  // Fetch the unit of measure details if there's a unit_of_measure_id
  let unitName = null;
  let isInventoryUnit = false;
  
  if (data.unit_of_measure_id) {
    const { data: unitData, error: unitError } = await supabase
      .from('unit_of_measures')
      .select('name, abbreviation, is_inventory_unit')
      .eq('id', data.unit_of_measure_id)
      .single();
    
    if (!unitError && unitData) {
      unitName = unitData.abbreviation 
        ? `${unitData.name} (${unitData.abbreviation})` 
        : unitData.name;
      isInventoryUnit = unitData.is_inventory_unit || false;
    }
  }
  
  // Return the updated saving with additional fields
  return {
    ...data,
    unit_of_measure_name: unitName,
    is_inventory_unit: isInventoryUnit
  } as SavingTableItem;
}
