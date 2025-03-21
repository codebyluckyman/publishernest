
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PriceBreakItem } from "./PriceBreakItem";
import { Supplier } from "@/types/supplier";

interface PriceBreaksSectionProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
}

export function PriceBreaksSection({ control, quoteRequest, selectedSupplier }: PriceBreaksSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "price_breaks"
  });
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  // Initialize price breaks when supplier changes
  useEffect(() => {
    if (!quoteRequest.formats || quoteRequest.formats.length === 0 || !supplierId) {
      replace([]);
      return;
    }
    
    const newPriceBreaks: any[] = [];
    
    quoteRequest.formats.forEach(format => {
      if (format.price_breaks && format.price_breaks.length > 0) {
        format.price_breaks.forEach(priceBreak => {
          if (format.products && format.products.length > 0) {
            format.products.forEach(product => {
              newPriceBreaks.push({
                quote_request_format_id: format.id,
                price_break_id: priceBreak.id,
                quantity: priceBreak.quantity,
                product_id: product.product_id,
                unit_cost: null
              });
            });
          } else {
            // If no products, add a single price break without product
            newPriceBreaks.push({
              quote_request_format_id: format.id,
              price_break_id: priceBreak.id,
              quantity: priceBreak.quantity,
              unit_cost: null
            });
          }
        });
      }
    });
    
    replace(newPriceBreaks);
  }, [supplierId, quoteRequest.formats, replace]);
  
  if (!quoteRequest.formats || quoteRequest.formats.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Breaks</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={quoteRequest.formats?.map(f => f.id) || []}>
          {quoteRequest.formats.map(format => {
            // Get price breaks for this format
            const formatPriceBreaks = fields.filter(
              field => field.quote_request_format_id === format.id
            );
            
            if (formatPriceBreaks.length === 0) {
              return null;
            }
            
            return (
              <AccordionItem key={format.id} value={format.id}>
                <AccordionTrigger className="font-medium">
                  {format.format_name || "Format"}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {formatPriceBreaks.map((priceBreak, index) => {
                      const fieldIndex = fields.findIndex(f => 
                        f.quote_request_format_id === priceBreak.quote_request_format_id && 
                        f.price_break_id === priceBreak.price_break_id &&
                        f.product_id === priceBreak.product_id
                      );
                      
                      if (fieldIndex === -1) return null;
                      
                      // Find format price break for quantity
                      const formatPriceBreak = format.price_breaks?.find(pb => 
                        pb.id === priceBreak.price_break_id
                      );
                      
                      // Find product if applicable
                      const product = priceBreak.product_id 
                        ? format.products?.find(p => p.product_id === priceBreak.product_id) 
                        : undefined;
                      
                      return (
                        <PriceBreakItem
                          key={`${priceBreak.quote_request_format_id}-${priceBreak.price_break_id}-${priceBreak.product_id || 'no-product'}`}
                          control={control}
                          index={fieldIndex}
                          quantity={formatPriceBreak?.quantity}
                          productName={product?.product_name}
                        />
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
