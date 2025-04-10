
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceBreakTable } from '@/components/quotes/shared/price-break/PriceBreakTable';
import { SupplierQuote } from '@/types/supplierQuote';
import { X } from 'lucide-react';

interface SupplierQuoteDetailsDialogProps {
  quote: SupplierQuote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierQuoteDetailsDialog({
  quote,
  open,
  onOpenChange
}: SupplierQuoteDetailsDialogProps) {
  if (!quote) return null;

  // Format price breaks data for the table component
  const priceBreaksWithProducts = quote.price_breaks?.map(pb => ({
    ...pb,
    quantity: pb.quantity,
  })) || [];

  // Prepare data for each format
  const formatPricingData = quote.formats?.map(format => {
    // Get price breaks for this format
    const formatProducts = quote.price_breaks?.filter(pb => {
      const formatMatch = pb.quote_request_format_id === format.quote_request_format_id;
      return formatMatch;
    }).map((pb, index) => ({
      index,
      heading: `Qty ${pb.quantity}`
    })) || [];

    return {
      format,
      products: formatProducts,
      priceBreaks: priceBreaksWithProducts.filter(pb => {
        const formatMatch = pb.quote_request_format_id === format.quote_request_format_id;
        return formatMatch;
      })
    };
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quote Details</DialogTitle>
          <DialogDescription>
            {quote.supplier?.supplier_name} - Reference: {quote.reference_id || quote.reference || quote.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pricing">Price Breaks</TabsTrigger>
            <TabsTrigger value="extras">Extra Costs & Savings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing" className="space-y-4">
            {formatPricingData.length > 0 ? (
              formatPricingData.map((data, idx) => (
                <PriceBreakTable
                  key={data.format.id}
                  formatName={data.format.format_name}
                  formatDescription={data.format.dimensions}
                  priceBreaks={data.priceBreaks}
                  products={data.products}
                  isReadOnly={true}
                  currency={quote.currency}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No price break data available
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="extras">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Extra Costs</h3>
                {quote.extra_costs && quote.extra_costs.length > 0 ? (
                  <div className="border rounded-md p-4">
                    <ul className="space-y-2">
                      {quote.extra_costs.map((cost, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{cost.extra_cost_id}</span>
                          <span className="font-medium">
                            {cost.unit_cost} {quote.currency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No extra costs specified</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Savings</h3>
                {quote.savings && quote.savings.length > 0 ? (
                  <div className="border rounded-md p-4">
                    <ul className="space-y-2">
                      {quote.savings.map((saving, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{saving.saving_name || saving.saving_id}</span>
                          <span className="font-medium">
                            {saving.unit_cost} {quote.currency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No savings specified</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
