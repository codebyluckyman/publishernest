
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://moscrvrjtwqthgxdiqsa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc2NydnJqdHdxdGhneGRpcXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDg3NjIsImV4cCI6MjA5MTcyNDc2Mn0.AvNZYmZjhnPtTchffw-OCZ1Y9WfVeT1x9i1NbN1Mts8";

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
  customer_requirements: {
    Row: {
      id: string;
      customer_id: string;
      requirement_type: string;
      description: string;
      is_mandatory: boolean;
      created_at: string;
      updated_at: string;
    };
  };
  sales_order_requirements: {
    Row: {
      id: string;
      sales_order_id: string;
      requirement_id: string;
      status: string;
      notes?: string;
      created_at: string;
      updated_at: string;
    };
  };
  sales_presentations: {
    Row: {
      id: string;
      organization_id: string;
      title: string;
      description?: string;
      created_by: string;
      status: string;
      cover_image_url?: string;
      access_code?: string;
      created_at: string;
      updated_at: string;
      published_at?: string;
      expires_at?: string;
    };
    Insert: {
      id?: string;
      organization_id: string;
      title: string;
      description?: string;
      created_by: string;
      status?: string;
      cover_image_url?: string;
      access_code?: string;
      created_at?: string;
      updated_at?: string;
      published_at?: string;
      expires_at?: string;
    };
    Update: {
      id?: string;
      organization_id?: string;
      title?: string;
      description?: string;
      created_by?: string;
      status?: string;
      cover_image_url?: string;
      access_code?: string;
      created_at?: string;
      updated_at?: string;
      published_at?: string;
      expires_at?: string;
    };
  };
  presentation_sections: {
    Row: {
      id: string;
      presentation_id: string;
      title: string;
      description?: string;
      section_order: number;
      section_type: string;
      content?: any;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      presentation_id: string;
      title: string;
      description?: string;
      section_order?: number;
      section_type?: string;
      content?: any;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      presentation_id?: string;
      title?: string;
      description?: string;
      section_order?: number;
      section_type?: string;
      content?: any;
      created_at?: string;
      updated_at?: string;
    };
  };
  presentation_items: {
    Row: {
      id: string;
      section_id: string;
      item_type: string;
      item_id?: string;
      title?: string;
      description?: string;
      custom_price?: number;
      currency?: string;
      custom_content?: any;
      display_order: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      section_id: string;
      item_type: string;
      item_id?: string;
      title?: string;
      description?: string;
      custom_price?: number;
      currency?: string;
      custom_content?: any;
      display_order?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      section_id?: string;
      item_type?: string;
      item_id?: string;
      title?: string;
      description?: string;
      custom_price?: number;
      currency?: string;
      custom_content?: any;
      display_order?: number;
      created_at?: string;
      updated_at?: string;
    };
  };
  presentation_analytics: {
    Row: {
      id: string;
      presentation_id: string;
      view_id: string;
      viewer_ip?: string;
      viewer_device?: string;
      viewer_location?: string;
      view_date: string;
      view_duration?: number;
      sections_viewed?: any[];
      items_viewed?: any[];
      last_activity: string;
    };
    Insert: {
      id?: string;
      presentation_id: string;
      view_id: string;
      viewer_ip?: string;
      viewer_device?: string;
      viewer_location?: string;
      view_date?: string;
      view_duration?: number;
      sections_viewed?: any[];
      items_viewed?: any[];
      last_activity?: string;
    };
    Update: {
      id?: string;
      presentation_id?: string;
      view_id?: string;
      viewer_ip?: string;
      viewer_device?: string;
      viewer_location?: string;
      view_date?: string;
      view_duration?: number;
      sections_viewed?: any[];
      items_viewed?: any[];
      last_activity?: string;
    };
  };
  presentation_shares: {
    Row: {
      id: string;
      presentation_id: string;
      shared_by: string;
      shared_with?: string;
      share_link: string;
      shared_at: string;
      access_count?: number;
      last_accessed?: string;
      expires_at?: string;
    };
    Insert: {
      id?: string;
      presentation_id: string;
      shared_by: string;
      shared_with?: string;
      share_link: string;
      shared_at?: string;
      access_count?: number;
      last_accessed?: string;
      expires_at?: string;
    };
    Update: {
      id?: string;
      presentation_id?: string;
      shared_by?: string;
      shared_with?: string;
      share_link?: string;
      shared_at?: string;
      access_count?: number;
      last_accessed?: string;
      expires_at?: string;
    };
  };
  sales_orders: {
    Row: {
      id: string;
      organization_id: string;
      customer_id: string;
      print_run_id?: string;
      so_number: string;
      status: string;
      currency: string;
      total_amount?: number;
      tax_rate?: number;
      tax_amount?: number;
      grand_total?: number;
      issue_date?: string;
      delivery_date?: string;
      payment_terms?: string;
      notes?: string;
      file_approval_status?: string;
      advance_payment_status?: string;
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
};
