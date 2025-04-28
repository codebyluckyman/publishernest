
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
  
  // Additional properties
  synopsis?: string | null;
}

export type SortField = 'title' | 'publication_date' | 'publisher_name' | 'list_price';
export type SortDirection = 'asc' | 'desc';
