
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extra Costs</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
