
export interface PrintRun {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  status: PrintRunStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type PrintRunStatus = 'draft' | 'in_progress' | 'completed';
