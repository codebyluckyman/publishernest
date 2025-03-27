
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect } from "react";
import { ExtraCostItem } from "./ExtraCostItem";
import { ExtraCostTableItem } from "@/types/extraCost";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";

interface ExtraCostsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  extraCosts: ExtraCostTableItem[];
  currency: string;
  formats?: any[];
}

export function ExtraCostsSection({ control, extraCosts, currency, formats }: ExtraCostsSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  // Initialize extra costs when supplier changes
  useEffect(() => {
    if (!extraCosts || extraCosts.length === 0 || !supplierId) {
      replace([]);
      return;
    }
    
    const newExtraCosts = extraCosts.map(cost => ({
      extra_cost_id: cost.id || "",
      unit_cost: null,
      // Add multiple unit costs for each product
      unit_cost_1: null,
      unit_cost_2: null,
      unit_cost_3: null,
      unit_cost_4: null,
      unit_cost_5: null,
      unit_cost_6: null,
      unit_cost_7: null,
      unit_cost_8: null,
      unit_cost_9: null,
      unit_cost_10: null,
    }));
    
    replace(newExtraCosts);
  }, [supplierId, extraCosts, replace]);
  
  if (!extraCosts || extraCosts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No extra costs were requested for this quote request.</p>
      </div>
    );
  }

  // Get the maximum number of products across all formats
  const maxNumProducts = formats && formats.length > 0 
    ? Math.max(...formats.map(format => format.num_products || 1)) 
    : 1;
  
  // Determine if we need to show multiple product columns
  const showMultiProducts = maxNumProducts > 1;
  
  const currencySymbol = getSymbolForCurrency(currency);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Extra Costs</h3>
        <div className="text-md font-medium">
          Unit Costs <span className="text-muted-foreground">({currencySymbol})</span>
        </div>
      </div>
      
      {/* Display product numbers header at the top */}
      {showMultiProducts && (
        <div className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-6">
            {/* Empty space for cost names */}
          </div>
          <div className="col-span-6">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((i) => (
                <div key={i} className="text-center">
                  <span className="text-xs font-medium">Product {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {fields.map((field, index) => {
          const extraCost = extraCosts.find(cost => cost.id === field.extra_cost_id);
          if (!extraCost) return null;
          
          return (
            <ExtraCostItem 
              key={field.id}
              control={control}
              index={index}
              extraCost={extraCost}
              showMultiProducts={showMultiProducts}
              maxNumProducts={maxNumProducts}
            />
          );
        })}
      </div>
    </div>
  );
}
