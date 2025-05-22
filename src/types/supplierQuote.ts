export type SupplierQuoteStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected";

export interface SupplierQuotePriceBreak {
  id: string;
  supplier_quote_id: string;
  quote_request_format_id: string;
  price_break_id: string;
  product_id?: string | null;
  format_id?: string | null;
  quantity: number;
  unit_cost?: number | null;
  unit_cost_1?: number | null;
  unit_cost_2?: number | null;
  unit_cost_3?: number | null;
  unit_cost_4?: number | null;
  unit_cost_5?: number | null;
  unit_cost_6?: number | null;
  unit_cost_7?: number | null;
  unit_cost_8?: number | null;
  unit_cost_9?: number | null;
  unit_cost_10?: number | null;
  num_products?: number | null;
}

export interface SupplierQuoteExtraCost {
  id?: string;
  supplier_quote_id?: string;
  extra_cost_id: string;
  unit_cost?: number | null;
  unit_cost_1?: number[] | null;
  unit_cost_2?: number[] | null;
  unit_cost_3?: number[] | null;
  unit_cost_4?: number[] | null;
  unit_cost_5?: number[] | null;
  unit_cost_6?: number[] | null;
  unit_cost_7?: number[] | null;
  unit_cost_8?: number[] | null;
  unit_cost_9?: number[] | null;
  unit_cost_10?: number[] | null;
  unit_of_measure_id?: string | null;
}

// export interface SupplierQuoteExtraCost {
//   id?: string;
//   quote_request_id?: string;
//   name: string;
//   description: string | null;
//   unit_of_measure_id: string;
//   unit_of_measures?: {
//     id: string;
//     name: string;
//     abbreviation: string;
//   };
//   price_breaks: {
//     id: string;
//     quantity: number;
//     unit_cost: number | null;
//     unit_cost_1: number | null;
//     unit_cost_2: number | null;
//     unit_cost_3: number | null;
//     unit_cost_4: number | null;
//     unit_cost_5: number | null;
//     unit_cost_6: number | null;
//     unit_cost_7: number | null;
//     unit_cost_8: number | null;
//     unit_cost_9: number | null;
//     unit_cost_10: number | null;
//     unit_of_measure_id: string;
//   }[];
// }
export interface SupplierQuoteSaving {
  id?: string;
  supplier_quote_id?: string;
  saving_id: string;
  price_break_id?: string | null; // Reference to specific price break for inventory items
  unit_cost?: number | null;
  unit_cost_1?: number | null;
  unit_cost_2?: number | null;
  unit_cost_3?: number | null;
  unit_cost_4?: number | null;
  unit_cost_5?: number | null;
  unit_cost_6?: number | null;
  unit_cost_7?: number | null;
  unit_cost_8?: number | null;
  unit_cost_9?: number | null;
  unit_cost_10?: number | null;
  unit_of_measure_id?: string | null;

  // Additional properties for mapping in the UI
  saving_name?: string;
  saving_description?: string | null;
  unit_of_measure_name?: string | null;
  is_inventory_unit?: boolean;

  // Generic key-value for any additional properties
  [key: string]: any;
}

export interface SupplierQuote {
  id: string;
  organization_id: string;
  quote_request_id: string;
  supplier_id: string;
  status: SupplierQuoteStatus;
  total_cost: number | null;
  currency: string;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  reference_id: string | null;
  reference: string | null;

  supplier_name: string | null;
  title: string | null;

  valid_from: string | null;
  valid_to: string | null;
  terms: string | null;
  remarks: string | null;
  production_schedule?: Record<string, string | null> | null;

  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;

  packaging_carton_quantity?: number | null;
  packaging_carton_weight?: number | null;
  packaging_carton_length?: number | null;
  packaging_carton_width?: number | null;
  packaging_carton_height?: number | null;
  packaging_carton_volume?: number | null;
  packaging_cartons_per_pallet?: number | null;
  packaging_copies_per_20ft_palletized?: number | null;
  packaging_copies_per_40ft_palletized?: number | null;
  packaging_copies_per_20ft_unpalletized?: number | null;
  packaging_copies_per_40ft_unpalletized?: number | null;

  quote_request?: any;
  supplier?: { supplier_name: string };
  attachments?: SupplierQuoteAttachment[];
  formats?: SupplierQuoteFormat[];
  price_breaks?: SupplierQuotePriceBreak[];
  extra_costs?: SupplierQuoteExtraCost[];
  savings?: SupplierQuoteSaving[];
}

export interface SupplierQuoteFormat {
  id: string;
  supplier_quote_id?: string;
  format_id: string;
  quote_request_format_id?: string;
  format_name: string;
  dimensions?: string | null;
  extent?: string | null;
}

export interface SupplierQuoteAttachment {
  id: string;
  supplier_quote_id: string;
  file_name: string;
  file_key: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface SupplierQuoteFormValues {
  quote_request_id?: string;
  id?: string;
  supplier_id: string;
  notes?: string;
  currency: string;
  reference?: string;

  valid_from?: string;
  valid_to?: string;
  terms?: string;
  remarks?: string;
  production_schedule?: Record<string, string | null>;

  price_breaks?: SupplierQuotePriceBreak[];

  packaging_carton_quantity?: number | null;
  packaging_carton_weight?: number | null;
  packaging_carton_length?: number | null;
  packaging_carton_width?: number | null;
  packaging_carton_height?: number | null;
  packaging_carton_volume?: number | null;
  packaging_cartons_per_pallet?: number | null;
  packaging_copies_per_20ft_palletized?: number | null;
  packaging_copies_per_40ft_palletized?: number | null;
  packaging_copies_per_20ft_unpalletized?: number | null;
  packaging_copies_per_40ft_unpalletized?: number | null;

  extra_costs?: SupplierQuoteExtraCost[];
  savings?: SupplierQuoteSaving[];
  special?: number;

  status: SupplierQuoteStatus;
}
