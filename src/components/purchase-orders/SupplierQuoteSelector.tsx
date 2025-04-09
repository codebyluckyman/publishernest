
import { useEffect, useState } from 'react';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SupplierQuoteSelectorProps {
  productId?: string;
  formatId?: string;
  onQuoteSelect: (quoteData: { 
    supplierId: string, 
    supplierQuoteId: string, 
    unitCost: number 
  }) => void;
  disabled?: boolean;
}

export function SupplierQuoteSelector({
  productId,
  formatId,
  onQuoteSelect,
  disabled = false
}: SupplierQuoteSelectorProps) {
  const { data: supplierQuotes = [], isLoading } = useSupplierQuotesByProduct({
    productId,
    formatId
  });
  
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');

  // Reset selection when product changes
  useEffect(() => {
    setSelectedQuoteId('');
  }, [productId, formatId]);

  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    
    const selectedQuote = supplierQuotes.find(quote => quote.id === quoteId);
    if (selectedQuote) {
      // Find the best price break (lowest unit cost)
      let bestUnitCost = 0;
      if (selectedQuote.price_breaks && selectedQuote.price_breaks.length > 0) {
        bestUnitCost = selectedQuote.price_breaks.reduce(
          (lowest, current) => {
            const unitCost = current.unit_cost || 0;
            return !lowest || unitCost < lowest ? unitCost : lowest;
          },
          0
        );
      }
      
      onQuoteSelect({
        supplierId: selectedQuote.supplier_id,
        supplierQuoteId: selectedQuote.id,
        unitCost: bestUnitCost
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!productId) {
    return <p className="text-sm text-muted-foreground">Select a product first</p>;
  }

  if (!supplierQuotes || supplierQuotes.length === 0) {
    return <p className="text-sm text-muted-foreground">No supplier quotes found for this product</p>;
  }

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Supplier Quote</FormLabel>
        <FormControl>
          <Select
            value={selectedQuoteId}
            onValueChange={handleQuoteSelect}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier quote" />
            </SelectTrigger>
            <SelectContent>
              {supplierQuotes.map((quote) => (
                <SelectItem key={quote.id} value={quote.id}>
                  {quote.supplier?.supplier_name || 'Unknown'} - {quote.reference || quote.id.substring(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>

      {selectedQuoteId && (
        <Card>
          <CardContent className="p-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {supplierQuotes
                .find(q => q.id === selectedQuoteId)
                ?.price_breaks?.filter(pb => pb.product_id === productId)
                .map((pb, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Qty {pb.quantity}: </span>
                    <span className="font-medium">
                      {pb.unit_cost ? pb.unit_cost.toFixed(2) : "N/A"} / unit
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
