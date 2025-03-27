
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";

export function PriceBreaksSection({
  control,
  quoteRequest,
  selectedSupplier
}: {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
}) {
  if (!quoteRequest.formats || quoteRequest.formats.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No formats available for pricing</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Price Breaks</h3>
      
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

                  {format.price_breaks.map((priceBreak, priceBreakIndex) => {
                    const priceBreakFormIndex = format.price_breaks ? 
                      formatIndex * format.price_breaks.length + priceBreakIndex : 0;
                    
                    return (
                      <div key={priceBreak.id || `price-break-${priceBreakIndex}`} className="py-1 border-b last:border-0">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                          <div className="md:col-span-1">
                            <div className="text-sm font-medium">{priceBreak.quantity.toLocaleString()}</div>
                          </div>
                          
                          <div className="md:col-span-11">
                            {format.num_products && format.num_products > 1 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
                                {Array.from({ length: Math.min(format.num_products, 10) }, (_, i) => i + 1).map((i) => (
                                  <div key={i} className="space-y-0.5">
                                    <input
                                      type="number"
                                      step="0.001"
                                      min="0"
                                      placeholder="0.000"
                                      className="h-7 text-xs px-1.5 w-full rounded-md border border-input bg-background"
                                      {...control.register(`price_breaks.${priceBreakFormIndex}.unit_cost_${i}` as any, {
                                        setValueAs: (v) => v === "" ? null : parseFloat(v)
                                      })}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="0.000"
                                className="h-8 text-sm w-full rounded-md border border-input bg-background"
                                {...control.register(`price_breaks.${priceBreakFormIndex}.unit_cost`, {
                                  setValueAs: (v) => v === "" ? null : parseFloat(v)
                                })}
                              />
                            )}
                          </div>
                        </div>
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
