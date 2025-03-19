
import { supabase } from "@/integrations/supabase/client";
import { ExtraCostTableItem } from "@/types/extraCost";

export async function fetchExtraCosts(organizationId?: string): Promise<ExtraCostTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('extra_costs')
    .select('*, unit_of_measure')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Add unit_of_measure_name to match our component expectations
  const extraCostsWithUnitNames = data.map(cost => ({
    ...cost,
    unit_of_measure_id: null, // Add this to maintain type compatibility
    unit_of_measure_name: cost.unit_of_measure || null
  }));
  
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
    unit_of_measure_id: null, // For type compatibility
    unit_of_measure_name: result.unit_of_measure || null
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
    unit_of_measure_id: null, // For type compatibility
    unit_of_measure_name: result.unit_of_measure || null
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
