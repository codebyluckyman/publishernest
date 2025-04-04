import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useUnitOfMeasures } from "./useUnitOfMeasures";

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
  
  // Function to find the index of an extra cost in the form array
  const findFieldIndex = (extraCostId: string, priceBreakId?: string) => {
    const extraCosts = form.getValues("extra_costs") || [];
    if (!extraCosts) return -1;
    
    // If a price break ID is provided, we need to find the exact match
    if (priceBreakId) {
      return extraCosts.findIndex(ec => 
        ec.extra_cost_id === extraCostId && 
        ec.price_break_id === priceBreakId
      );
    }
    
    // Otherwise, just match by extra cost ID
    return extraCosts.findIndex(ec => ec.extra_cost_id === extraCostId);
  };
  
  // Group quote request extra costs by unit of measure type
  const groupExtraCostsByType = () => {
    const requestExtraCosts = quoteRequest.extra_costs || [];
    
    // Separate into inventory and non-inventory costs
    const inventoryCosts: QuoteRequest['extra_costs'] = [];
    const nonInventoryCosts: QuoteRequest['extra_costs'] = [];
    
    requestExtraCosts.forEach(extraCost => {
      // Find the unit of measure for this extra cost
      const unitOfMeasure = unitOfMeasures.find(
        unit => unit.id === extraCost.unit_of_measure_id
      );
      
      if (unitOfMeasure?.is_inventory_unit) {
        inventoryCosts.push(extraCost);
      } else {
        nonInventoryCosts.push(extraCost);
      }
    });
    
    return { inventoryCosts, nonInventoryCosts };
  };
  
  // Get number of products for a specific format
  const getNumProductsForFormat = (formatId: string): number => {
    if (!quoteRequest || !quoteRequest.formats) return 1;
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format?.num_products || 1;
  };
  
  // Get all price breaks organized by format
  const getFormatPriceBreaks = () => {
    const formatPriceBreaks: Record<string, any[]> = {};
    
    if (quoteRequest.formats) {
      quoteRequest.formats.forEach(format => {
        if (format.price_breaks && format.price_breaks.length > 0) {
          // Sort price breaks by quantity
          const sortedBreaks = [...format.price_breaks].sort((a, b) => a.quantity - b.quantity);
          formatPriceBreaks[format.id] = sortedBreaks;
        }
      });
    }
    
    return formatPriceBreaks;
  };

  return {
    findFieldIndex,
    groupExtraCostsByType,
    getNumProductsForFormat,
    getFormatPriceBreaks
  };
}
