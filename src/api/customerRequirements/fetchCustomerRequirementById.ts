
import { supabase } from "@/integrations/supabase/client";
import { CustomerRequirement } from "@/types/customerRequirement";

export async function fetchCustomerRequirementById(requirementId: string): Promise<CustomerRequirement> {
  const { data, error } = await supabase
    .from('customer_requirements')
    .select('*')
    .eq('id', requirementId)
    .single();

  if (error) {
    throw new Error(`Error fetching customer requirement: ${error.message}`);
  }

  return data;
}
