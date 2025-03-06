
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../types/ProductTypes";

export function useLinkedProducts(formatId: string) {
  const fetchLinkedProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, isbn13, isbn10, cover_image_url")
      .eq("format_id", formatId);

    if (error) {
      console.error("Error fetching linked products:", error);
      throw new Error(error.message);
    }

    return data as Product[];
  };

  return useQuery({
    queryKey: ["linked-products", formatId],
    queryFn: fetchLinkedProducts,
    enabled: !!formatId,
  });
}
