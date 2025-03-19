
export interface ExtraCost {
  id?: string;
  quote_request_id?: string;
  name: string;
  description?: string;
  unit_of_measure?: string;
}

export interface DefaultExtraCost {
  name: string;
  description?: string;
  unit_of_measure?: string;
}

export interface ExtraCostTableItem {
  id: string;
  name: string;
  description?: string;
  unit_of_measure?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}
