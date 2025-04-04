
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteExtraCost } from "@/types/supplierQuote";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { useState, useEffect } from "react";
import { InventoryExtraCosts } from "./InventoryExtraCosts";
import { NonInventoryExtraCosts } from "./NonInventoryExtraCosts";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const { unitOfMeasures } = useUnitOfMeasures();
  const form = useFormContext<SupplierQuoteFormValues>();
  const [extraCosts, setExtraCosts] = useState<SupplierQuoteExtraCost[]>([]);
  
  const { fields, append } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  useEffect(() => {
    if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0 || fields.length > 0) {
      return;
    }
    
    quoteRequest.extra_costs.forEach(extraCost => {
      const unitOfMeasure = unitOfMeasures.find(
        unit => unit.id === extraCost.unit_of_measure_id
      );
      
      const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
      
      if (isInventoryUnit) {
        append({
          extra_cost_id: extraCost.id,
          unit_cost: null,
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
          unit_of_measure_id: extraCost.unit_of_measure_id
        });
      } else {
        append({
          extra_cost_id: extraCost.id,
          unit_cost: null,
          unit_of_measure_id: extraCost.unit_of_measure_id
        });
      }
    });
  }, [quoteRequest.extra_costs, append, fields.length, unitOfMeasures]);

  if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Extra Costs</h3>
        <p className="text-muted-foreground mt-2">
          This quote request does not have any extra costs defined.
        </p>
      </div>
    );
  }

  // Group costs by unit of measure type (inventory vs non-inventory)
  const inventoryCosts: typeof quoteRequest.extra_costs = [];
  const nonInventoryCosts: typeof quoteRequest.extra_costs = [];
  
  quoteRequest.extra_costs.forEach(cost => {
    const unitOfMeasure = unitOfMeasures.find(unit => unit.id === cost.unit_of_measure_id);
    if (unitOfMeasure?.is_inventory_unit) {
      inventoryCosts.push(cost);
    } else {
      nonInventoryCosts.push(cost);
    }
  });

  // Helper function to find the field index
  const findFieldIndex = (extraCostId: string) => {
    return fields.findIndex(field => field.extra_cost_id === extraCostId);
  };

  return (
    <div className="space-y-6">
      {inventoryCosts.length > 0 && (
        <InventoryExtraCosts 
          inventoryCosts={inventoryCosts}
          quoteRequest={quoteRequest}
          control={control}
          findFieldIndex={findFieldIndex}
          form={form}
        />
      )}

      {nonInventoryCosts.length > 0 && (
        <NonInventoryExtraCosts 
          nonInventoryCosts={nonInventoryCosts}
          findFieldIndex={findFieldIndex}
          control={control}
          form={form}
        />
      )}
    </div>
  );
}
