
export interface Customer {
  id: string;
  organization_id: string;
  customer_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  status: string;
  notes?: string;
  file_approval_required: boolean;
  advance_payment_required: boolean;
  packaging_requirements?: string;
  carton_marking_requirements?: string;
  freight_forwarder?: string;
  delivery_address?: string;
  document_notes?: string;
  created_at: string;
  updated_at: string;
}
