
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";
import { useSavingsManagement } from "@/hooks/useSavingsManagement";

interface InventorySavingsProps {
  inventorySavings: QuoteRequest['savings'];
  quoteRequest: QuoteRequest;
  control: Control<SupplierQuoteFormValues>;
  findFieldIndex: (savingId: string) => number;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function InventorySavings({ 
  inventorySavings, 
  quoteRequest, 
  control, 
  findFieldIndex,
  form
}: InventorySavingsProps) {
  const { 
    getNumProductsForFormat,
    getFormatPriceBreaks
  } = useSavingsManagement({
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
        <CardTitle className="text-base">Inventory Savings</CardTitle>
        <CardDescription>
          Enter savings per quantity break for inventory items
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
              
              {inventorySavings.map(saving => {
                const fieldIndex = findFieldIndex(saving.id);
                if (fieldIndex === -1) return null;
                
                // Create a custom set of price breaks for this saving
                const savingPriceBreaks = priceBreaks.map((priceBreak, index) => {
                  // Use the actual field values from the form, linking each to a specific price break
                  const fieldValues = form.getValues(`savings.${fieldIndex}`);
                  
                  return {
                    ...priceBreak,
                    ...fieldValues,
                    price_break_id: priceBreak.id, // Make sure we set the price_break_id for each row
                    saving_id: saving.id
                  };
                });
                
                return (
                  <div key={saving.id} className="mb-4">
                    <h4 className="text-sm font-medium mb-2">{saving.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {saving.description || 'No description'}
                    </p>
                    
                    <PriceBreakTable
                      formatName={`${saving.name} Saving`}
                      formatDescription={`Please supply savings for each quantity break`}
                      priceBreaks={savingPriceBreaks}
                      products={products}
                      control={control}
                      fieldArrayName="savings"
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
