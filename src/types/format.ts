
// If this file doesn't exist, we'll create it with the necessary types
export interface FormatLight {
  id: string;
  format_name: string;
  binding_type: string;
  cover_material: string;
  cover_stock_print: string;
  internal_material: string;
  internal_stock_print: string;
  orientation: string;
  extent: string;
  tps_height_mm: number;
  tps_width_mm: number;
  tps_depth_mm: number;
  plc_height_mm: number;
  plc_width_mm: number;
  plc_depth_mm: number;
  end_papers_material: string;
  end_papers_print: string;
  spacers_material: string;
  spacers_stock_print: string;
  // Add these fields that were missing
  tps_plc_height_mm: number;
  tps_plc_width_mm: number;
  tps_plc_depth_mm: number;
}

export interface Format extends FormatLight {
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  components: any[];
  description?: string;
  cover_finish?: string;
  cover_coating?: string;
  internal_coating?: string;
  internal_finish?: string;
  jacket_material?: string;
  jacket_stock_print?: string;
  jacket_finish?: string;
  jacket_coating?: string;
  jacket_dimensions?: {
    height_mm?: number;
    width_mm?: number;
  };
  spine_width_mm?: number;
  weight_g?: number;
  is_archival?: boolean;
  is_active: boolean;
  // Add any other Format fields that may be needed
}
