export interface PurchaseOrderLineItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  format_id?: string;
  quantity: number;
  production_quantity: number;
  transit_quantity: number;
  received_quantity: number;
  unit_cost: number;
  tax_rate?: number;
  tax_amount?: number;
  total_cost: number;
  supplier_quote_id?: string;
  created_at: string;
  updated_at: string;
}

export type NewPurchaseOrderLineItem = Omit<
  PurchaseOrderLineItem,
  "id" | "purchase_order_id" | "created_at" | "updated_at"
>;
