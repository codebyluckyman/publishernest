
import { supabase } from "@/integrations/supabase/client";
import { CustomerRequirement } from "@/types/customerRequirement";

type CreateCustomerRequirementInput = Omit<CustomerRequirement, 'id' | 'created_at' | 'updated_at'>;

export async function createCustomerRequirement(
  requirementData: CreateCustomerRequirementInput
): Promise<CustomerRequirement> {
  const { data, error } = await supabase
    .from('customer_requirements')
    .insert(requirementData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating customer requirement: ${error.message}`);
  }

  return data;
}
