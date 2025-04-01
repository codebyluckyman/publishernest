
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign } from "lucide-react";

interface PriceBreaksViewProps {
  quote: SupplierQuote;
}

export function PriceBreaksView({ quote }: PriceBreaksViewProps) {
  // Group price breaks by format
  const priceBreaksByFormat = quote.price_breaks?.reduce((acc, priceBreak) => {
    const formatId = priceBreak.format?.format_id || '';
    if (!acc[formatId]) {
      acc[formatId] = [];
    }
    acc[formatId].push(priceBreak);
    return acc;
  }, {} as Record<string, typeof quote.price_breaks>);
  
  // If no price breaks available
  if (!priceBreaksByFormat || Object.keys(priceBreaksByFormat).length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Price Breaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">No price breaks available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Price Breaks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
            // Get format name from the first price break (they all share the same format)
            const format = quote.formats?.find(f => f.format_id === formatId);
            const formatName = format?.format_name || 'Unknown Format';
            
            // Sort price breaks by quantity
            const sortedPriceBreaks = [...(priceBreaks || [])].sort((a, b) => a.quantity - b.quantity);
            
            // Check if we have multiple products by looking for unit_cost_2, unit_cost_3, etc.
            const hasMultipleProducts = sortedPriceBreaks.some(pb => 
              pb.unit_cost_2 !== null && pb.unit_cost_2 !== undefined
            );
            
            // Count how many product columns we need to display (max 10)
            let productCount = 1;
            if (hasMultipleProducts) {
              for (let i = 2; i <= 10; i++) {
                const unitCostKey = `unit_cost_${i}` as keyof typeof sortedPriceBreaks[0];
                if (sortedPriceBreaks.some(pb => pb[unitCostKey] !== null && pb[unitCostKey] !== undefined)) {
                  productCount = i;
                }
              }
            }
            
            return (
              <div key={formatId} className="space-y-2">
                <h3 className="text-md font-medium">{formatName}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity</TableHead>
                      {hasMultipleProducts ? (
                        // If multiple products, create a header for each product
                        Array.from({ length: productCount }, (_, i) => i + 1).map(num => (
                          <TableHead key={num} className="text-right">
                            Product {num}
                          </TableHead>
                        ))
                      ) : (
                        // If single product, just show unit cost and total
                        <>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPriceBreaks?.map((priceBreak) => {
                      return (
                        <TableRow key={priceBreak.id}>
                          <TableCell>{priceBreak.quantity.toLocaleString()}</TableCell>
                          
                          {hasMultipleProducts ? (
                            // If multiple products, show a column for each product's unit cost
                            Array.from({ length: productCount }, (_, i) => i + 1).map(num => {
                              const unitCostKey = `unit_cost_${num}` as keyof typeof priceBreak;
                              const unitCost = priceBreak[unitCostKey] as number | null | undefined;
                              
                              return (
                                <TableCell key={num} className="text-right">
                                  {unitCost !== null && unitCost !== undefined 
                                    ? `${quote.currency} ${unitCost.toFixed(4)}` 
                                    : 'N/A'}
                                </TableCell>
                              );
                            })
                          ) : (
                            // If single product, show unit cost and total
                            <>
                              <TableCell className="text-right">
                                {priceBreak.unit_cost_1
                                  ? `${quote.currency} ${priceBreak.unit_cost_1.toFixed(4)}`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                {priceBreak.unit_cost_1
                                  ? `${quote.currency} ${(priceBreak.unit_cost_1 * priceBreak.quantity).toFixed(2)}`
                                  : 'N/A'}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
