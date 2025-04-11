
import { useQuery } from '@tanstack/react-query';
import { fetchSupplierQuotes } from '@/api/supplierQuotes';
import { useOrganization } from './useOrganization';
import { SupplierQuote } from '@/types/supplierQuote';

interface UseSupplierQuotesByProductProps {
  productId?: string;
  formatId?: string;
  enabled?: boolean;
}

export function useSupplierQuotesByProduct({
  productId,
  formatId,
  enabled = true,
}: UseSupplierQuotesByProductProps = {}) {
  const { currentOrganization } = useOrganization();
  
  const queryEnabled = enabled && !!currentOrganization?.id && (!!productId || !!formatId);
  
  return useQuery({
    queryKey: ['supplierQuotes', 'product', productId, formatId, currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const quotes = await fetchSupplierQuotes({
        currentOrganization,
        status: 'approved', // Only fetch approved quotes
        productId,
        formatId
      });
      
      console.log(`Fetched ${quotes.length} approved supplier quotes for product: ${productId}, format: ${formatId}`);
      
      return quotes;
    },
    enabled: queryEnabled,
  });
}

export function findBestQuoteForProduct(quotes: SupplierQuote[], productId: string, formatId?: string) {
  if (!quotes || quotes.length === 0) return null;
  
  let bestQuote = null;
  let lowestPrice = Number.MAX_VALUE;
  
  quotes.forEach(quote => {
    if (!quote.formats || !quote.price_breaks) return;
    
    const matchingPriceBreaks = quote.price_breaks.filter(pb => pb.product_id === productId);
    
    if (formatId) {
      const hasFormat = quote.formats.some(format => format.format_id === formatId);
      if (!hasFormat) return;
    }
    
    matchingPriceBreaks.forEach(priceBreak => {
      if (priceBreak.unit_cost && priceBreak.unit_cost < lowestPrice) {
        lowestPrice = priceBreak.unit_cost;
        bestQuote = quote;
      }
    });
  });
  
  return bestQuote;
}
