
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
        currentOrganization: currentOrganization,
        status: 'approved', // Only fetch approved quotes
      });
      
      // Filter quotes that include the specified product and format
      return quotes.filter(quote => {
        // Check if any format matches the product and format criteria
        if (!quote.formats || quote.formats.length === 0) {
          return false;
        }
        
        return quote.formats.some(format => {
          // If we're filtering by productId, check if format has any associated products with the matching ID
          // Note: Since format.products might not exist directly, we need to check differently
          if (productId) {
            // Use a more generic approach to find matching products
            // Look through price breaks to find matching product IDs
            const hasMatchingProduct = quote.price_breaks?.some(pb => 
              pb.product_id === productId
            ) || false;
            
            // If we're also filtering by formatId, both must match
            if (formatId) {
              return hasMatchingProduct && format.format_id === formatId;
            }
            
            // If only filtering by productId
            return hasMatchingProduct;
          } 
          
          // If we're only filtering by formatId
          if (formatId) {
            return format.format_id === formatId;
          }
          
          // No filters applied
          return false;
        });
      });
    },
    enabled: queryEnabled,
  });
}

// Helper function to find the best quote by lowest price per unit
export function findBestQuoteForProduct(quotes: SupplierQuote[], productId: string, formatId?: string) {
  if (!quotes || quotes.length === 0) return null;
  
  let bestQuote = null;
  let lowestPrice = Number.MAX_VALUE;
  
  quotes.forEach(quote => {
    if (!quote.formats || !quote.price_breaks) return;
    
    // Find price breaks for this product
    const matchingPriceBreaks = quote.price_breaks.filter(pb => pb.product_id === productId);
    
    // If looking for a specific format, check if this quote has that format
    if (formatId) {
      const hasFormat = quote.formats.some(format => format.format_id === formatId);
      if (!hasFormat) return;
    }
    
    // Find the lowest unit price from matching price breaks
    matchingPriceBreaks.forEach(priceBreak => {
      if (priceBreak.unit_cost && priceBreak.unit_cost < lowestPrice) {
        lowestPrice = priceBreak.unit_cost;
        bestQuote = quote;
      }
    });
  });
  
  return bestQuote;
}
