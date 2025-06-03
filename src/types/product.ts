
export interface FormatExtra {
  name: string;
  description?: string;
  unit_of_measure_id?: string;
}

export interface Product {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  product_form: string | null;
  publisher_name: string | null;
  publication_date: string | null;
  list_price: number | null;
  default_price: number | null;
  default_currency: string | null;
  created_at: string;
  updated_at: string;
  cover_image_url: string | null;
  format_id?: string | null;
  format_extras?: {
    foil: boolean;
    spot_uv: boolean;
    glitter: boolean;
    embossing: boolean;
    die_cut: boolean;
    holographic: boolean;
  } | FormatExtra[];
  format_extra_comments?: string | null;
  
  // Physical properties
  height_measurement?: number | null;
  width_measurement?: number | null;
  thickness_measurement?: number | null;
  weight_measurement?: number | null;
  
  // Carton information
  carton_quantity?: number | null;
  carton_length_mm?: number | null;
  carton_width_mm?: number | null;
  carton_height_mm?: number | null;
  carton_weight_kg?: number | null;
  
  // Additional properties
  subtitle?: string | null;
  synopsis?: string | null;
  series_name?: string | null;
  age_range?: string | null;
  license?: string | null;
  language_code?: string | null;
  subject_code?: string | null;
  product_availability_code?: string | null;
  product_form_detail?: string | null;
  status?: string | null;
  page_count?: number | null;
  edition_number?: number | null;
  
  // Format information - referenced from the formats table
  format?: {
    id: string;
    format_name: string | null;
    extent: string | null;
  } | null;
}

export type SortField = 'title' | 'publication_date' | 'publisher_name' | 'list_price' | 'series_name';
export type SortDirection = 'asc' | 'desc';

export interface ProductFilters {
  product_form: string | string[];
  publisher_name: string | string[];
  pub_month: string | string[] | null;
  license: string | string[] | null;
  format_id: string | string[] | null;
  series_name: string | string[] | null;
}
