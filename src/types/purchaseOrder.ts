
import { PrintRun } from './printRun';
import { Supplier } from './supplier';

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  print_run_id: string;
  supplier_id: string;
  supplier_quote_id?: string;
  po_number: string;
  status: PurchaseOrderStatus;
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
  
  // Relations (populated through joins)
  print_run?: PrintRun;
  supplier?: Supplier;
}

export interface PurchaseOrderLineItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  format_id?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export type PurchaseOrderStatus = 'draft' | 'pending_approval' | 'approved' | 'fulfilled' | 'cancelled';

export interface PurchaseOrderAudit {
  id: string;
  purchase_order_id: string;
  changed_by: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
}
