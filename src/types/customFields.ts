
export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface ProductCustomField {
  id: string;
  organization_id: string;
  field_name: string;
  field_key: string;
  field_type: FieldType;
  options?: {
    values?: string[];
    [key: string]: any;
  };
  is_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCustomFieldValue {
  id: string;
  product_id: string;
  field_id: string;
  field_value: any;
  created_at: string;
  updated_at: string;
  field?: ProductCustomField;
}
