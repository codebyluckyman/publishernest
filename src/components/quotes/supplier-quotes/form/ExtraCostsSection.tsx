
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect } from "react";
import { ExtraCostItem } from "./ExtraCostItem";
import { ExtraCostTableItem } from "@/types/extraCost";

interface ExtraCostsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  extraCosts: ExtraCostTableItem[];
  currency: string;
}

export function ExtraCostsSection({ control, extraCosts, currency }: ExtraCostsSectionProps) {
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
      notes: ""
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
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Extra Costs</h3>
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
            />
          );
        })}
      </div>
    </div>
  );
}
