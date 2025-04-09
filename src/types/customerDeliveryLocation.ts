
export interface CustomerDeliveryLocation {
  id: string;
  customer_id: string;
  location_name: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_default: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDeliveryLocationFormValues {
  location_name: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_default?: boolean;
  notes?: string;
}
