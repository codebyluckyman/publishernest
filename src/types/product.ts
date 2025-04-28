
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
}

export type SortField = 'title' | 'publication_date' | 'publisher_name' | 'list_price';
export type SortDirection = 'asc' | 'desc';
