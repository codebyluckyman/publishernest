
import { supabase } from "@/integrations/supabase/client";
import { CustomerRequirement } from "@/types/customerRequirement";

type UpdateCustomerRequirementInput = Partial<Omit<CustomerRequirement, 'id' | 'created_at' | 'updated_at'>> & { id: string };

export async function updateCustomerRequirement(
  requirementData: UpdateCustomerRequirementInput
): Promise<CustomerRequirement> {
  const { id, ...dataToUpdate } = requirementData;
  
  const { data, error } = await supabase
    .from('customer_requirements')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating customer requirement: ${error.message}`);
  }

  return data;
}
