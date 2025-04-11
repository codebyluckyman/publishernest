
import { useState } from 'react';
import { SupplierQuote } from '@/types/supplierQuote';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SupplierQuoteInfoProps {
  productId?: string;
  formatId?: string;
  supplierId?: string;
  value?: string;
  onChange: (quoteId: string, unitCost: number, supplierId: string) => void;
  disabled?: boolean;
}

export function SupplierQuoteInfo({
  productId,
  formatId,
  supplierId,
  value,
  onChange,
  disabled = false,
}: SupplierQuoteInfoProps) {
  const { quotes, isLoading } = useSupplierQuotesByProduct(productId, formatId, supplierId);
  const [manualCost, setManualCost] = useState<boolean>(false);
  const [customUnitCost, setCustomUnitCost] = useState<number | null>(null);

  if (!productId) {
    return <div className="text-sm text-muted-foreground">Select a product first</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading quotes...</span>
      </div>
    );
  }

  const handleQuoteSelection = (quoteId: string) => {
    if (quoteId === 'manual') {
      setManualCost(true);
      return;
    }
    
    setManualCost(false);
    
    const selectedQuote = quotes.find(quote => quote.id === quoteId);
    if (!selectedQuote) return;
    
    // Find the best price break for this product and format
    const bestPriceBreak = selectedQuote.price_breaks?.find(pb => 
      pb.product_id === productId && 
      (!formatId || pb.format_id === formatId)
    );
    
    const unitCost = bestPriceBreak?.unit_cost || 0;
    
    onChange(quoteId, unitCost, selectedQuote.supplier_id);
  };

  const handleManualCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = parseFloat(e.target.value);
    setCustomUnitCost(cost);
    onChange('manual', cost, supplierId || '');
  };

  return (
    <div className="space-y-2">
      <Select
        disabled={disabled}
        value={value || ''}
        onValueChange={handleQuoteSelection}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select cost source" />
        </SelectTrigger>
        <SelectContent>
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <SelectItem key={quote.id} value={quote.id}>
                {quote.supplier?.supplier_name} - {quote.reference_id || 'No Reference'}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-quotes" disabled>
              No quotes available
            </SelectItem>
          )}
          <SelectItem value="manual">Custom cost</SelectItem>
        </SelectContent>
      </Select>

      {manualCost && (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={customUnitCost || ''}
            onChange={handleManualCostChange}
            className="w-28 h-9 px-3 py-2 rounded-md border border-input text-sm"
            placeholder="Enter cost"
          />
        </div>
      )}
    </div>
  );
}
