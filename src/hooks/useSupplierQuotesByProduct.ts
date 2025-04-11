
import { useQuery } from '@tanstack/react-query';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SupplierQuote } from '@/types/supplierQuote';

export function useSupplierQuotesByProduct(productId?: string, formatId?: string, supplierId?: string) {
  const query = useQuery({
    queryKey: ['supplier-quotes-by-product', productId, formatId, supplierId],
    queryFn: async () => {
      if (!productId) return [];
      
      // Start query builder
      let queryBuilder = supabaseCustom
        .from('supplier_quotes')
        .select(`
          *,
          supplier:supplier_id(id, supplier_name),
          formats:supplier_quote_formats!inner(*),
          price_breaks:supplier_quote_price_breaks!inner(
            id, 
            unit_cost, 
            quantity, 
            product_id,
            format_id
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      // Filter by product in the price breaks
      queryBuilder = queryBuilder.eq('price_breaks.product_id', productId);
        
      // Add format filter if provided - using the direct format_id reference
      if (formatId) {
        queryBuilder = queryBuilder.eq('price_breaks.format_id', formatId);
      }
      
      // Add supplier filter if provided
      if (supplierId) {
        queryBuilder = queryBuilder.eq('supplier_id', supplierId);
      }
      
      const { data, error } = await queryBuilder;
        
      if (error) throw error;
      
      return data as unknown as SupplierQuote[];
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return {
    quotes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
