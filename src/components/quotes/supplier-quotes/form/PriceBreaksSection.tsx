
import { Control, useFormContext } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";
import { PriceBreakItem } from "./PriceBreakItem";
import { toast } from "sonner";

export function PriceBreaksSection({
  control,
  quoteRequest,
  selectedSupplier,
  currency
}: {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  currency: string;
}) {
  const { getValues, setValue } = useFormContext<SupplierQuoteFormValues>();

  if (!quoteRequest.formats || quoteRequest.formats.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No formats available for pricing</p>
      </div>
    );
  }

  const currencySymbol = getSymbolForCurrency(currency);

  // Function to copy unit costs down to all price breaks below the current one
  const handleCopyDown = (index: number, fieldType: string = 'price_break') => {
    const priceBreaks = getValues("price_breaks");
    if (!priceBreaks || index >= priceBreaks.length) return;
    
    const currentPriceBreak = priceBreaks[index];
    const targetFormatId = currentPriceBreak.quote_request_format_id;
    
    if (fieldType === 'price_break') {
      // Copy all unit costs from this price break to others in the same format
      for (let i = index + 1; i < priceBreaks.length; i++) {
        if (priceBreaks[i].quote_request_format_id === targetFormatId) {
          // Copy all unit cost fields
          for (let j = 1; j <= 10; j++) {
            const costField = `unit_cost_${j}` as keyof typeof currentPriceBreak;
            if (currentPriceBreak[costField] !== undefined) {
              setValue(`price_breaks.${i}.${costField}`, currentPriceBreak[costField]);
            }
          }
        }
      }
    } else if (fieldType.startsWith('product_')) {
      // Extract the product number
      const productNumber = parseInt(fieldType.split('_')[1], 10);
      if (isNaN(productNumber)) return;
      
      const costFieldName = `unit_cost_${productNumber}` as keyof typeof currentPriceBreak;
      const valueToCopy = currentPriceBreak[costFieldName];
      
      // Copy just this one product's unit cost
      for (let i = index + 1; i < priceBreaks.length; i++) {
        if (priceBreaks[i].quote_request_format_id === targetFormatId) {
          setValue(`price_breaks.${i}.${costFieldName}`, valueToCopy);
        }
      }
    }
    
    toast.success("Prices copied to rows below");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Price Breaks</h3>
        <div className="text-md font-medium">
          Unit Costs <span className="text-muted-foreground">({currencySymbol})</span>
        </div>
      </div>
      
      {quoteRequest.formats.map((format, formatIndex) => {
        const { data: formatDetails, isLoading } = useFormatDetails(format.format_id);
        
        return (
          <Card key={format.id} className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">{format.format_name}</CardTitle>
              <div className="mt-2">
                <FormatSpecifications format={formatDetails} isLoading={isLoading} />
              </div>
            </CardHeader>
            <CardContent>
              {format.price_breaks && format.price_breaks.length > 0 ? (
                <div className="space-y-0">
                  {format.num_products > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-1 flex items-center">
                        <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                      </div>
                      <div className="md:col-span-11">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
                          {Array.from({ length: Math.min(format.num_products || 1, 10) }, (_, i) => i + 1).map((i) => (
                            <div key={i} className="text-center">
                              <span className="text-xs font-medium text-muted-foreground">{i}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sort price breaks by quantity in ascending order */}
                  {[...format.price_breaks]
                    .sort((a, b) => a.quantity - b.quantity)
                    .map((priceBreak, priceBreakIndex) => {
                      // Calculate the absolute index of this price break across all formats
                      let absoluteIndex = 0;
                      for (let i = 0; i < formatIndex; i++) {
                        absoluteIndex += quoteRequest.formats[i].price_breaks?.length || 0;
                      }
                      absoluteIndex += priceBreakIndex;
                      
                      return (
                        <div key={priceBreak.id || `price-break-${priceBreakIndex}`} className="py-1 border-b last:border-0">
                          <PriceBreakItem
                            control={control}
                            index={absoluteIndex}
                            quantity={priceBreak.quantity}
                            numProducts={format.num_products || 1}
                            showLabels={false}
                            onCopyDown={handleCopyDown}
                          />
                        </div>
                      );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No price breaks available for this format</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
