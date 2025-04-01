
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

  // Group price breaks by format
  const priceBreaksByFormat: Record<string, any[]> = {};
  quote.price_breaks.forEach(priceBreak => {
    if (!priceBreaksByFormat[priceBreak.quote_request_format_id]) {
      priceBreaksByFormat[priceBreak.quote_request_format_id] = [];
    }
    priceBreaksByFormat[priceBreak.quote_request_format_id].push(priceBreak);
  });

  const getFormatName = (formatId: string): string => {
    if (!quote.quote_request || !quote.quote_request.formats) return "Unknown Format";
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format ? format.format_name || "Unnamed Format" : "Unknown Format";
  };

  const getProductsForFormat = (formatId: string): any[] => {
    if (!quote.quote_request || !quote.quote_request.formats) return [];
    
    const format = quote.quote_request.formats.find((f: any) => f.id === formatId);
    return format && format.products ? format.products : [];
  };

  const getProductTitle = (productId: string): string => {
    if (!quote.quote_request || !quote.quote_request.formats) return "Unknown Product";
    
    for (const format of quote.quote_request.formats) {
      if (!format.products) continue;
      
      const product = format.products.find((p: any) => p.product_id === productId);
      if (product) {
        return product.product_name || "Unnamed Product";
      }
    }
    
    return "Unknown Product";
  };

  return (
    <div className="space-y-6">
      {Object.entries(priceBreaksByFormat).map(([formatId, priceBreaks]) => {
        const formatName = getFormatName(formatId);
        const products = getProductsForFormat(formatId);
        
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
                      {products.map((product: any, index: number) => (
                        <TableHead key={product.product_id || index}>
                          {getProductTitle(product.product_id)}
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
                        
                        {products.map((product: any, productIndex: number) => {
                          const unitCostKey = `unit_cost_${productIndex + 1}`;
                          const unitCost = priceBreak[unitCostKey];
                          
                          return (
                            <TableCell key={product.product_id || productIndex}>
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
