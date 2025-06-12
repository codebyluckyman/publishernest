export interface SalesOrder {
  id: string;
  organization_id: string;
  customer_id: string;
  print_run_id?: string;
  delivery_location_id?: string;
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
  customer_purchase_order?: string;
  customer_contact_name?: string;
  fob_date?: string;
  departing_port?: string;
  sales_person?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  customer?: {
    id: string;
    customer_name: string;
    address?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  };
  delivery_location?: {
    id: string;
    location_name: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
  };
  line_items?: Array<{
    id: string;
    product_id: string;
    format_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: {
      id: string;
      title: string;
      isbn13?: string;
      cover_image_url?: string;
    };
    format?: {
      id: string;
      format_name: string;
    };
  }>;
  charges?: Array<{
    id: string;
    description: string;
    amount: number;
    taxable: boolean;
  }>;
}

export interface SalesOrderLineItem {
  id: string;
  sales_order_id: string;
  purchase_order_line_item_id?: string;
  product_id: string;
  format_id?: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_cost: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderCharge {
  id: string;
  sales_order_id: string;
  charge_type: string;
  description: string;
  amount: number;
  taxable: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderAudit {
  id: string;
  sales_order_id: string;
  changed_by?: string;
  action: string;
  changes?: any;
  created_at: string;
}
