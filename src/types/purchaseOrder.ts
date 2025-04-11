
import { PrintRun } from './printRun';
import { Supplier } from './supplier';

export type PurchaseOrderStatusCode = 
  | '00' // Draft
  | '10' // Approved
  | '15' // Issued to Supplier
  | '20' // Scheduled
  | '30' // In Production
  | '40' // Production Completed
  | '50' // Awaiting Shipment
  | '60' // Shipped
  | '70' // Received
  | '80' // Goods Checked
  | '90' // Completed;

export type PurchaseOrderStatus = 
  | 'draft'
  | 'approved'
  | 'issued'
  | 'scheduled'
  | 'in_production'
  | 'production_completed'
  | 'awaiting_shipment'
  | 'shipped'
  | 'received'
  | 'goods_checked'
  | 'completed'
  | 'cancelled';

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  print_run_id: string;
  supplier_id: string;
  supplier_quote_id?: string;
  po_number: string;
  status: PurchaseOrderStatus;
  status_code: PurchaseOrderStatusCode;
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
  
  // New status tracking fields
  issued_at?: string;
  scheduled_at?: string;
  production_started_at?: string;
  production_completed_at?: string;
  awaiting_shipment_at?: string;
  shipped_at?: string;
  received_at?: string;
  goods_checked_at?: string;
  completed_at?: string;
  
  issued_by?: string;
  scheduled_by?: string;
  production_started_by?: string;
  production_completed_by?: string;
  awaiting_shipment_by?: string;
  shipped_by?: string;
  received_by?: string;
  goods_checked_by?: string;
  completed_by?: string;
  
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

export interface PurchaseOrderAudit {
  id: string;
  purchase_order_id: string;
  changed_by: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
}

export const PURCHASE_ORDER_STATUS_MAP: Record<PurchaseOrderStatusCode, {
  label: string;
  status: PurchaseOrderStatus;
  description: string;
  color: string;
}> = {
  '00': { 
    label: 'Draft', 
    status: 'draft', 
    description: 'Initial stage, preparing the order', 
    color: 'bg-gray-200 text-gray-800' 
  },
  '10': { 
    label: 'Approved', 
    status: 'approved', 
    description: 'Order has been approved', 
    color: 'bg-green-100 text-green-800' 
  },
  '15': { 
    label: 'Issued to Supplier', 
    status: 'issued', 
    description: 'Order has been sent to the supplier', 
    color: 'bg-blue-100 text-blue-800' 
  },
  '20': { 
    label: 'Scheduled', 
    status: 'scheduled', 
    description: 'Production has been scheduled', 
    color: 'bg-indigo-100 text-indigo-800' 
  },
  '30': { 
    label: 'In Production', 
    status: 'in_production', 
    description: 'Order is being manufactured', 
    color: 'bg-purple-100 text-purple-800' 
  },
  '40': { 
    label: 'Production Completed', 
    status: 'production_completed', 
    description: 'Manufacturing is finished', 
    color: 'bg-fuchsia-100 text-fuchsia-800' 
  },
  '50': { 
    label: 'Awaiting Shipment', 
    status: 'awaiting_shipment', 
    description: 'Order is ready for shipping', 
    color: 'bg-pink-100 text-pink-800' 
  },
  '60': { 
    label: 'Shipped', 
    status: 'shipped', 
    description: 'Order has been shipped', 
    color: 'bg-amber-100 text-amber-800' 
  },
  '70': { 
    label: 'Received', 
    status: 'received', 
    description: 'Order has been received', 
    color: 'bg-lime-100 text-lime-800' 
  },
  '80': { 
    label: 'Goods Checked', 
    status: 'goods_checked', 
    description: 'Quality control passed', 
    color: 'bg-emerald-100 text-emerald-800' 
  },
  '90': { 
    label: 'Completed', 
    status: 'completed', 
    description: 'Order has been fulfilled', 
    color: 'bg-teal-100 text-teal-800' 
  }
};
