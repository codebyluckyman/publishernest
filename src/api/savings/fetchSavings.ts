
import { supabase } from "@/integrations/supabase/client";
import { SavingTableItem } from "@/types/saving";

export async function fetchSavings(organizationId?: string): Promise<SavingTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('savings')
    .select(`
      *,
      unit_of_measures(id, name, abbreviation, is_inventory_unit)
    `)
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Transform the data to match our SavingTableItem type
  const savingsWithUnits = data.map(saving => {
    const unitOfMeasure = saving.unit_of_measures ? saving.unit_of_measures : null;
    let unitName = null;
    
    if (unitOfMeasure && unitOfMeasure.name) {
      unitName = unitOfMeasure.abbreviation 
        ? `${unitOfMeasure.name} (${unitOfMeasure.abbreviation})` 
        : unitOfMeasure.name;
    }
    
    return {
      ...saving,
      unit_of_measure_id: saving.unit_of_measure_id || null,
      unit_of_measure_name: unitName,
      is_inventory_unit: unitOfMeasure?.is_inventory_unit || false
    };
  });
  
  return savingsWithUnits as SavingTableItem[];
}
