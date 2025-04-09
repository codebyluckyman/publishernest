
import { supabase } from '@/integrations/supabase/client';

export async function deleteCustomerDeliveryLocation(id: string): Promise<void> {
  const { error } = await supabase
    .from('customer_delivery_locations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting customer delivery location with id ${id}:`, error);
    throw error;
  }
}
