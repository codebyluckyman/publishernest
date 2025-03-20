
export interface Saving {
  id?: string;
  quote_request_id?: string;
  name: string;
  description?: string;
  unit_of_measure_id?: string;
  unit_of_measure_name?: string;
}

export interface DefaultSaving {
  name: string;
  description?: string;
  unit_of_measure_id?: string;
}

export interface SavingTableItem {
  id: string;
  name: string;
  description?: string;
  unit_of_measure_id?: string | null;
  unit_of_measure_name?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}
