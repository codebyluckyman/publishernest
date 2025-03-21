
import { QuoteRequest, QuoteRequestFormat, PriceBreak, QuoteRequestFormatProduct } from "./quoteRequest";
import { ExtraCost } from "./extraCost";
import { Saving } from "./saving";

export type SupplierQuoteStatus = 'draft' | 'submitted' | 'accepted' | 'declined';

export interface SupplierQuote {
  id: string;
  organization_id: string;
  quote_request_id: string;
  supplier_id: string;
  status: SupplierQuoteStatus;
  total_cost: number | null;
  currency: string;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  quote_request?: QuoteRequest;
  supplier?: { supplier_name: string }; // Add the supplier field
  price_breaks?: SupplierQuotePriceBreak[];
  extra_costs?: SupplierQuoteExtraCost[];
  savings?: SupplierQuoteSaving[];
}

export interface SupplierQuotePriceBreak {
  id: string;
  supplier_quote_id: string;
  quote_request_format_id: string;
  price_break_id: string;
  quantity: number;
  product_id: string | null;
  unit_cost: number | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  format?: {
    format_id: string;
    quote_request_id: string;
    notes?: string | null;
  };
  product?: {
    product_id: string;
    quantity: number;
    notes?: string | null;
  };
}

export interface SupplierQuoteExtraCost {
  id: string;
  supplier_quote_id: string;
  extra_cost_id: string;
  unit_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  extra_cost?: ExtraCost;
}

export interface SupplierQuoteSaving {
  id: string;
  supplier_quote_id: string;
  saving_id: string;
  unit_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  saving?: Saving;
}

export interface SupplierQuoteFormValues {
  quote_request_id: string;
  supplier_id: string;
  price_breaks: {
    quote_request_format_id: string;
    price_break_id: string;
    quantity: number;
    product_id?: string;
    unit_cost: number | null;
  }[];
  extra_costs: {
    extra_cost_id: string;
    unit_cost: number | null;
    notes?: string;
  }[];
  savings: {
    saving_id: string;
    unit_cost: number | null;
    notes?: string;
  }[];
  notes?: string;
  currency: string;
}
