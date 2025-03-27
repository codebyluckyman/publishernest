
export interface Format {
  id: string;
  format_name: string;
  organization_id: string;
  category_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FormatCategory {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedFormats {
  data: Format[];
  total: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'format_name' | 'created_at' | 'extent_pages';
