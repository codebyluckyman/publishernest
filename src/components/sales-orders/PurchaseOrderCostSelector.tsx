
import React, { useMemo } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupplierQuotesByProduct } from '@/hooks/useSupplierQuotesByProduct';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  
  // Log the supplier quotes we're receiving for debugging
  console.log("PurchaseOrderCostSelector - Supplier Quotes:", 
    supplierQuotes.map(q => ({
      id: q.id, 
      supplier: q.supplier?.supplier_name,
      formats: q.formats?.map(f => ({ id: f.format_id, name: f.format_name })),
      priceBreaks: q.price_breaks?.length
    }))
  );
  
  // Organize options by supplier and quote type
  const organizedOptions = useMemo(() => {
    const productSpecificOptions: { id: string, label: string, cost: number, supplierId: string, quoteReference: string }[] = [];
    const formatSpecificOptions: { id: string, label: string, cost: number, supplierId: string, quoteReference: string }[] = [];
    const combinedOptions: { id: string, label: string, cost: number, supplierId: string, quoteReference: string }[] = [];
    
    if (!supplierQuotes || supplierQuotes.length === 0) {
      return { productSpecificOptions, formatSpecificOptions, combinedOptions };
    }

    // Process each quote to categorize by type
    supplierQuotes.forEach(quote => {
      if (!quote?.price_breaks || quote.price_breaks.length === 0) return;
      
      const hasMatchingFormat = quote.formats?.some(format => format.format_id === formatId);
      const matchingFormat = quote.formats?.find(format => format.format_id === formatId);
      const formatName = matchingFormat?.format_name || "Unknown Format";
      
      quote.price_breaks
        .forEach(priceBreak => {
          const isProductMatch = priceBreak.product_id === productId;
          const option = {
            id: `${quote.id}:${priceBreak.id}`,
            label: `${quote.supplier?.supplier_name || 'Unknown Supplier'} - ${priceBreak.quantity} units at ${formatCurrency(priceBreak.unit_cost || 0, quote.currency || 'USD')}`,
            cost: priceBreak.unit_cost || 0,
            supplierId: quote.supplier_id,
            quoteReference: quote.reference_id || quote.reference || quote.id.substring(0, 8)
          };
          
          // Categorize options based on what they match
          if (isProductMatch && hasMatchingFormat && priceBreak.unit_cost) {
            combinedOptions.push({
              ...option,
              label: `${option.label} (${formatName})`
            });
          } else if (isProductMatch && priceBreak.unit_cost) {
            productSpecificOptions.push(option);
          } else if (hasMatchingFormat && priceBreak.unit_cost && !isProductMatch) {
            formatSpecificOptions.push({
              ...option,
              label: `${option.label} (${formatName})`
            });
          }
        });
    });
    
    return { productSpecificOptions, formatSpecificOptions, combinedOptions };
  }, [supplierQuotes, productId, formatId]);
  
  const allOptionsEmpty = 
    organizedOptions.combinedOptions.length === 0 && 
    organizedOptions.productSpecificOptions.length === 0 && 
    organizedOptions.formatSpecificOptions.length === 0;

  const handleSelectChange = (selectedId: string) => {
    // Find the selected option across all categories
    const allOptions = [
      ...organizedOptions.combinedOptions, 
      ...organizedOptions.productSpecificOptions, 
      ...organizedOptions.formatSpecificOptions
    ];
    const option = allOptions.find(opt => opt.id === selectedId);
    if (option) {
      onChange(selectedId, option.cost);
    }
  };

  if (disabled) {
    return <div className="text-muted-foreground text-sm">Selection disabled</div>;
  }

  if (!productId && !formatId) {
    return <div className="text-muted-foreground text-sm">Select a product or format first</div>;
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading supplier quotes...</span>
        </div>
      ) : allOptionsEmpty ? (
        <div className="text-sm text-muted-foreground">
          No supplier quotes found for this selection
        </div>
      ) : (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select supplier cost" />
          </SelectTrigger>
          <SelectContent>
            {organizedOptions.combinedOptions.length > 0 && (
              <SelectGroup>
                <SelectLabel>Matching product and format</SelectLabel>
                {organizedOptions.combinedOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col gap-1">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">Reference: {option.quoteReference}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {organizedOptions.productSpecificOptions.length > 0 && (
              <SelectGroup>
                <SelectLabel>Matching product only</SelectLabel>
                {organizedOptions.productSpecificOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col gap-1">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">Reference: {option.quoteReference}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {organizedOptions.formatSpecificOptions.length > 0 && (
              <SelectGroup>
                <SelectLabel>Matching format only</SelectLabel>
                {organizedOptions.formatSpecificOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col gap-1">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">Reference: {option.quoteReference}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
