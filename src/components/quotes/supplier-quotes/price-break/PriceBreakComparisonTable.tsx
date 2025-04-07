
import { useMemo } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceBreakComparisonTableProps {
  quotes: SupplierQuote[];
  formatId?: string;
}

export function PriceBreakComparisonTable({ quotes, formatId }: PriceBreakComparisonTableProps) {
  // Get number of products from the quote request format
  const numProducts = useMemo(() => {
    if (!quotes.length) return 1;
    
    const quoteRequestFormat = quotes[0].quote_request?.formats?.find(f => 
      formatId ? f.id === formatId : true
    );
    
    return quoteRequestFormat?.num_products || 1;
  }, [quotes, formatId]);

  // Extract all unique price break quantities across all quotes for this format
  const quantities = useMemo(() => {
    const uniqueQuantities = new Set<number>();
    quotes.forEach(quote => {
      quote.price_breaks?.forEach(pb => {
        // Only include price breaks for the specific format if formatId is provided
        if (!formatId || pb.quote_request_format_id === formatId) {
          uniqueQuantities.add(pb.quantity);
        }
      });
    });
    return Array.from(uniqueQuantities).sort((a, b) => a - b);
  }, [quotes, formatId]);

  // Extract all unique suppliers
  const suppliers = useMemo(() => {
    return quotes.map(quote => ({
      id: quote.supplier_id,
      name: quote.supplier?.supplier_name || "Unknown Supplier",
      quote: quote
    }));
  }, [quotes]);

  // Find the best price for a specific quantity and product index
  const getBestPrice = (quantity: number, productIndex: number) => {
    let bestPrice: { supplierId: string, price: number } | null = null;
    const unitCostKey = `unit_cost_${productIndex + 1}`;
    
    quotes.forEach(quote => {
      const priceBreak = quote.price_breaks?.find(pb => {
        // Match both quantity and format if formatId is provided
        if (formatId) {
          return pb.quantity === quantity && pb.quote_request_format_id === formatId;
        }
        return pb.quantity === quantity;
      });

      // Check if unit cost exists for this product index
      const unitCost = priceBreak ? priceBreak[unitCostKey] : null;

      if (unitCost !== null && unitCost !== undefined) {
        if (!bestPrice || unitCost < bestPrice.price) {
          bestPrice = {
            supplierId: quote.supplier_id,
            price: unitCost
          };
        }
      }
    });
    
    return bestPrice;
  };

  if (quantities.length === 0) {
    return <div className="text-center py-6">No price break information available for comparison.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10 font-bold">Quantity</TableHead>
              {suppliers.map(supplier => (
                <TableHead key={supplier.id} className="min-w-[150px]">
                  {supplier.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {quantities.map(quantity => (
              <TableRow key={quantity}>
                <TableCell className="sticky left-0 bg-white z-10 font-bold">
                  {quantity.toLocaleString()}
                </TableCell>
                
                {suppliers.map(supplier => {
                  const quote = supplier.quote;
                  const priceBreak = quote.price_breaks?.find(pb => {
                    // Match both quantity and format if formatId is provided
                    if (formatId) {
                      return pb.quantity === quantity && pb.quote_request_format_id === formatId;
                    }
                    return pb.quantity === quantity;
                  });
                  
                  return (
                    <TableCell key={supplier.id}>
                      <div className="space-y-2">
                        {[...Array(numProducts)].map((_, productIndex) => {
                          // Get the unit cost for this specific product index
                          const unitCostKey = `unit_cost_${productIndex + 1}`;
                          const unitCost = priceBreak ? priceBreak[unitCostKey] : null;
                          
                          // Determine if this is the best price for this product and quantity
                          const bestPrice = getBestPrice(quantity, productIndex);
                          const isBest = bestPrice?.supplierId === supplier.id && 
                                        unitCost === bestPrice.price && 
                                        unitCost !== null;
                          
                          return (
                            <div key={productIndex} className="flex items-center">
                              <div className={`${isBest ? "font-medium" : ""}`}>
                                <span className="text-sm text-gray-600">Product {productIndex + 1}: </span>
                                {unitCost !== null ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center">
                                          <span>{formatCurrency(unitCost, quote.currency || "USD")}</span>
                                          {isBest && (
                                            <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                              Best
                                            </Badge>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {isBest ? "Best price for this quantity and product" : "Compare with other suppliers"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 flex items-center">
        <Badge className="bg-green-100 text-green-800 mr-2">Best</Badge>
        <span>= Best price available for that quantity and product</span>
      </div>
    </div>
  );
}
