
import { useQuery } from '@tanstack/react-query';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { useOrganization } from './useOrganization';
import { SupplierQuote } from '@/types/supplierQuote';

interface SupplierQuoteWithDetails extends SupplierQuote {
  supplier: {
    id: string;
    supplier_name: string;
  };
  price_breaks: {
    id: string;
    product_id: string;
    quantity: number;
    unit_cost: number;
  }[];
}

export function useSupplierQuotesByProduct(productId?: string, formatId?: string) {
  const { currentOrganization } = useOrganization();
  
  const query = useQuery({
    queryKey: ['supplier-quotes-by-product', currentOrganization?.id, productId, formatId],
    queryFn: async () => {
      if (!currentOrganization || !productId) return [];
      
      // First, find quotes that have price breaks for this product
      const { data: quoteIds, error: quoteError } = await supabaseCustom
        .from('supplier_quote_price_breaks')
        .select('supplier_quote_id')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .is('rejected_at', null);
      
      if (quoteError) throw quoteError;
      
      if (!quoteIds || quoteIds.length === 0) return [];
      
      // Then, fetch the full quotes with supplier information
      const { data: quotes, error: quotesError } = await supabaseCustom
        .from('supplier_quotes')
        .select(`
          *,
          supplier:supplier_id (id, supplier_name),
          price_breaks:supplier_quote_price_breaks!inner(
            id, product_id, quantity, unit_cost
          )
        `)
        .in('id', quoteIds.map(q => q.supplier_quote_id))
        .eq('status', 'approved')
        .is('rejected_at', null);
      
      if (quotesError) throw quotesError;
      
      // Filter further to ensure we only get quotes with relevant price breaks
      const filteredQuotes = quotes.map(quote => ({
        ...quote,
        price_breaks: quote.price_breaks.filter((pb: any) => pb.product_id === productId)
      }));
      
      return filteredQuotes as SupplierQuoteWithDetails[];
    },
    enabled: !!currentOrganization && !!productId,
  });
  
  return {
    supplierQuotes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
