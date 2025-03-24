
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PriceBreakItem } from "./PriceBreakItem";
import { Supplier } from "@/types/supplier";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatSpecifications } from "../../form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";

export interface PriceBreaksSectionProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier?: Supplier | null;
}

export function PriceBreaksSection({ control, quoteRequest, selectedSupplier = null }: PriceBreaksSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "price_breaks"
  });
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  // Track open/closed state for each format
  const [openFormats, setOpenFormats] = useState<Record<string, boolean>>({});
  
  // Toggle format sections
  const toggleFormat = (formatId: string) => {
    setOpenFormats(prev => ({
      ...prev,
      [formatId]: !prev[formatId]
    }));
  };
  
  // Initialize all formats as open by default
  useEffect(() => {
    if (quoteRequest.formats && quoteRequest.formats.length > 0) {
      const initialOpenState: Record<string, boolean> = {};
      quoteRequest.formats.forEach(format => {
        initialOpenState[format.id] = true;
      });
      setOpenFormats(initialOpenState);
    }
  }, [quoteRequest.formats]);
  
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
      <CardContent className="space-y-6">
        {quoteRequest.formats.map(format => {
          // Get price breaks for this format
          const formatPriceBreaks = fields.filter(
            field => field.quote_request_format_id === format.id
          );
          
          if (formatPriceBreaks.length === 0) {
            return null;
          }
          
          // Fetch format details for specifications
          const { data: formatDetails, isLoading } = useFormatDetails(format.format_id);
          const isOpen = openFormats[format.id] || false;
          
          return (
            <div key={format.id} className="border rounded-md overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={(open) => setOpenFormats(prev => ({ ...prev, [format.id]: open }))}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center justify-between w-full text-left p-4 font-medium border-b"
                    onClick={() => toggleFormat(format.id)}
                  >
                    <span>{format.format_name || "Format"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatPriceBreaks.length} price break{formatPriceBreaks.length !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 space-y-4">
                    {/* Format Specifications */}
                    <div className="bg-slate-50 rounded-md p-3 mb-4">
                      <FormatSpecifications format={formatDetails} isLoading={isLoading} />
                      
                      {/* Display number of products */}
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Number of Products:</span>
                          <span className="ml-2 text-sm">{format.num_products || 1}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price breaks for this format */}
                    {formatPriceBreaks.map((priceBreak) => {
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
                          numProducts={format.num_products || 1}
                        />
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
