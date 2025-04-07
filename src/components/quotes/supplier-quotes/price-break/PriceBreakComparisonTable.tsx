
import { useMemo } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceBreakComparisonTableProps {
  quotes: SupplierQuote[];
  formatId?: string;
}

export function PriceBreakComparisonTable({ quotes, formatId }: PriceBreakComparisonTableProps) {
  // Extract all unique price break quantities across all quotes
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

  // Find the best price for each quantity
  const getBestPrice = (quantity: number) => {
    let bestPrice: { supplierId: string, price: number } | null = null;
    
    quotes.forEach(quote => {
      const priceBreak = quote.price_breaks?.find(pb => {
        // Match both quantity and format if formatId is provided
        if (formatId) {
          return pb.quantity === quantity && pb.quote_request_format_id === formatId;
        }
        return pb.quantity === quantity;
      });

      if (priceBreak?.unit_cost) {
        if (!bestPrice || priceBreak.unit_cost < bestPrice.price) {
          bestPrice = {
            supplierId: quote.supplier_id,
            price: priceBreak.unit_cost
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
          {quantities.map(quantity => {
            const bestPrice = getBestPrice(quantity);
            
            return (
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
                  const unitCost = priceBreak?.unit_cost;
                  const isBest = bestPrice?.supplierId === supplier.id && unitCost === bestPrice.price;
                  
                  return (
                    <TableCell key={supplier.id} className={isBest ? "bg-green-50" : ""}>
                      {unitCost ? (
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
                              {isBest ? "Best price for this quantity" : "Compare with other suppliers"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-600 flex items-center">
        <Badge className="bg-green-100 text-green-800 mr-2">Best</Badge>
        <span>= Best price available for that quantity</span>
      </div>
    </div>
  );
}
