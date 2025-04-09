
import { supabase } from '@/integrations/supabase/client';
import { CustomerDeliveryLocation, CustomerDeliveryLocationFormValues } from '@/types/customerDeliveryLocation';

export async function createCustomerDeliveryLocation(
  customerId: string, 
  locationData: CustomerDeliveryLocationFormValues
): Promise<CustomerDeliveryLocation> {
  // If setting this location as default, first unset any existing default
  if (locationData.is_default) {
    await supabase
      .from('customer_delivery_locations')
      .update({ is_default: false })
      .eq('customer_id', customerId)
      .eq('is_default', true);
  }

  // Insert the new location
  const { data, error } = await supabase
    .from('customer_delivery_locations')
    .insert({
      ...locationData,
      customer_id: customerId,
      is_default: locationData.is_default ?? false
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating customer delivery location:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create customer delivery location');
  }

  return data as CustomerDeliveryLocation;
}
