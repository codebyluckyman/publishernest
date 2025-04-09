
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

type CreateCustomerParams = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

export async function createCustomer(customerData: CreateCustomerParams) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating customer: ${error.message}`);
  }

  return data as Customer;
}
