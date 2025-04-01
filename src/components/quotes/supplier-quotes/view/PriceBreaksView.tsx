
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
            
            return (
              <div key={formatId} className="space-y-2">
                <h3 className="text-md font-medium">{formatName}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPriceBreaks?.map((priceBreak) => {
                      // Calculate total
                      const unitCost = priceBreak.unit_cost || 0;
                      const total = unitCost * priceBreak.quantity;
                      
                      return (
                        <TableRow key={priceBreak.id}>
                          <TableCell>{priceBreak.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {unitCost ? `${quote.currency} ${unitCost.toFixed(4)}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {unitCost ? `${quote.currency} ${total.toFixed(2)}` : 'N/A'}
                          </TableCell>
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
