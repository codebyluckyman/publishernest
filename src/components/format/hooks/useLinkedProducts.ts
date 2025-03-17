
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/components/format/types/ProductTypes";

export function useLinkedProducts(formatId: string) {
  return useQuery({
    queryKey: ["linked-products", formatId],
    queryFn: async () => {
      if (!formatId) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          isbn13,
          isbn10,
          cover_image_url,
          format_extras,
          format_extra_comments
        `)
        .eq("format_id", formatId);

      if (error) throw error;

      return data as Product[];
    },
    enabled: !!formatId,
  });
}
