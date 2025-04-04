
import { useFieldArray, Control, UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteExtraCost } from "@/types/supplierQuote";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { useExtraCosts } from "@/hooks/useExtraCosts";

interface UseExtraCostsManagementProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function useExtraCostsManagement({ 
  control, 
  quoteRequest, 
  form 
}: UseExtraCostsManagementProps) {
  const { unitOfMeasures } = useUnitOfMeasures();
  const { extraCosts: libraryExtraCosts } = useExtraCosts();
  const [extraCosts, setExtraCosts] = useState<SupplierQuoteExtraCost[]>([]);
  
  const { fields, append } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  // Initialize extra costs from quote request
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

  // Helper function to find the field index
  const findFieldIndex = (extraCostId: string) => {
    return fields.findIndex(field => field.extra_cost_id === extraCostId);
  };

  // Group costs by unit of measure type (inventory vs non-inventory)
  const groupExtraCostsByType = () => {
    if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0) {
      return { inventoryCosts: [], nonInventoryCosts: [] };
    }

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

    return { inventoryCosts, nonInventoryCosts };
  };

  // Get extra cost name by id
  const getExtraCostNameById = (id: string) => {
    const extraCost = libraryExtraCosts.find(cost => cost.id === id);
    return extraCost ? extraCost.name : "Unknown Cost";
  };

  // Get format price breaks
  const getFormatPriceBreaks = () => {
    const formatPriceBreaks: Record<string, any[]> = {};
    if (quoteRequest.formats) {
      quoteRequest.formats.forEach(format => {
        if (format.price_breaks && format.price_breaks.length > 0) {
          formatPriceBreaks[format.id] = format.price_breaks;
        }
      });
    }
    return formatPriceBreaks;
  };

  // Helper function to get the number of products for a format
  const getNumProductsForFormat = (formatId: string): number => {
    if (!quoteRequest.formats) return 1;
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format?.num_products || 1;
  };

  return {
    fields,
    findFieldIndex,
    groupExtraCostsByType,
    getExtraCostNameById,
    getFormatPriceBreaks,
    getNumProductsForFormat
  };
}
