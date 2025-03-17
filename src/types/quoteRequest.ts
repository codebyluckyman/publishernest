
export interface QuoteRequest {
  id: string;
  organization_id: string;
  supplier_id: string | null;
  supplier_ids: string[];
  title: string;
  description: string | null;
  status: 'pending' | 'approved' | 'declined';
  requested_by: string;
  requested_at: string;
  updated_at: string;
  due_date: string | null;
  products: Record<string, any> | null;
  quantities: Record<string, any> | null;
  notes: string | null;
  supplier_name?: string; // Joined field
  supplier_names?: string[]; // Array of supplier names mapped from supplier_ids
  formats?: QuoteRequestFormat[]; // Added field for associated formats
}

export interface QuoteRequestFormat {
  id: string;
  quote_request_id: string;
  format_id: string;
  quantity: number;
  notes: string | null;
  format_name?: string; // Joined field from format.format_name
  products?: QuoteRequestFormatProduct[]; // Products linked to this format
  price_breaks?: PriceBreak[]; // Added price breaks
}

export interface QuoteRequestFormatProduct {
  id?: string;
  quote_request_format_id?: string;
  product_id: string;
  quantity: number;
  notes?: string | null;
  product_name?: string; // Joined field
  format_extras?: {
    foil?: boolean;
    spot_uv?: boolean;
    glitter?: boolean;
    embossing?: boolean;
    die_cut?: boolean;
    holographic?: boolean;
  } | null;
  format_extra_comments?: string | null;
}

export interface PriceBreak {
  id?: string;
  quote_request_format_id?: string;
  from_quantity: number;
  to_quantity: number;
  one_product_price?: boolean;
  two_products_price?: boolean;
  three_products_price?: boolean;
  four_products_price?: boolean;
}

export interface QuoteRequestFormValues {
  id?: string;
  title: string;
  supplier_id?: string; // Keep for backward compatibility
  supplier_ids: string[];
  description?: string;
  due_date?: Date;
  notes?: string;
  formats?: {
    format_id: string;
    quantity: number;
    notes?: string;
    products?: {
      product_id: string;
      quantity: number;
      notes?: string;
    }[];
    price_breaks?: {
      from_quantity: number;
      to_quantity: number;
      one_product_price?: boolean;
      two_products_price?: boolean;
      three_products_price?: boolean;
      four_products_price?: boolean;
    }[];
  }[];
  products?: Record<string, any>;
  quantities?: Record<string, any>;
}

export type SortQuoteRequestField = 'title' | 'requested_at' | 'status' | 'supplier_name' | 'due_date';
export type SortDirection = 'asc' | 'desc';

// Update audit trail interface to make it more flexible
export interface QuoteRequestAudit {
  id: string;
  quote_request_id: string | null;
  changed_by: string | null;
  action: 'create' | 'update' | 'status_change' | 'delete';
  changes: Record<string, { previous: any; new: any }>;
  created_at: string;
  changed_by_user?: { email: string } | undefined;
}
