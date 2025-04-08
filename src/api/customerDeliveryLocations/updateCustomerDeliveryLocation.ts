
import { supabase } from '@/integrations/supabase/client';
import { CustomerDeliveryLocation, CustomerDeliveryLocationFormValues } from '@/types/customerDeliveryLocation';

export async function updateCustomerDeliveryLocation(
  id: string,
  customerId: string,
  locationData: CustomerDeliveryLocationFormValues
): Promise<CustomerDeliveryLocation> {
  // If setting this location as default, first unset any existing default
  if (locationData.is_default) {
    await supabase
      .from('customer_delivery_locations')
      .update({ is_default: false })
      .eq('customer_id', customerId)
      .eq('is_default', true)
      .neq('id', id);
  }

  // Update the location
  const { data, error } = await supabase
    .from('customer_delivery_locations')
    .update(locationData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating customer delivery location with id ${id}:`, error);
    throw error;
  }

  return data;
}
