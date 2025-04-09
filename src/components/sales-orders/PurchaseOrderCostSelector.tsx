
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { Loader2 } from 'lucide-react';

interface PurchaseOrderCostSelectorProps {
  productId?: string;
  formatId?: string;
  value?: string;
  onChange: (value: string, unitCost: number) => void;
  disabled?: boolean;
}

export function PurchaseOrderCostSelector({ 
  productId,
  formatId,
  value,
  onChange,
  disabled = false
}: PurchaseOrderCostSelectorProps) {
  const { data: supplierQuotes = [], isLoading } = useSupplierQuotesByProduct({
    productId,
    formatId
  });
  
  // Prepare options from supplier quotes with null check
  const options = React.useMemo(() => {
    const allOptions: { id: string, label: string, cost: number }[] = [];
    
    if (!supplierQuotes || supplierQuotes.length === 0) {
      return allOptions;
    }

    supplierQuotes.forEach(quote => {
      if (quote?.price_breaks && quote.price_breaks.length > 0) {
        quote.price_breaks
          .filter(priceBreak => priceBreak.product_id === productId)
          .forEach(priceBreak => {
            if (priceBreak.unit_cost) {
              allOptions.push({
                id: `${quote.id}:${priceBreak.id}`,
                label: `${quote.supplier?.supplier_name || 'Unknown Supplier'} - ${priceBreak.quantity} units at ${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: quote.currency || 'USD'
                }).format(priceBreak.unit_cost)}`,
                cost: priceBreak.unit_cost
              });
            }
          });
      }
    });
    
    return allOptions;
  }, [supplierQuotes, productId]);

  const handleSelectChange = (selectedId: string) => {
    const option = options.find(opt => opt.id === selectedId);
    if (option) {
      onChange(selectedId, option.cost);
    }
  };

  if (disabled || !productId) {
    return <div className="text-muted-foreground text-sm">Select a product first</div>;
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading supplier quotes...</span>
        </div>
      ) : options.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No supplier quotes found for this product
        </div>
      ) : (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select supplier cost" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
