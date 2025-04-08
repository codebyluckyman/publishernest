
import { supabase } from '@/integrations/supabase/client';
import { CustomerDeliveryLocation } from '@/types/customerDeliveryLocation';

export async function fetchCustomerDeliveryLocationById(id: string): Promise<CustomerDeliveryLocation> {
  const { data, error } = await supabase
    .from('customer_delivery_locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching customer delivery location with id ${id}:`, error);
    throw error;
  }

  if (!data) {
    throw new Error(`No delivery location found with id ${id}`);
  }

  return data as CustomerDeliveryLocation;
}
