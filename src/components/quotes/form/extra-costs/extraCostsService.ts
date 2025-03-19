
import { supabase } from "@/integrations/supabase/client";
import { ExtraCostTableItem } from "@/types/extraCost";

export async function fetchExtraCosts(organizationId?: string): Promise<ExtraCostTableItem[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('extra_costs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as ExtraCostTableItem[];
}

export async function createExtraCost(
  organizationId: string, 
  newCost: { name: string; description: string; unit_of_measure: string }
): Promise<ExtraCostTableItem> {
  const { data, error } = await supabase
    .from('extra_costs')
    .insert({
      name: newCost.name,
      description: newCost.description,
      unit_of_measure: newCost.unit_of_measure,
      organization_id: organizationId
    })
    .select();
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to create extra cost");
  }
  
  return data[0] as ExtraCostTableItem;
}

export async function updateExtraCost(
  id: string,
  updates: { name: string; description: string; unit_of_measure: string }
): Promise<ExtraCostTableItem> {
  const { data, error } = await supabase
    .from('extra_costs')
    .update({
      name: updates.name,
      description: updates.description,
      unit_of_measure: updates.unit_of_measure
    })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to update extra cost");
  }
  
  return data[0] as ExtraCostTableItem;
}

export async function deleteExtraCost(id: string): Promise<void> {
  const { error } = await supabase
    .from('extra_costs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
