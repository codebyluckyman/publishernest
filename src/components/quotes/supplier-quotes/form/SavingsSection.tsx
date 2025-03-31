
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect } from "react";
import { SavingItem } from "./SavingItem";
import { SavingTableItem } from "@/types/saving";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";

interface SavingsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  savings: SavingTableItem[];
  currency: string;
  formats?: any[];
}

export function SavingsSection({ control, savings, currency, formats }: SavingsSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "savings"
  });
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  // Initialize savings when supplier changes
  useEffect(() => {
    if (!savings || savings.length === 0 || !supplierId) {
      replace([]);
      return;
    }
    
    const newSavings = savings.map(saving => ({
      saving_id: saving.id || "",
      unit_cost: null,
      notes: "",
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
    
    replace(newSavings);
  }, [supplierId, savings, replace]);
  
  if (!savings || savings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No savings were requested for this quote request.</p>
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
        <h3 className="text-lg font-medium">Savings</h3>
        <div className="text-md font-medium">
          Unit Costs <span className="text-muted-foreground">({currencySymbol})</span>
        </div>
      </div>
      
      {/* Display product numbers header at the top */}
      {showMultiProducts && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
          <div className="md:col-span-4">
            {/* Empty space for saving names */}
          </div>
          <div className="md:col-span-8">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((i) => (
                <div key={i} className="text-center">
                  <span className="text-xs font-medium text-muted-foreground">Product {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {fields.map((field, index) => {
          const saving = savings.find(saving => saving.id === field.saving_id);
          if (!saving) return null;
          
          return (
            <SavingItem 
              key={field.id}
              control={control}
              index={index}
              saving={saving}
              showMultiProducts={showMultiProducts}
              maxNumProducts={maxNumProducts}
            />
          );
        })}
      </div>
    </div>
  );
}
