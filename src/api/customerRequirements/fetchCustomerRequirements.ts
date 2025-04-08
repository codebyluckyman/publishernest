
import { supabase } from "@/integrations/supabase/client";
import { CustomerRequirement } from "@/types/customerRequirement";

export async function fetchCustomerRequirements(customerId: string): Promise<CustomerRequirement[]> {
  const { data, error } = await supabase
    .from('customer_requirements')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching customer requirements: ${error.message}`);
  }

  return data || [];
}
