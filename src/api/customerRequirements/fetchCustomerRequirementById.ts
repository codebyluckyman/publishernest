
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { CustomerRequirement } from "@/types/customerRequirement";

export async function fetchCustomerRequirementById(requirementId: string): Promise<CustomerRequirement> {
  const { data, error } = await supabaseCustom
    .from('customer_requirements')
    .select('*')
    .eq('id', requirementId)
    .single();

  if (error) {
    throw new Error(`Error fetching customer requirement: ${error.message}`);
  }

  return data as CustomerRequirement;
}
