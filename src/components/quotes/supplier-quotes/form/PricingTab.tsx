import { useEffect, useState } from "react";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuotePriceBreak } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";

interface PricingTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function PricingTab({ control, quoteRequest }: PricingTabProps) {
  const { setValue, getValues } = useFormContext<SupplierQuoteFormValues>();
  const [initializing, setInitializing] = useState(true);
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "price_breaks"
  });

  useEffect(() => {
    if (!quoteRequest || !quoteRequest.formats || initializing === false) return;
    
    const newPriceBreaks: SupplierQuotePriceBreak[] = [];
    
    quoteRequest.formats.forEach(format => {
      if (!format.price_breaks || format.price_breaks.length === 0) return;
      
      const numProducts = format.num_products || 1;
      
      const sortedPriceBreaks = [...format.price_breaks].sort((a, b) => a.quantity - b.quantity);
      
      sortedPriceBreaks.forEach(priceBreak => {
        newPriceBreaks.push({
          id: "",
          supplier_quote_id: "",
          quote_request_format_id: format.id,
          price_break_id: priceBreak.id || "",
          quantity: priceBreak.quantity,
          unit_cost: null,
          unit_cost_1: null,
          unit_cost_2: null,
          unit_cost_3: null,
          unit_cost_4: null,
          unit_cost_5: null,
          unit_cost_6: null,
          unit_cost_7: null,
          unit_cost_8: null,
          unit_cost_9: null,
          unit_cost_10: null
        });
      });
    });
    
    setValue("price_breaks", newPriceBreaks);
    setInitializing(false);
  }, [quoteRequest, setValue, initializing]);

  const getFormatName = (formatId: string): string => {
    if (!quoteRequest || !quoteRequest.formats) return "Unknown Format";
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format ? format.format_name || "Unnamed Format" : "Unknown Format";
  };

  const priceBreaksByFormat: Record<string, SupplierQuotePriceBreak[]> = {};
  fields.forEach(field => {
    const priceBreak = field as unknown as SupplierQuotePriceBreak;
    if (!priceBreaksByFormat[priceBreak.quote_request_format_id]) {
      priceBreaksByFormat[priceBreak.quote_request_format_id] = [];
    }
    priceBreaksByFormat[priceBreak.quote_request_format_id].push(priceBreak);
  });

  const getProductHeadings = (numProducts: number) => {
    return Array.from({ length: numProducts }, (_, i) => `${i + 1} Title${i + 1 > 1 ? 's' : ''}`);
  };

  const formatIds = quoteRequest.formats?.map(format => format.format_id).filter(Boolean) || [];
  const formatDetailsMap = {};

  return (
    <div className="space-y-3">
      {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
        const formatName = getFormatName(formatId);
        const format = quoteRequest.formats?.find(f => f.id === formatId);
        const numProducts = format?.num_products || 1;
        const productHeadings = getProductHeadings(numProducts);
        
        const products = productHeadings.map((heading, index) => ({
          index,
          heading
        }));
        
        const formatDescription = numProducts > 0 
          ? `Please supply unit cost for each quantity break and ${numProducts} Title${numProducts > 1 ? 's' : ''}`
          : 'No products for this format';
        
        const FormatSpecificationsWrapper = () => {
          const { data: formatDetails, isLoading } = useFormatDetails(format?.format_id || null);
          
          return (
            <FormatSpecifications 
              format={formatDetails || null} 
              isLoading={isLoading}
              hide={false}
            />
          );
        };
        
        return (
          <div key={formatId} className="mb-4">
            <div className="mb-3">
              <FormatSpecificationsWrapper />
            </div>
            
            <PriceBreakTable
              formatName={formatName}
              formatDescription={formatDescription}
              priceBreaks={priceBreaks}
              products={products}
              control={control}
              fieldArrayName="price_breaks"
              className="mb-2"
            />
          </div>
        );
      })}
      
      {Object.keys(priceBreaksByFormat).length === 0 && (
        <div className="text-center p-8 bg-muted rounded-lg">
          <h3 className="text-lg font-medium">No Price Breaks Available</h3>
          <p className="text-muted-foreground mt-2">
            This quote request does not have any price breaks defined.
          </p>
        </div>
      )}
    </div>
  );
}
