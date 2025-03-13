
export interface QuoteRequest {
  id: string;
  organization_id: string;
  supplier_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'approved' | 'declined';
  requested_by: string;
  requested_at: string;
  updated_at: string;
  expected_delivery_date: string | null;
  products: Record<string, any> | null;
  quantities: Record<string, any> | null;
  notes: string | null;
  supplier_name?: string; // Joined field
  formats?: QuoteRequestFormat[]; // Added field for associated formats
}

export interface QuoteRequestFormat {
  id: string;
  quote_request_id: string;
  format_id: string;
  quantity: number;
  notes: string | null;
  format_name?: string; // Joined field
}

export interface QuoteRequestFormValues {
  title: string;
  supplier_id: string;
  description?: string;
  expected_delivery_date?: Date;
  notes?: string;
  formats?: {
    format_id: string;
    quantity: number;
    notes?: string;
  }[];
  products?: Record<string, any>;
  quantities?: Record<string, any>;
}

export type SortQuoteRequestField = 'title' | 'requested_at' | 'status' | 'supplier_name';
export type SortDirection = 'asc' | 'desc';
