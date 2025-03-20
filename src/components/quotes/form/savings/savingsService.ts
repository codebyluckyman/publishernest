
import { supabase } from "@/integrations/supabase/client";
import { SavingTableItem } from "@/types/saving";

export async function fetchSavings(organizationId?: string): Promise<SavingTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('savings')
    .select(`
      *,
      unit_of_measures(id, name, abbreviation)
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
      unit_of_measure_name: unitName
    };
  });
  
  return savingsWithUnits as SavingTableItem[];
}

export async function createSaving(
  organizationId: string, 
  newSaving: { 
    name: string; 
    description: string; 
    unit_of_measure_id?: string 
  }
): Promise<SavingTableItem> {
  const { data, error } = await supabase
    .from('savings')
    .insert({
      name: newSaving.name,
      description: newSaving.description,
      unit_of_measure_id: newSaving.unit_of_measure_id || null,
      organization_id: organizationId
    })
    .select('*');
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to create saving");
  }
  
  // Add unit_of_measure_name and unit_of_measure_id for type compatibility
  const result = data[0];
  const enrichedResult = {
    ...result,
    unit_of_measure_id: result.unit_of_measure_id || null,
    unit_of_measure_name: null // We'll need to fetch this separately if needed
  };
  
  return enrichedResult as SavingTableItem;
}

export async function updateSaving(
  id: string,
  updates: { 
    name: string; 
    description: string; 
    unit_of_measure_id?: string 
  }
): Promise<SavingTableItem> {
  const { data, error } = await supabase
    .from('savings')
    .update({
      name: updates.name,
      description: updates.description,
      unit_of_measure_id: updates.unit_of_measure_id || null
    })
    .eq('id', id)
    .select('*');
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to update saving");
  }
  
  // Add unit_of_measure_name and unit_of_measure_id for type compatibility
  const result = data[0];
  const enrichedResult = {
    ...result,
    unit_of_measure_id: result.unit_of_measure_id || null,
    unit_of_measure_name: null // We'll need to fetch this separately if needed
  };
  
  return enrichedResult as SavingTableItem;
}

export async function deleteSaving(id: string): Promise<void> {
  const { error } = await supabase
    .from('savings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
