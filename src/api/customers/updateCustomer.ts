
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

type UpdateCustomerParams = Partial<Omit<Customer, 'id' | 'organization_id' | 'created_at' | 'updated_at'>> & { id: string };

export async function updateCustomer({ id, ...customerData }: UpdateCustomerParams) {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating customer: ${error.message}`);
  }

  return data as Customer;
}
