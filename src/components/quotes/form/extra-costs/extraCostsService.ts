
import { supabase } from "@/integrations/supabase/client";
import { ExtraCostTableItem } from "@/types/extraCost";

export async function fetchExtraCosts(organizationId?: string): Promise<ExtraCostTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('extra_costs')
    .select(`
      *,
      unit_of_measures(id, name, abbreviation)
    `)
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Transform the data to match our ExtraCostTableItem type
  const extraCostsWithUnits = data.map(cost => {
    const unitOfMeasure = cost.unit_of_measures ? cost.unit_of_measures[0] : null;
    let unitName = null;
    
    if (unitOfMeasure) {
      unitName = unitOfMeasure.abbreviation 
        ? `${unitOfMeasure.name} (${unitOfMeasure.abbreviation})` 
        : unitOfMeasure.name;
    }
    
    return {
      ...cost,
      unit_of_measure_id: cost.unit_of_measure || null,
      unit_of_measure_name: unitName
    };
  });
  
  return extraCostsWithUnits as ExtraCostTableItem[];
}

export async function createExtraCost(
  organizationId: string, 
  newCost: { 
    name: string; 
    description: string; 
    unit_of_measure_id?: string 
  }
): Promise<ExtraCostTableItem> {
  const { data, error } = await supabase
    .from('extra_costs')
    .insert({
      name: newCost.name,
      description: newCost.description,
      unit_of_measure: newCost.unit_of_measure_id || null, // Use unit_of_measure column
      organization_id: organizationId
    })
    .select('*');
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to create extra cost");
  }
  
  // Add unit_of_measure_name and unit_of_measure_id for type compatibility
  const result = data[0];
  const enrichedResult = {
    ...result,
    unit_of_measure_id: result.unit_of_measure || null,
    unit_of_measure_name: null // We'll need to fetch this separately if needed
  };
  
  return enrichedResult as ExtraCostTableItem;
}

export async function updateExtraCost(
  id: string,
  updates: { 
    name: string; 
    description: string; 
    unit_of_measure_id?: string 
  }
): Promise<ExtraCostTableItem> {
  const { data, error } = await supabase
    .from('extra_costs')
    .update({
      name: updates.name,
      description: updates.description,
      unit_of_measure: updates.unit_of_measure_id || null // Use unit_of_measure column
    })
    .eq('id', id)
    .select('*');
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to update extra cost");
  }
  
  // Add unit_of_measure_name and unit_of_measure_id for type compatibility
  const result = data[0];
  const enrichedResult = {
    ...result,
    unit_of_measure_id: result.unit_of_measure || null,
    unit_of_measure_name: null // We'll need to fetch this separately if needed
  };
  
  return enrichedResult as ExtraCostTableItem;
}

export async function deleteExtraCost(id: string): Promise<void> {
  const { error } = await supabase
    .from('extra_costs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
