
import { supabase } from '@/integrations/supabase/client';
import { CustomerDeliveryLocation } from '@/types/customerDeliveryLocation';

export async function fetchCustomerDeliveryLocations(customerId: string): Promise<CustomerDeliveryLocation[]> {
  const { data, error } = await supabase
    .from('customer_delivery_locations')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })
    .order('location_name', { ascending: true });

  if (error) {
    console.error('Error fetching customer delivery locations:', error);
    throw error;
  }

  return data || [];
}
