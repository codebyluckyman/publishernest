
export interface Product {
  id: string;
  organization_id: string;
  title: string;
  subtitle?: string;
  isbn13?: string;
  isbn10?: string;
  publisher_name?: string;
  publication_date?: string;
  product_form?: string;
  product_form_detail?: string;
  status: string;
  list_price?: number;
  currency_code?: string;
  default_currency?: string;
  height_measurement?: number;
  width_measurement?: number;
  thickness_measurement?: number;
  weight_measurement?: number;
  page_count?: number;
  edition_number?: number;
  carton_quantity?: number;
  carton_length_mm?: number;
  carton_width_mm?: number;
  carton_height_mm?: number;
  carton_weight_kg?: number;
  format_id?: string;
  format_extras?: {
    foil?: boolean;
    spot_uv?: boolean;
    glitter?: boolean;
    embossing?: boolean;
    die_cut?: boolean;
    holographic?: boolean;
  } | null;
  format_extra_comments?: string;
  synopsis?: string;
  series_name?: string;
  age_range?: string;
  license?: string;
  language_code?: string;
  subject_code?: string;
  product_availability_code?: string;
  cover_image_url?: string;
  internal_images?: string[];
  selling_points?: string;
  created_at: string;
  updated_at: string;
  format?: {
    id: string;
    format_name: string;
    binding_type?: string;
    cover_material?: string;
    cover_stock_print?: string;
    internal_material?: string;
    internal_stock_print?: string;
    orientation?: string;
    extent?: string;
    tps_height_mm?: number;
    tps_width_mm?: number;
    tps_depth_mm?: number;
    tps_plc_height_mm?: number;
    tps_plc_width_mm?: number;
    tps_plc_depth_mm?: number;
  };
}

export interface ProductFormValues {
  title: string;
  subtitle?: string;
  isbn13?: string;
  isbn10?: string;
  publisher_name?: string;
  publication_date?: Date;
  product_form?: string;
  product_form_detail?: string;
  status: string;
  list_price?: number;
  currency_code?: string;
  height_measurement?: number;
  width_measurement?: number;
  thickness_measurement?: number;
  weight_measurement?: number;
  page_count?: number;
  edition_number?: number;
  carton_quantity?: number;
  carton_length_mm?: number;
  carton_width_mm?: number;
  carton_height_mm?: number;
  carton_weight_kg?: number;
  format_id?: string;
  format_extras?: {
    foil?: boolean;
    spot_uv?: boolean;
    glitter?: boolean;
    embossing?: boolean;
    die_cut?: boolean;
    holographic?: boolean;
  };
  format_extra_comments?: string;
  synopsis?: string;
  series_name?: string;
  age_range?: string;
  license?: string;
  language_code?: string;
  subject_code?: string;
  product_availability_code?: string;
  cover_image_url?: string;
  internal_images?: string[];
  selling_points?: string;
}

export type SortProductField = 
  | "title" 
  | "publisher_name" 
  | "publication_date" 
  | "list_price" 
  | "status" 
  | "created_at";

export type SortDirection = "asc" | "desc";
