
import { supabase } from "@/integrations/supabase/client";
import { UnitOfMeasure } from "@/types/unitOfMeasure";

export async function fetchUnitOfMeasures(organizationId?: string): Promise<UnitOfMeasure[]> {
  if (!organizationId) return [];
  
  const { data, error } = await supabase
    .from('unit_of_measures')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as UnitOfMeasure[];
}

export async function createUnitOfMeasure(
  organizationId: string, 
  newUnit: { name: string; abbreviation?: string }
): Promise<UnitOfMeasure> {
  const { data, error } = await supabase
    .from('unit_of_measures')
    .insert({
      name: newUnit.name,
      abbreviation: newUnit.abbreviation || null,
      organization_id: organizationId
    })
    .select();
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to create unit of measure");
  }
  
  return data[0] as UnitOfMeasure;
}

export async function updateUnitOfMeasure(
  id: string,
  updates: { name: string; abbreviation?: string }
): Promise<UnitOfMeasure> {
  const { data, error } = await supabase
    .from('unit_of_measures')
    .update({
      name: updates.name,
      abbreviation: updates.abbreviation || null
    })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Failed to update unit of measure");
  }
  
  return data[0] as UnitOfMeasure;
}

export async function deleteUnitOfMeasure(id: string): Promise<void> {
  const { error } = await supabase
    .from('unit_of_measures')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
