
import { ExtraCost, DefaultExtraCost } from "./extraCost";
import { Saving, DefaultSaving } from "./saving";

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
  currency: string;
  reference_id?: string; 
  supplier_name?: string; // Joined field
  supplier_names?: string[]; // Array of supplier names mapped from supplier_ids
  formats?: QuoteRequestFormat[]; // Added field for associated formats
  extra_costs?: ExtraCost[]; // Added field for extra costs
  savings?: Saving[]; // Added field for savings
  production_schedule_requested: boolean; // Field is now required since we added it to the database
  required_step_id?: string | null; // Added optional step ID
  required_step_date?: string | null; // Added optional step date
  
  // UPDATED: required_step is now an object from Supabase, not an array
  required_step?: { id: string, step_name: string } | null; // The raw step data from Supabase
  required_step_name?: string | null; // The extracted step name for use in components
}

export interface QuoteRequestFormat {
  id: string;
  quote_request_id: string;
  format_id: string;
  notes: string | null;
  format_name?: string; // Joined field from format.format_name
  products?: QuoteRequestFormatProduct[]; // Products linked to this format
  price_breaks?: PriceBreak[]; // Price breaks for this format
  num_products?: number; // Number of products for all price breaks
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
  quantity: number;
  num_products?: number; // This will be maintained for compatibility but set at format level
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
    notes?: string;
    products?: {
      product_id: string;
      quantity: number;
      notes?: string;
    }[];
    price_breaks?: {
      quantity: number;
    }[];
    num_products?: number; // Single number of products for all price breaks
  }[];
  products?: Record<string, any>;
  quantities?: Record<string, any>;
  extra_costs?: DefaultExtraCost[]; 
  savings?: DefaultSaving[]; // New field for savings
  currency?: string;
  reference_id?: string; // Added reference ID field
  production_schedule_requested?: boolean; // New field for production schedule request
  required_step_id?: string | null; // Added optional step ID
  required_step_date?: Date | null; // Added optional step date
}

export type SortQuoteRequestField = 'title' | 'requested_at' | 'status' | 'supplier_name' | 'due_date';
export type SortDirection = 'asc' | 'desc';

export interface QuoteRequestAudit {
  id: string;
  quote_request_id: string | null;
  changed_by: string | null;
  action: 'create' | 'update' | 'status_change' | 'delete';
  changes: Record<string, { previous: any; new: any }>;
  created_at: string;
  changed_by_user?: { email: string } | undefined;
}
