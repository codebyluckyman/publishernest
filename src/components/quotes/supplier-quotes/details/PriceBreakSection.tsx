
import React from 'react';
import { SupplierQuote, SupplierQuotePriceBreak } from '@/types/supplierQuote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PriceBreakSectionProps {
  quote: SupplierQuote;
}

export function PriceBreakSection({ quote }: PriceBreakSectionProps) {
  // Safely get price breaks from quote
  const priceBreaks: SupplierQuotePriceBreak[] = quote.price_breaks || [];
  
  // If no price breaks, show a message
  if (priceBreaks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Breaks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No price breaks available for this quote.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Breaks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceBreaks.map((priceBreak) => (
              <TableRow key={priceBreak.id}>
                <TableCell>{priceBreak.quantity.toLocaleString()}</TableCell>
                <TableCell>
                  {priceBreak.unit_cost 
                    ? `${quote.currency} ${priceBreak.unit_cost.toFixed(2)}`
                    : 'Not available'}
                </TableCell>
                <TableCell>
                  {priceBreak.unit_cost 
                    ? `${quote.currency} ${(priceBreak.unit_cost * priceBreak.quantity).toFixed(2)}`
                    : 'Not available'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
