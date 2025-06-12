import { useQuery } from "@tanstack/react-query";
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { SupplierQuote } from "@/types/supplierQuote";

interface PriceBreak {
  quantity: number;
  unit_cost_1: number;
}

export function useSupplierQuotesByProduct(
  productId?: string,
  formatId?: string,
  supplierId?: string,
  quantity?: number
) {
  const query = useQuery({
    queryKey: ["supplier-quotes-by-product", productId, formatId, supplierId, quantity],
    queryFn: async () => {
      if (!formatId && !productId) return [];

      let queryBuilder = supabaseCustom
        .from("quote_comparison_view")
        .select("*")
        .in("status", ["approved", "submitted"])
        .order("created_at", { ascending: false });

      const { data, error } = await queryBuilder;

      if (error) throw error;

      let filteredData = data || [];

      if (formatId) {
        filteredData = filteredData.filter((quote) => {
          return quote.quote_request.formats?.some(
            (format: any) => format.format_id === formatId
          );
        });
      }

      // Transform the data to include the appropriate unit_cost_1 based on quantity
      const transformedData = filteredData.map((quote) => {
        const priceBreaks = quote.price_breaks as PriceBreak[] || [];
        let selectedUnitCost = 0;

        if (priceBreaks.length > 0) {
          if (!quantity) {
            // If no quantity provided, use the first price break
            selectedUnitCost = priceBreaks[0].unit_cost_1;
          } else {
            // Find the appropriate price break based on quantity
            const sortedBreaks = [...priceBreaks].sort((a, b) => a.quantity - b.quantity);
            
            // Find the first price break where quantity is greater than or equal to the target
            const matchingBreak = sortedBreaks.find(pb => quantity <= pb.quantity);
            
            // If no matching break found (quantity is higher than all breaks), use the highest quantity break
            // Otherwise use the matching break
            selectedUnitCost = matchingBreak 
              ? matchingBreak.unit_cost_1 
              : sortedBreaks[sortedBreaks.length - 1].unit_cost_1;
          }
        }

        return {
          ...quote,
          unit_cost_1: selectedUnitCost,
          price_breaks: priceBreaks,
        };
      });

      return transformedData as unknown as SupplierQuote[];
    },
    enabled: !!(formatId || productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    quotes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
