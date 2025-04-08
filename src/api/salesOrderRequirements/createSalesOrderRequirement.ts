
import { supabase } from "@/integrations/supabase/client";
import { SalesOrderRequirement } from "@/types/customerRequirement";

type CreateSalesOrderRequirementInput = Omit<SalesOrderRequirement, 'id' | 'created_at' | 'updated_at' | 'requirement'>;

export async function createSalesOrderRequirement(
  requirementData: CreateSalesOrderRequirementInput
): Promise<SalesOrderRequirement> {
  const { data, error } = await supabase
    .from('sales_order_requirements')
    .insert(requirementData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating sales order requirement: ${error.message}`);
  }

  return data;
}
