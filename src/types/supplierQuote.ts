import { QuoteRequest } from "./quoteRequest";
import { ExtraCostTableItem } from "./extraCost";
import { SavingTableItem } from "./saving";

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
  reference_id: string | null;
  reference: string | null;
  
  // New fields
  valid_from: string | null;
  valid_to: string | null;
  terms: string | null;
  remarks: string | null;
  production_schedule?: Record<string, string | null> | null;
  
  // Joined fields
  quote_request?: QuoteRequest;
  supplier?: { supplier_name: string }; 
  price_breaks?: SupplierQuotePriceBreak[];
  extra_costs?: SupplierQuoteExtraCost[];
  savings?: SupplierQuoteSaving[];
  attachments?: SupplierQuoteAttachment[];
  formats?: SupplierQuoteFormat[];
  
  // New tables for price break specific costs and savings
  extra_costs_price_breaks?: SupplierQuoteExtraCostPriceBreak[];
  savings_price_breaks?: SupplierQuoteSavingPriceBreak[];
}

export interface SupplierQuoteFormat {
  id: string;
  supplier_quote_id?: string;
  format_id: string;
  quote_request_format_id?: string;
  format_name: string;
  dimensions?: string | null;
  extent?: string | null;
}

export interface SupplierQuoteAttachment {
  id: string;
  supplier_quote_id: string;
  file_name: string;
  file_key: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierQuotePriceBreak {
  id: string;
  supplier_quote_id: string;
  quote_request_format_id: string;
  price_break_id: string;
  quantity: number;
  product_id: string | null;
  unit_cost: number | null;
  // Expanded fields for multiple product unit costs (up to 10)
  unit_cost_1: number | null;
  unit_cost_2: number | null;
  unit_cost_3: number | null;
  unit_cost_4: number | null;
  unit_cost_5: number | null;
  unit_cost_6: number | null;
  unit_cost_7: number | null;
  unit_cost_8: number | null;
  unit_cost_9: number | null;
  unit_cost_10: number | null;
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
  created_at: string;
  updated_at: string;
  
  // Multiple product unit costs (up to 10)
  unit_cost_1: number | null;
  unit_cost_2: number | null;
  unit_cost_3: number | null;
  unit_cost_4: number | null;
  unit_cost_5: number | null;
  unit_cost_6: number | null;
  unit_cost_7: number | null;
  unit_cost_8: number | null;
  unit_cost_9: number | null;
  unit_cost_10: number | null;
  
  // Joined fields
  extra_cost?: ExtraCostTableItem;
}

export interface SupplierQuoteExtraCostPriceBreak {
  id: string;
  supplier_quote_id: string;
  extra_cost_id: string;
  price_break_id: string;
  unit_cost: number | null;
  
  // Multiple product unit costs (up to 10)
  unit_cost_1: number | null;
  unit_cost_2: number | null;
  unit_cost_3: number | null;
  unit_cost_4: number | null;
  unit_cost_5: number | null;
  unit_cost_6: number | null;
  unit_cost_7: number | null;
  unit_cost_8: number | null;
  unit_cost_9: number | null;
  unit_cost_10: number | null;
  
  created_at: string;
  updated_at: string;
}

export interface SupplierQuoteSaving {
  id: string;
  supplier_quote_id: string;
  saving_id: string;
  unit_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Multiple product unit costs (up to 10)
  unit_cost_1: number | null;
  unit_cost_2: number | null;
  unit_cost_3: number | null;
  unit_cost_4: number | null;
  unit_cost_5: number | null;
  unit_cost_6: number | null;
  unit_cost_7: number | null;
  unit_cost_8: number | null;
  unit_cost_9: number | null;
  unit_cost_10: number | null;
  
  // Joined fields
  saving?: SavingTableItem;
}

export interface SupplierQuoteSavingPriceBreak {
  id: string;
  supplier_quote_id: string;
  saving_id: string;
  price_break_id: string;
  unit_cost: number | null;
  notes: string | null;
  
  // Multiple product unit costs (up to 10)
  unit_cost_1: number | null;
  unit_cost_2: number | null;
  unit_cost_3: number | null;
  unit_cost_4: number | null;
  unit_cost_5: number | null;
  unit_cost_6: number | null;
  unit_cost_7: number | null;
  unit_cost_8: number | null;
  unit_cost_9: number | null;
  unit_cost_10: number | null;
  
  created_at: string;
  updated_at: string;
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
    // Expanded fields for multiple product unit costs (up to 10)
    unit_cost_1: number | null;
    unit_cost_2: number | null;
    unit_cost_3: number | null;
    unit_cost_4: number | null;
    unit_cost_5: number | null;
    unit_cost_6: number | null;
    unit_cost_7: number | null;
    unit_cost_8: number | null;
    unit_cost_9: number | null;
    unit_cost_10: number | null;
  }[];
  extra_costs: {
    extra_cost_id: string;
    price_breaks: {
      price_break_id: string;
      unit_cost: number | null;
      // Multiple product unit costs (up to 10)
      unit_cost_1: number | null;
      unit_cost_2: number | null;
      unit_cost_3: number | null;
      unit_cost_4: number | null;
      unit_cost_5: number | null;
      unit_cost_6: number | null;
      unit_cost_7: number | null;
      unit_cost_8: number | null;
      unit_cost_9: number | null;
      unit_cost_10: number | null;
    }[];
  }[];
  savings: {
    saving_id: string;
    price_breaks: {
      price_break_id: string;
      unit_cost: number | null;
      // Multiple product unit costs (up to 10)
      unit_cost_1: number | null;
      unit_cost_2: number | null;
      unit_cost_3: number | null;
      unit_cost_4: number | null;
      unit_cost_5: number | null;
      unit_cost_6: number | null;
      unit_cost_7: number | null;
      unit_cost_8: number | null;
      unit_cost_9: number | null;
      unit_cost_10: number | null;
    }[];
    notes?: string;
  }[];
  notes?: string;
  currency: string;
  reference?: string;
  
  // New fields
  valid_from?: string;
  valid_to?: string;
  terms?: string;
  remarks?: string;
  production_schedule?: Record<string, string | null>;
}
