
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { SalesOrderRequirement } from "@/types/customerRequirement";

type UpdateSalesOrderRequirementInput = Partial<Omit<SalesOrderRequirement, 'id' | 'created_at' | 'updated_at' | 'requirement'>> & { id: string };

export async function updateSalesOrderRequirement(
  requirementData: UpdateSalesOrderRequirementInput
): Promise<SalesOrderRequirement> {
  const { id, ...dataToUpdate } = requirementData;
  
  const { data, error } = await supabaseCustom
    .from('sales_order_requirements')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating sales order requirement: ${error.message}`);
  }

  return data as SalesOrderRequirement;
}
