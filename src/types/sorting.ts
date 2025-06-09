
export type SortDirection = 'asc' | 'desc';

export type CustomerSortField = 'customer_name' | 'contact_name' | 'contact_email' | 'status';
export type SalesOrderSortField = 'so_number' | 'customer_name' | 'status' | 'issue_date' | 'grand_total';

export interface SortConfig<T> {
  field: T;
  direction: SortDirection;
}
