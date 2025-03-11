
export interface SupplierQuote {
  id: string;
  organization_id: string;
  quote_request_id: string | null;
  supplier_id: string | null;
  supplier_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  quote_number: string | null;
  quote_date: string;
  valid_until: string | null;
  total_amount: number | null;
  currency_code: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: QuoteItem[];
  quote_request?: {
    title: string;
  };
  supplier?: {
    id: string;
    supplier_name: string;
    contact_email: string | null;
    contact_phone: string | null;
  };
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  product?: {
    title: string;
    isbn13: string | null;
  };
}

export type SortQuoteField = 'supplier_name' | 'quote_date' | 'total_amount' | 'status';
export type SortDirection = 'asc' | 'desc';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected';
