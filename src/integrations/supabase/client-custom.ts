
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vzguoukmiwxvqdnabfma.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z3VvdWttaXd4dnFkbmFiZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwODIxMDcsImV4cCI6MjA1NjY1ODEwN30.3-y83UCuzWeYtjBpFRiM73NpVg0GTbI_VoJj_evFDFw";

// This is a custom client that adds explicit typing support for our tables
// that might not be in the auto-generated types
export const supabaseCustom = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: {
    schema: 'public',
  },
});

// This provides a typed client that includes our custom tables
export type Tables = {
  print_runs: {
    Row: {
      id: string;
      organization_id: string;
      title: string;
      description?: string;
      status: string;
      created_at: string;
      updated_at: string;
      created_by: string;
    };
  };
  purchase_orders: {
    Row: {
      id: string;
      organization_id: string;
      print_run_id: string;
      supplier_id: string;
      supplier_quote_id?: string;
      po_number: string;
      status: string;
      currency: string;
      total_amount?: number;
      issue_date?: string;
      delivery_date?: string;
      terms?: string;
      notes?: string;
      shipping_address?: string;
      shipping_method?: string;
      approved_at?: string;
      approved_by?: string;
      cancelled_at?: string;
      cancelled_by?: string;
      cancellation_reason?: string;
      created_at: string;
      updated_at: string;
      created_by: string;
    };
  };
  purchase_order_line_items: {
    Row: {
      id: string;
      purchase_order_id: string;
      product_id: string;
      format_id?: string;
      quantity: number;
      unit_cost: number;
      total_cost: number;
      created_at: string;
      updated_at: string;
    };
  };
};
