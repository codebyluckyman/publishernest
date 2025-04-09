
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

export async function fetchCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching customer: ${error.message}`);
  }

  return data as Customer;
}
