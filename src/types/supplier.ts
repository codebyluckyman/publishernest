
export interface Supplier {
  id: string;
  organization_id: string;
  supplier_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type SortSupplierField = 'supplier_name' | 'created_at' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SupplierFormValues {
  supplier_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  status?: string;
}
