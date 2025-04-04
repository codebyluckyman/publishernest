
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";

interface PriceBreakEditControlsProps {
  isReadOnly: boolean;
  control: any;
  fieldArrayName?: string;
  priceBreaks: any[];
  products: any[];
  currency?: string;
}

export function PriceBreakEditControls({
  isReadOnly,
  control,
  fieldArrayName,
  priceBreaks,
  products,
  currency
}: PriceBreakEditControlsProps) {
  const formContext = useFormContext();
  const [useSingleProductCost, setUseSingleProductCost] = useState(false);
  const [useSingleCostForAll, setUseSingleCostForAll] = useState(false);
  const [globalUnitCost, setGlobalUnitCost] = useState<string>('');

  // Apply global unit cost to all price breaks and products
  const applyGlobalUnitCost = () => {
    if (!control || !fieldArrayName || !formContext) return;
    
    const costValue = globalUnitCost === '' ? null : parseFloat(globalUnitCost);
    
    const sortedPriceBreaks = [...priceBreaks].sort((a, b) => a.quantity - b.quantity);
    
    sortedPriceBreaks.forEach((priceBreak) => {
      // Find the index in the form field array
      const fieldIndex = priceBreaks.findIndex(p => 
        (p.price_break_id === priceBreak.price_break_id || p.id === priceBreak.id)
      );
      
      if (fieldIndex !== -1) {
        products.forEach((product) => {
          const unitCostKey = `unit_cost_${product.index + 1}`;
          const costFieldName = `${fieldArrayName}.${fieldIndex}.${unitCostKey}`;
          formContext.setValue(costFieldName, costValue);
        });
      }
    });
  };

  if (isReadOnly || !control || products.length <= 1) return null;
  
  return (
    <div className="flex flex-col space-y-3 p-3 bg-muted/30 border-t">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="use-single-product-cost" 
          checked={useSingleProductCost} 
          onCheckedChange={(checked) => setUseSingleProductCost(checked === true)}
          disabled={useSingleCostForAll}
        />
        <Label htmlFor="use-single-product-cost" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Apply Product 1 cost to all products
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="use-single-cost-for-all" 
          checked={useSingleCostForAll} 
          onCheckedChange={(checked) => setUseSingleCostForAll(checked === true)}
        />
        <Label htmlFor="use-single-cost-for-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Use one cost for all price breaks & products
        </Label>
      </div>
      
      {useSingleCostForAll && (
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative w-32">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">{currency}</span>
            </div>
            <Input
              placeholder="0.00"
              className="pl-10 h-8"
              type="number"
              step="0.01"
              min="0"
              value={globalUnitCost}
              onChange={(e) => setGlobalUnitCost(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-8" 
            onClick={applyGlobalUnitCost}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
  
  return { useSingleProductCost, useSingleCostForAll };
}
