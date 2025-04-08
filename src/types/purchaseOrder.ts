
import { PrintRun } from './printRun';

export type PurchaseOrderStatus = 'draft' | 'approved' | 'sent' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  print_run_id: string;
  supplier_id: string;
  supplier_quote_id?: string | null;
  po_number: string;
  status: PurchaseOrderStatus;
  issue_date?: string | null;
  delivery_date?: string | null;
  shipping_address?: string | null;
  shipping_method?: string | null;
  payment_terms?: string | null;
  currency: string;
  total_amount?: number | null;
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
  
  // Foreign key relations
  print_run?: PrintRun;
  supplier?: { supplier_name: string };
  line_items?: PurchaseOrderLineItem[];
}

export interface PurchaseOrderLineItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  format_id?: string | null;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  
  // Foreign key relations
  product?: { title: string; isbn13?: string | null };
  format?: { format_name: string };
}

export interface PurchaseOrderAudit {
  id: string;
  purchase_order_id: string;
  changed_by?: string | null;
  action: 'create' | 'update' | 'status_change' | 'approve' | 'cancel';
  changes?: Record<string, { previous: any; new: any }>;
  created_at: string;
  changed_by_user?: { email: string } | null;
}

export interface PurchaseOrderFormValues {
  print_run_id: string;
  supplier_id: string;
  supplier_quote_id?: string;
  issue_date?: Date;
  delivery_date?: Date;
  shipping_address?: string;
  shipping_method?: string;
  payment_terms?: string;
  currency?: string;
  notes?: string;
  line_items: {
    product_id: string;
    format_id?: string;
    quantity: number;
  }[];
}

export type SortPurchaseOrderField = 'po_number' | 'created_at' | 'status' | 'supplier_name' | 'issue_date' | 'delivery_date';
