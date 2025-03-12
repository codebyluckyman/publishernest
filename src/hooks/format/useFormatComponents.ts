
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Format Component interface
export interface FormatComponent {
  id: string;
  format_id: string;
  component_name: string;
  component_type: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const useFormatComponents = (formatId?: string | null) => {
  return useQuery({
    queryKey: ["format-components", formatId],
    queryFn: async () => {
      if (!formatId) return [];
      
      try {
        const { data, error } = await supabase
          .from("format_components")
          .select("*")
          .eq("format_id", formatId);

        if (error) {
          console.error("Error fetching format components:", error);
          return [];
        }

        return data as FormatComponent[];
      } catch (error) {
        console.error("Error fetching format components:", error);
        return [];
      }
    },
    enabled: !!formatId,
  });
};
