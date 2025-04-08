
export interface PrintRun {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PrintRunFormValues {
  title: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export type SortPrintRunField = 'title' | 'created_at' | 'status';
export type SortDirection = 'asc' | 'desc';
