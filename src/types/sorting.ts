
export type SortDirection = 'asc' | 'desc';

export type CustomerSortField = 'customer_name' | 'contact_name' | 'contact_email' | 'status';
export type SalesOrderSortField = 'so_number' | 'customer_name' | 'status' | 'issue_date' | 'grand_total';
export type SupplierSortField = 'supplier_name' | 'created_at' | 'status';
export type PurchaseOrderSortField = 'po_number' | 'supplier_name' | 'issue_date' | 'delivery_date' | 'total_amount' | 'status_code';

export interface SortConfig<T> {
  field: T;
  direction: SortDirection;
}
