
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupplierQuote } from "@/types/supplierQuote";
import { formatCurrency } from "@/utils/formatters";

interface PriceBreaksViewProps {
  quote: SupplierQuote;
}

export function PriceBreaksView({ quote }: PriceBreaksViewProps) {
  // If no price breaks, show empty state
  if (!quote.price_breaks || quote.price_breaks.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Price Breaks Available</h3>
        <p className="text-muted-foreground mt-2">
          This quote does not have any price breaks defined.
        </p>
      </div>
    );
  }

  // Group price breaks by format and sort within each group
  const priceBreaksByFormat: Record<string, any[]> = {};
  quote.price_breaks.forEach(priceBreak => {
    if (!priceBreaksByFormat[priceBreak.quote_request_format_id]) {
      priceBreaksByFormat[priceBreak.quote_request_format_id] = [];
    }
    priceBreaksByFormat[priceBreak.quote_request_format_id].push(priceBreak);
  });

  // Sort price breaks within each format by quantity
  Object.keys(priceBreaksByFormat).forEach(formatId => {
    priceBreaksByFormat[formatId].sort((a, b) => a.quantity - b.quantity);
  });

  const getFormatName = (formatId: string): string => {
    if (!quote.quote_request || !quote.quote_request.formats) return "Unknown Format";
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format ? format.format_name || "Unnamed Format" : "Unknown Format";
  };

  const getNumProductsForFormat = (formatId: string): number => {
    if (!quote.quote_request || !quote.quote_request.formats) return 1;
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format ? format.num_products || 1 : 1;
  };

  return (
    <div className="space-y-6">
      {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
        const formatName = getFormatName(formatId);
        const numProducts = getNumProductsForFormat(formatId);
        
        return (
          <Card key={formatId} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">{formatName}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      {Array.from({ length: numProducts }, (_, index) => (
                        <TableHead key={index}>
                          Product {index + 1}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceBreaks.map((priceBreak: any, index: number) => (
                      <TableRow key={priceBreak.id || index}>
                        <TableCell className="font-medium">
                          {priceBreak.quantity.toLocaleString()}
                        </TableCell>
                        
                        {Array.from({ length: numProducts }, (_, productIndex) => {
                          const unitCostKey = `unit_cost_${productIndex + 1}`;
                          const unitCost = priceBreak[unitCostKey];
                          
                          return (
                            <TableCell key={productIndex}>
                              {unitCost != null 
                                ? formatCurrency(unitCost, quote.currency || 'USD') 
                                : '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
