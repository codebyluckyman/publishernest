
import { supabase } from "@/integrations/supabase/client";
import { ExtraCostTableItem } from "@/types/extraCost";

export async function fetchExtraCosts(organizationId?: string): Promise<ExtraCostTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('extra_costs')
    .select('*, unit_of_measure_id')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Since there's no direct relationship to unit_of_measures table,
  // fetch unit_of_measure names separately if needed
  const extraCostsWithUnitNames = await addUnitOfMeasureNames(data);
  
  return extraCostsWithUnitNames as ExtraCostTableItem[];
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
      unit_of_measure_id: newCost.unit_of_measure_id || null,
      organization_id: organizationId
    })
    .select('*');
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to create extra cost");
  }
  
  // Add unit of measure name if applicable
  const result = data[0];
  const enrichedResults = await addUnitOfMeasureNames([result]);
  
  return enrichedResults[0] as ExtraCostTableItem;
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
      unit_of_measure_id: updates.unit_of_measure_id || null
    })
    .eq('id', id)
    .select('*');
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to update extra cost");
  }
  
  // Add unit of measure name if applicable
  const result = data[0];
  const enrichedResults = await addUnitOfMeasureNames([result]);
  
  return enrichedResults[0] as ExtraCostTableItem;
}

export async function deleteExtraCost(id: string): Promise<void> {
  const { error } = await supabase
    .from('extra_costs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Helper function to add unit_of_measure_name to extra costs
async function addUnitOfMeasureNames(extraCosts: any[]): Promise<any[]> {
  if (!extraCosts || extraCosts.length === 0) return [];
  
  // Get all unit_of_measure_ids that are not null
  const unitIds = extraCosts
    .map(cost => cost.unit_of_measure_id)
    .filter(id => id !== null && id !== undefined);
  
  if (unitIds.length === 0) {
    // No unit IDs to look up, return items as is with null unit_of_measure_name
    return extraCosts.map(cost => ({
      ...cost,
      unit_of_measure_name: null
    }));
  }
  
  // Fetch unit of measure data for the relevant IDs
  const { data: unitData, error } = await supabase
    .from('unit_of_measures')
    .select('id, name')
    .in('id', unitIds);
  
  if (error) {
    console.error("Error fetching unit of measures:", error);
    // Still return costs but without unit names
    return extraCosts.map(cost => ({
      ...cost,
      unit_of_measure_name: null
    }));
  }
  
  // Create a map of unit IDs to names for quick lookup
  const unitMap = new Map();
  unitData?.forEach(unit => {
    unitMap.set(unit.id, unit.name);
  });
  
  // Add unit_of_measure_name to each cost
  return extraCosts.map(cost => ({
    ...cost,
    unit_of_measure_name: cost.unit_of_measure_id ? unitMap.get(cost.unit_of_measure_id) || null : null
  }));
}
