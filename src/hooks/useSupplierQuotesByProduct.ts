
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
        organizationId: currentOrganization.id,
        status: 'approved', // Only fetch approved quotes
      });
      
      // Filter quotes that include the specified product and format
      return quotes.filter(quote => {
        // Check if any line item matches the product and format criteria
        return quote.formats?.some(format => {
          // If we're filtering by productId, check if any product matches
          if (productId && format.products) {
            const hasMatchingProduct = format.products.some(product => 
              product.product_id === productId
            );
            
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
  if (!quotes.length) return null;
  
  let bestQuote = null;
  let lowestPrice = Number.MAX_VALUE;
  
  quotes.forEach(quote => {
    quote.formats?.forEach(format => {
      // Check if this format matches our criteria
      if (formatId && format.format_id !== formatId) return;
      
      format.products?.forEach(product => {
        if (product.product_id === productId && product.price_breaks?.length) {
          // Get the lowest unit price from price breaks
          // Assuming price_breaks are ordered by quantity ascending
          const unitPrice = product.price_breaks[0].unit_price;
          if (unitPrice < lowestPrice) {
            lowestPrice = unitPrice;
            bestQuote = quote;
          }
        }
      });
    });
  });
  
  return bestQuote;
}
