
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Format } from "@/components/format/types/FormatTypes";

export function useFormatDetails(formatId: string | null) {
  return useQuery({
    queryKey: ["format-details", formatId],
    queryFn: async () => {
      if (!formatId) return null;

      const { data, error } = await supabase
        .from("formats")
        .select("*")
        .eq("id", formatId)
        .single();

      if (error) throw error;

      return data as Format;
    },
    enabled: !!formatId,
  });
}
