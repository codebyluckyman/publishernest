
import { supabase } from "@/integrations/supabase/client";
import { ExtraCostTableItem } from "@/types/extraCost";

export async function fetchExtraCosts(organizationId?: string): Promise<ExtraCostTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('extra_costs')
    .select(`
      *,
      unit_of_measures(id, name)
    `)
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    unit_of_measure_name: item.unit_of_measures ? item.unit_of_measures.name : null
  })) as ExtraCostTableItem[];
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
    .select(`
      *,
      unit_of_measures(id, name)
    `);
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to create extra cost");
  }
  
  const result = data[0];
  return {
    ...result,
    unit_of_measure_name: result.unit_of_measures ? result.unit_of_measures.name : null
  } as ExtraCostTableItem;
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
    .select(`
      *,
      unit_of_measures(id, name)
    `);
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to update extra cost");
  }
  
  const result = data[0];
  return {
    ...result,
    unit_of_measure_name: result.unit_of_measures ? result.unit_of_measures.name : null
  } as ExtraCostTableItem;
}

export async function deleteExtraCost(id: string): Promise<void> {
  const { error } = await supabase
    .from('extra_costs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
