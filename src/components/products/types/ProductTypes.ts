
import { Product } from "@/types/product";

export interface Format {
  id: string;
  format_name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  tps_height_mm: number | null;
  tps_width_mm: number | null;
  tps_depth_mm: number | null;
  tps_plc_height_mm: number | null;
  tps_plc_width_mm: number | null;
  tps_plc_depth_mm: number | null;
  binding_type: string | null;
  orientation: string | null;
  cover_material: string | null;
  cover_stock_print: string | null;
  internal_material: string | null;
  internal_stock_print: string | null;
  end_papers_material: string | null;
  end_papers_print: string | null;
  spacers_material: string | null;
  spacers_stock_print: string | null;
  sticker_material: string | null;
  sticker_stock_print: string | null;
  extent: string | null;
}

export interface MinimalFormat {
  id: string;
  format_name: string;
}

export interface ProductWithFormat extends Product {
  format?: Format | null;
}

export interface ProductWithMinimalFormat extends Product {
  format?: MinimalFormat | null;
}

export interface EditableRow {
  id: string;
  isEditing: boolean;
  data: ProductWithFormat;
}

export interface EditableCell {
  productId: string;
  field: string;
  value: any;
}

export interface ProductTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
}
