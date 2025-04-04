
import { SupplierQuote } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";

interface PriceBreaksViewProps {
  quote: SupplierQuote;
}

export function PriceBreaksView({ quote }: PriceBreaksViewProps) {
  // If no price breaks, show empty state
  if (!quote.price_breaks || quote.price_breaks.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Price Breaks Available</h3>
        <p className="text-muted-foreground mt-2">
          This quote does not have any price breaks defined.
        </p>
      </div>
    );
  }

  // Group price breaks by format
  const priceBreaksByFormat: Record<string, any[]> = {};
  quote.price_breaks.forEach(priceBreak => {
    if (!priceBreaksByFormat[priceBreak.quote_request_format_id]) {
      priceBreaksByFormat[priceBreak.quote_request_format_id] = [];
    }
    priceBreaksByFormat[priceBreak.quote_request_format_id].push(priceBreak);
  });

  const getFormatName = (formatId: string): string => {
    if (!quote.quote_request || !quote.quote_request.formats) return "Unknown Format";
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format ? format.format_name || "Unnamed Format" : "Unknown Format";
  };

  const getNumProductsForFormat = (formatId: string): number => {
    if (!quote.quote_request || !quote.quote_request.formats) return 1;
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format ? format.num_products || 1 : 1;
  };

  const getFormatId = (formatId: string): string | null => {
    if (!quote.quote_request || !quote.quote_request.formats) return null;
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format ? format.format_id : null;
  };

  return (
    <div className="space-y-6">
      {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
        const formatName = getFormatName(formatId);
        const numProducts = getNumProductsForFormat(formatId);
        const actualFormatId = getFormatId(formatId);
        
        // Create a component to handle format details fetching to avoid React hooks error
        const FormatSpecificationsWrapper = () => {
          const { data: formatDetails, isLoading } = useFormatDetails(actualFormatId);
          
          return (
            <div className="mb-4">
              <FormatSpecifications 
                format={formatDetails} 
                isLoading={isLoading}
                hide={false} // Always show format specs in pricing tab
              />
            </div>
          );
        };
        
        // Create products array for the table
        const products = Array.from({ length: numProducts }, (_, index) => ({
          index,
          heading: `Product ${index + 1}`
        }));
        
        return (
          <div key={formatId} className="mb-6">
            <h3 className="text-md font-medium mb-3">{formatName}</h3>
            
            {/* Format specifications placed under the format heading */}
            <FormatSpecificationsWrapper />
            
            <PriceBreakTable
              formatName={formatName}
              priceBreaks={priceBreaks}
              products={products}
              isReadOnly={true}
              currency={quote.currency}
              className="mt-2"
            />
          </div>
        );
      })}
    </div>
  );
}
