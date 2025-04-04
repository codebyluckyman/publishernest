import { SupplierQuote } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";

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

  return (
    <div className="space-y-3">
      {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
        const formatName = getFormatName(formatId);
        const numProducts = getNumProductsForFormat(formatId);
        
        // Create products array for the table
        const products = Array.from({ length: numProducts }, (_, index) => ({
          index,
          heading: `Product ${index + 1}`
        }));
        
        return (
          <PriceBreakTable
            key={formatId}
            formatName={formatName}
            priceBreaks={priceBreaks}
            products={products}
            isReadOnly={true}
            currency={quote.currency}
            className="mb-2"
          />
        );
      })}
    </div>
  );
}
