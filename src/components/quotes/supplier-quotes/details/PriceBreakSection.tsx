
import React from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceBreakSectionProps {
  quote: SupplierQuote;
}

export function PriceBreakSection({ quote }: PriceBreakSectionProps) {
  // Safely extract price breaks
  const priceBreaks = quote.price_breaks || [];
  
  if (priceBreaks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Breaks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">No price break information available</p>
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
              <TableHead>Format</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceBreaks.map((priceBreak) => {
              // Find the format for this price break if available
              const formatId = priceBreak.format_id;
              const formatName = formatId && quote.formats ? 
                quote.formats.find(f => f.format_id === formatId)?.format_name : 'N/A';
                
              return (
                <TableRow key={priceBreak.id}>
                  <TableCell>{formatName || 'N/A'}</TableCell>
                  <TableCell>{priceBreak.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {priceBreak.unit_cost ? 
                      `${quote.currency} ${priceBreak.unit_cost.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {priceBreak.unit_cost ? 
                      `${quote.currency} ${(priceBreak.unit_cost * priceBreak.quantity).toFixed(2)}` : 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
