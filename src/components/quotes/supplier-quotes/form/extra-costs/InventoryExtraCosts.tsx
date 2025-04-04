
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";
import { useExtraCostsManagement } from "@/hooks/useExtraCostsManagement";

interface InventoryExtraCostsProps {
  inventoryCosts: QuoteRequest['extra_costs'];
  quoteRequest: QuoteRequest;
  control: Control<SupplierQuoteFormValues>;
  findFieldIndex: (extraCostId: string, priceBreakId?: string) => number;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function InventoryExtraCosts({ 
  inventoryCosts, 
  quoteRequest, 
  control, 
  findFieldIndex,
  form
}: InventoryExtraCostsProps) {
  const { 
    getNumProductsForFormat,
    getFormatPriceBreaks
  } = useExtraCostsManagement({
    control,
    quoteRequest,
    form
  });

  // Group formats with their price breaks
  const formatPriceBreaks = getFormatPriceBreaks();

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
                return (
                  <div key={extraCost.id} className="mb-4">
                    <h4 className="text-sm font-medium mb-2">{extraCost.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {extraCost.description || 'No description'}
                    </p>
                    
                    <PriceBreakTable
                      formatName={`${extraCost.name} Pricing`}
                      formatDescription={`Please supply costs for each quantity break`}
                      priceBreaks={priceBreaks.map(priceBreak => {
                        // For each price break, find the corresponding extra cost field
                        const fieldIndex = findFieldIndex(extraCost.id, priceBreak.id);
                        
                        // Get the form values for this extra cost
                        let fieldValues = {};
                        if (fieldIndex !== -1) {
                          fieldValues = form.getValues(`extra_costs.${fieldIndex}`);
                        }
                        
                        // Return a combined object for price break table
                        return {
                          ...priceBreak,
                          ...fieldValues,
                          price_break_id: priceBreak.id,
                          extra_cost_id: extraCost.id,
                        };
                      })}
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
