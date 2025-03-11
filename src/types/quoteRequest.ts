
export interface Format {
  id: string;
  format_name: string;
}

export interface QuoteRequest {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'open' | 'closed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  quotes_count?: number;
  formats?: Format[];
}

export type SortQuoteRequestField = 'title' | 'created_at' | 'due_date' | 'status';
export type SortDirection = 'asc' | 'desc';
