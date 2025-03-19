
export interface ExtraCost {
  id?: string;
  quote_request_id?: string;
  name: string;
  description?: string;
  unit_of_measure_id?: string;
  unit_of_measure_name?: string;
}

export interface DefaultExtraCost {
  name: string;
  description?: string;
  unit_of_measure_id?: string;
}

export interface ExtraCostTableItem {
  id: string;
  name: string;
  description?: string;
  unit_of_measure_id?: string;
  unit_of_measure_name?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}
