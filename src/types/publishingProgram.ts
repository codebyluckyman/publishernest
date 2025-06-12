export interface ProgramTag {
  name: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'gray';
}

export interface PublishingProgram {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  program_year?: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  target_budget?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  tags?: ProgramTag[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramFormat {
  id: string;
  program_id: string;
  format_id: string;
  target_quantity?: number;
  budget_allocation?: number;
  status: 'concept' | 'approved' | 'in_production' | 'completed';
  timeline_start?: string;
  timeline_end?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  format?: {
    id: string;
    format_name: string;
  };
}

export interface ProgramTitle {
  id: string;
  program_format_id: string;
  product_id?: string;
  working_title: string;
  target_isbn?: string;
  planned_pub_date?: string;
  content_brief?: string;
  status: 'concept' | 'editorial' | 'design' | 'production' | 'published';
  target_quantity?: number;
  estimated_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  product?: {
    id: string;
    title: string;
    isbn13?: string;
  };
}

export interface CreatePublishingProgramInput {
  name: string;
  description?: string;
  program_year?: number;
  target_budget?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  tags?: ProgramTag[];
}

export interface CreateProgramFormatInput {
  program_id: string;
  format_id: string;
  target_quantity?: number;
  budget_allocation?: number;
  timeline_start?: string;
  timeline_end?: string;
  notes?: string;
}

export interface CreateProgramTitleInput {
  program_format_id: string;
  product_id?: string;
  working_title: string;
  target_isbn?: string;
  planned_pub_date?: string;
  content_brief?: string;
  target_quantity?: number;
  estimated_cost?: number;
  notes?: string;
}
