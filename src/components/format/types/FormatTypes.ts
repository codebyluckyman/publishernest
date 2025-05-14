
export interface Format {
  id: string;
  format_name: string;
  tps_height_mm: number | null;
  tps_width_mm: number | null;
  tps_depth_mm: number | null;
  tps_plc_height_mm: number | null;
  tps_plc_width_mm: number | null;
  tps_plc_depth_mm: number | null;
  extent: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
  binding_type: string | null;
  cover_material: string | null;
  internal_material: string | null;
  orientation: string | null;
  created_at: string;
  updated_at: string;
}
