
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Format {
  id: string;
  format_name: string | null;
  tps_height_mm: number | null;
  tps_width_mm: number | null;
  tps_depth_mm: number | null;
  tps_plc_height_mm: number | null;
  tps_plc_width_mm: number | null;
  tps_plc_depth_mm: number | null;
  extent: string | null;
  binding_type: string | null;
  cover_material: string | null;
  internal_material: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
  orientation: string | null;
}

export function useFormatDetails(formatId: string | null) {
  return useQuery({
    queryKey: ["format-details", formatId],
    queryFn: async () => {
      if (!formatId) return null;

      const { data, error } = await supabase
        .from("formats")
        .select(`
          id,
          format_name,
          tps_height_mm,
          tps_width_mm,
          tps_depth_mm,
          tps_plc_height_mm,
          tps_plc_width_mm,
          tps_plc_depth_mm,
          extent,
          binding_type,
          cover_material,
          internal_material,
          cover_stock_print,
          internal_stock_print,
          orientation
        `)
        .eq("id", formatId)
        .single();

      if (error) throw error;

      return data as Format;
    },
    enabled: !!formatId,
  });
}
