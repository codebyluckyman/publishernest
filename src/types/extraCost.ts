
export interface ExtraCost {
  id?: string;
  quote_request_id?: string;
  name: string;
  description?: string;
  estimated_cost?: number;
}

export interface DefaultExtraCost {
  name: string;
  description?: string;
  estimated_cost?: number;
}
