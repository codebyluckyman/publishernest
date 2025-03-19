
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
