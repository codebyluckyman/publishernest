
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";

interface InventoryExtraCostsProps {
  inventoryCosts: QuoteRequest['extra_costs'];
  quoteRequest: QuoteRequest;
  control: Control<SupplierQuoteFormValues>;
  findFieldIndex: (extraCostId: string) => number;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function InventoryExtraCosts({ 
  inventoryCosts, 
  quoteRequest, 
  control, 
  findFieldIndex,
  form
}: InventoryExtraCostsProps) {
  // Helper function to get the number of products for a format
  const getNumProductsForFormat = (formatId: string): number => {
    if (!quoteRequest.formats) return 1;
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format?.num_products || 1;
  };

  // Group formats with their price breaks
  const formatPriceBreaks: Record<string, any[]> = {};
  if (quoteRequest.formats) {
    quoteRequest.formats.forEach(format => {
      if (format.price_breaks && format.price_breaks.length > 0) {
        formatPriceBreaks[format.id] = format.price_breaks;
      }
    });
  }

  // Component for format specifications
  const FormatSpecWrapper = ({ formatId }: { formatId: string | null }) => {
    const { data: formatDetails, isLoading } = useFormatDetails(formatId);
    
    return (
      <FormatSpecifications 
        format={formatDetails || null} 
        isLoading={isLoading}
        hide={true}
      />
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Inventory Costs</CardTitle>
        <CardDescription>
          Enter costs per quantity break for inventory items
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {Object.keys(formatPriceBreaks).map(formatId => {
          const format = quoteRequest.formats?.find(f => f.id === formatId);
          const formatName = format?.format_name || "Unknown Format";
          const numProducts = getNumProductsForFormat(formatId);
          const priceBreaks = formatPriceBreaks[formatId];
          
          // Create products array for the price break table
          const products = Array.from({ length: numProducts }, (_, index) => ({
            index,
            heading: `Product ${index + 1}`
          }));
          
          return (
            <div key={formatId} className="mb-6 p-4 border-b">
              <h3 className="text-base font-medium mb-2">{formatName}</h3>
              <div className="mb-4">
                <FormatSpecWrapper formatId={format?.format_id || null} />
              </div>
              
              {inventoryCosts.map(extraCost => {
                const fieldIndex = findFieldIndex(extraCost.id);
                if (fieldIndex === -1) return null;
                
                // Create a custom set of price breaks for this extra cost
                const extraCostPriceBreaks = priceBreaks.map(priceBreak => {
                  const fieldValues = form.getValues(`extra_costs.${fieldIndex}`);
                  return {
                    ...priceBreak,
                    ...fieldValues,
                    extra_cost_id: extraCost.id
                  };
                });
                
                return (
                  <div key={extraCost.id} className="mb-4">
                    <h4 className="text-sm font-medium mb-2">{extraCost.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {extraCost.description || 'No description'}
                    </p>
                    
                    <PriceBreakTable
                      formatName={`${extraCost.name} Pricing`}
                      formatDescription={`Please supply costs for each quantity break`}
                      priceBreaks={extraCostPriceBreaks}
                      products={products}
                      control={control}
                      fieldArrayName="extra_costs"
                      className="mb-4"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
