
export type FieldType = "text" | "number" | "select" | "multiselect" | "boolean" | "date";

export interface ProductCustomField {
  id: string;
  organization_id: string;
  field_name: string;
  field_key: string;
  field_type: FieldType;
  is_required: boolean;
  display_order: number;
  options?: any;
  created_at: string;
  updated_at: string;
}
