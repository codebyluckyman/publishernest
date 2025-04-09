
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
      
      // Enhanced filtering logic to show quotes matching product ID, format ID, or both
      return quotes.filter(quote => {
        // Skip quotes without formats
        if (!quote.formats || quote.formats.length === 0) {
          return false;
        }
        
        // If both product and format IDs are provided, look for quotes that match either or both
        if (productId && formatId) {
          // Check for quotes that match the format ID
          const hasMatchingFormat = quote.formats.some(format => format.format_id === formatId);
          
          // Check for quotes that match the product ID in any price break
          const hasMatchingProduct = quote.price_breaks?.some(pb => pb.product_id === productId);
          
          // Return quotes that match either product or format
          return hasMatchingFormat || hasMatchingProduct;
        } 
        // If only product ID is provided
        else if (productId) {
          return quote.price_breaks?.some(pb => pb.product_id === productId) || false;
        } 
        // If only format ID is provided
        else if (formatId) {
          return quote.formats.some(format => format.format_id === formatId);
        }
        
        // No filters applied
        return false;
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
