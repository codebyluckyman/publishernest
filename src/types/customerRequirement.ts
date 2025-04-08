
export type RequirementType = 
  | 'packaging'
  | 'shipping'
  | 'quality'
  | 'documentation'
  | 'approval'
  | 'payment'
  | 'other';

export interface CustomerRequirement {
  id: string;
  customer_id: string;
  requirement_type: RequirementType;
  description: string;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderRequirement {
  id: string;
  sales_order_id: string;
  requirement_id: string;
  status: 'pending' | 'completed' | 'waived' | 'failed';
  notes?: string;
  created_at: string;
  updated_at: string;
  requirement?: CustomerRequirement;
}
