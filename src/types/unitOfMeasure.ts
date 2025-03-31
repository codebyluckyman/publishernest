
export interface UnitOfMeasure {
  id: string;
  organization_id: string;
  name: string;
  abbreviation?: string | null;
  is_inventory_unit: boolean;
  created_at: string;
  updated_at: string;
}
