
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { CustomerRequirement } from "@/types/customerRequirement";

export async function fetchCustomerRequirements(customerId: string): Promise<CustomerRequirement[]> {
  const { data, error } = await supabaseCustom
    .from('customer_requirements')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching customer requirements: ${error.message}`);
  }

  return data as CustomerRequirement[] || [];
}
