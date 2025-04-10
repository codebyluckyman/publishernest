
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatDate, formatCurrency } from '@/lib/utils';

interface SupplierQuoteSelectorProps {
  productId?: string;
  formatId?: string;
  onQuoteSelect: (data: {
    supplierId: string;
    supplierQuoteId: string;
    unitCost: number;
    supplierName: string;
    quoteReference: string;
    validFrom?: string | null;
    validTo?: string | null;
  }) => void;
  disabled?: boolean;
}

export function SupplierQuoteSelector({
  productId,
  formatId,
  onQuoteSelect,
  disabled
}: SupplierQuoteSelectorProps) {
  const { data: supplierQuotes = [], isLoading } = useSupplierQuotesByProduct({
    productId,
    formatId
  });
  
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  
  // Clear selection when product/format changes
  useEffect(() => {
    setSelectedQuoteId(null);
  }, [productId, formatId]);
  
  // No product selected yet
  if (!productId) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Select a product to view available supplier quotes
      </div>
    );
  }
  
  // Loading quotes
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading supplier quotes...</p>
      </div>
    );
  }
  
  // No quotes found
  if (supplierQuotes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No supplier quotes found for this product{formatId ? ' and format' : ''}
      </div>
    );
  }
  
  const handleQuoteSelect = (quoteId: string, priceBreakId: string, unitCost: number, supplierId: string, supplierName: string, quoteReference: string, validFrom?: string | null, validTo?: string | null) => {
    setSelectedQuoteId(quoteId);
    onQuoteSelect({
      supplierQuoteId: quoteId,
      supplierId,
      unitCost,
      supplierName,
      quoteReference,
      validFrom,
      validTo
    });
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Available Supplier Quotes</h3>
        <RadioGroup 
          value={selectedQuoteId || undefined}
          onValueChange={value => {
            // Do nothing here as we handle selection in the individual handler
          }}
          className="space-y-4"
        >
          {supplierQuotes.map((quote) => {
            // Only look at price breaks that have unit costs
            const validPriceBreaks = quote.price_breaks?.filter(pb => pb.unit_cost) || [];
            
            if (validPriceBreaks.length === 0) return null;
            
            return (
              <div key={quote.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{quote.supplier?.supplier_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Reference: {quote.reference_id || quote.reference || quote.id.substring(0, 8)}
                    </p>
                    {quote.valid_from && quote.valid_to && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valid: {formatDate(quote.valid_from)} to {formatDate(quote.valid_to)}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {quote.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  {validPriceBreaks.map((priceBreak) => (
                    <div 
                      key={priceBreak.id}
                      className="flex items-center space-x-2 pl-2"
                      onClick={() => handleQuoteSelect(
                        quote.id, 
                        priceBreak.id, 
                        priceBreak.unit_cost || 0, 
                        quote.supplier_id,
                        quote.supplier?.supplier_name || 'Unknown Supplier',
                        quote.reference_id || quote.reference || quote.id.substring(0, 8),
                        quote.valid_from,
                        quote.valid_to
                      )}
                    >
                      <RadioGroupItem 
                        value={`${quote.id}:${priceBreak.id}`}
                        id={`${quote.id}:${priceBreak.id}`}
                        checked={selectedQuoteId === quote.id}
                        disabled={disabled}
                      />
                      <Label 
                        htmlFor={`${quote.id}:${priceBreak.id}`}
                        className="flex justify-between w-full cursor-pointer"
                      >
                        <span>Quantity: {priceBreak.quantity}</span>
                        <span>{formatCurrency(priceBreak.unit_cost || 0, quote.currency)} per unit</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
