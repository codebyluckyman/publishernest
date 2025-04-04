
import { useFieldArray, Control, UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteSaving } from "@/types/supplierQuote";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { useSavings } from "@/hooks/useSavings";

interface UseSavingsManagementProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function useSavingsManagement({ 
  control, 
  quoteRequest, 
  form 
}: UseSavingsManagementProps) {
  const { unitOfMeasures } = useUnitOfMeasures();
  const { savings: librarySavings } = useSavings();
  const [savings, setSavings] = useState<SupplierQuoteSaving[]>([]);
  
  const { fields, append } = useFieldArray({
    control,
    name: "savings"
  });
  
  // Initialize savings from quote request
  useEffect(() => {
    if (!quoteRequest.savings || quoteRequest.savings.length === 0 || fields.length > 0) {
      return;
    }
    
    quoteRequest.savings.forEach(saving => {
      const unitOfMeasure = unitOfMeasures.find(
        unit => unit.id === saving.unit_of_measure_id
      );
      
      const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
      
      if (isInventoryUnit) {
        append({
          saving_id: saving.id,
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
          unit_of_measure_id: saving.unit_of_measure_id
        });
      } else {
        append({
          saving_id: saving.id,
          unit_cost: null,
          unit_of_measure_id: saving.unit_of_measure_id
        });
      }
    });
  }, [quoteRequest.savings, append, fields.length, unitOfMeasures]);

  // Helper function to find the field index
  const findFieldIndex = (savingId: string) => {
    return fields.findIndex(field => field.saving_id === savingId);
  };

  // Group savings by unit of measure type (inventory vs non-inventory)
  const groupSavingsByType = () => {
    if (!quoteRequest.savings || quoteRequest.savings.length === 0) {
      return { inventorySavings: [], nonInventorySavings: [] };
    }

    const inventorySavings: typeof quoteRequest.savings = [];
    const nonInventorySavings: typeof quoteRequest.savings = [];
  
    quoteRequest.savings.forEach(saving => {
      const unitOfMeasure = unitOfMeasures.find(unit => unit.id === saving.unit_of_measure_id);
      if (unitOfMeasure?.is_inventory_unit) {
        inventorySavings.push(saving);
      } else {
        nonInventorySavings.push(saving);
      }
    });

    return { inventorySavings, nonInventorySavings };
  };

  // Get saving name by id
  const getSavingNameById = (id: string) => {
    const saving = librarySavings.find(saving => saving.id === id);
    return saving ? saving.name : "Unknown Saving";
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
    groupSavingsByType,
    getSavingNameById,
    getFormatPriceBreaks,
    getNumProductsForFormat
  };
}
