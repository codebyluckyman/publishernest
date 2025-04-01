
import { useEffect, useState } from "react";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuotePriceBreak } from "@/types/supplierQuote";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface PricingTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function PricingTab({ control, quoteRequest }: PricingTabProps) {
  const { setValue, getValues } = useFormContext<SupplierQuoteFormValues>();
  const [initializing, setInitializing] = useState(true);
  const [formatProducts, setFormatProducts] = useState<Record<string, any[]>>({});
  
  // Use field array to manage price breaks
  const { fields, append, remove } = useFieldArray({
    control,
    name: "price_breaks"
  });

  // Initialize price breaks based on quote request formats and price breaks
  useEffect(() => {
    if (!quoteRequest || !quoteRequest.formats || initializing === false) return;
    
    const newFormatProducts: Record<string, any[]> = {};
    const newPriceBreaks: SupplierQuotePriceBreak[] = [];
    
    // Process each format in the quote request
    quoteRequest.formats.forEach(format => {
      if (!format.price_breaks || format.price_breaks.length === 0) return;
      
      // Get products for this format
      const products = format.products || [];
      newFormatProducts[format.id] = products;
      
      // For each price break, create a supplier quote price break entry
      format.price_breaks.forEach(priceBreak => {
        newPriceBreaks.push({
          id: "", // Will be generated on save
          supplier_quote_id: "", // Will be assigned on save
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
    
    // Set state
    setFormatProducts(newFormatProducts);
    setValue("price_breaks", newPriceBreaks);
    setInitializing(false);
  }, [quoteRequest, setValue, initializing]);

  const getProductTitle = (productId: string): string => {
    if (!quoteRequest || !quoteRequest.formats) return "Unknown Product";
    
    // Look through all format products to find the matching product
    for (const format of quoteRequest.formats) {
      if (!format.products) continue;
      
      const product = format.products.find(p => p.product_id === productId);
      if (product) {
        return product.product_name || "Unnamed Product";
      }
    }
    
    return "Unknown Product";
  };

  const getFormatName = (formatId: string): string => {
    if (!quoteRequest || !quoteRequest.formats) return "Unknown Format";
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format ? format.format_name || "Unnamed Format" : "Unknown Format";
  };

  // Group price breaks by format
  const priceBreaksByFormat: Record<string, SupplierQuotePriceBreak[]> = {};
  fields.forEach(field => {
    const priceBreak = field as unknown as SupplierQuotePriceBreak;
    if (!priceBreaksByFormat[priceBreak.quote_request_format_id]) {
      priceBreaksByFormat[priceBreak.quote_request_format_id] = [];
    }
    priceBreaksByFormat[priceBreak.quote_request_format_id].push(priceBreak);
  });

  return (
    <div className="space-y-6">
      {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
        const formatName = getFormatName(formatId);
        const products = formatProducts[formatId] || [];
        const numProducts = products.length;
        
        return (
          <Card key={formatId} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">{formatName}</CardTitle>
              <CardDescription>
                {products.length > 0 
                  ? `${products.length} Product${products.length > 1 ? 's' : ''}`
                  : 'No products for this format'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      {products.map((product, index) => (
                        <TableHead key={product.product_id || index}>
                          {getProductTitle(product.product_id)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceBreaks.map((priceBreak, priceBreakIndex) => {
                      const fieldName = `price_breaks.${fields.findIndex(f => 
                        (f as unknown as SupplierQuotePriceBreak).price_break_id === priceBreak.price_break_id &&
                        (f as unknown as SupplierQuotePriceBreak).quote_request_format_id === formatId
                      )}`;
                      
                      return (
                        <TableRow key={priceBreak.price_break_id || priceBreakIndex}>
                          <TableCell className="font-medium">
                            {priceBreak.quantity.toLocaleString()}
                          </TableCell>
                          
                          {products.map((product, productIndex) => {
                            // Use the correct unit cost field based on product index
                            const costFieldName = `${fieldName}.unit_cost_${productIndex + 1}`;
                            
                            return (
                              <TableCell key={product.product_id || productIndex}>
                                <FormField
                                  control={control}
                                  name={costFieldName as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          className="w-full"
                                          value={field.value || ''}
                                          onChange={(e) => {
                                            const value = e.target.value === '' ? null : parseFloat(e.target.value);
                                            field.onChange(value);
                                          }}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
