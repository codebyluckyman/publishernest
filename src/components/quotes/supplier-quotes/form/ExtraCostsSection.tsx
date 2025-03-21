
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { ExtraCostItem } from "./ExtraCostItem";

interface ExtraCostsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsSection({ control, quoteRequest }: ExtraCostsSectionProps) {
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
    if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0 || !supplierId) {
      replace([]);
      return;
    }
    
    const newExtraCosts = quoteRequest.extra_costs.map(cost => ({
      extra_cost_id: cost.id || "",
      unit_cost: null,
      notes: ""
    }));
    
    replace(newExtraCosts);
  }, [supplierId, quoteRequest.extra_costs, replace]);
  
  if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0) {
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
            const extraCost = quoteRequest.extra_costs?.find(cost => cost.id === field.extra_cost_id);
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
