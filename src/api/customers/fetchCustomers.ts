
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

export async function fetchCustomers(organizationId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', organizationId)
    .order('customer_name');

  if (error) {
    throw new Error(`Error fetching customers: ${error.message}`);
  }

  return data as Customer[];
}
