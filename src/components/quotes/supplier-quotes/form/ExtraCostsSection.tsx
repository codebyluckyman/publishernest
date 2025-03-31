
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect, useState } from "react";
import { ExtraCostItem } from "./ExtraCostItem";
import { ExtraCostTableItem } from "@/types/extraCost";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";
import { QuoteRequest } from "@/types/quoteRequest";
import { CollapsibleSection } from "../CollapsibleSection";

interface ExtraCostsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  extraCosts: ExtraCostTableItem[];
  currency: string;
  formats?: any[];
  quoteRequest: QuoteRequest;
}

export function ExtraCostsSection({ control, extraCosts, currency, formats, quoteRequest }: ExtraCostsSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
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
    
    // Get all price breaks from the quote request
    const allPriceBreaks = quoteRequest.formats?.flatMap(format => 
      format.price_breaks?.map(pb => ({
        ...pb,
        format_name: format.format_name,
        format_id: format.format_id
      })) || []
    ) || [];
    
    const newExtraCosts = extraCosts.map(cost => ({
      extra_cost_id: cost.id || "",
      price_breaks: allPriceBreaks.map(priceBreak => ({
        price_break_id: priceBreak.id || "",
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
      }))
    }));
    
    replace(newExtraCosts);
  }, [supplierId, extraCosts, replace, quoteRequest.formats]);
  
  const handleOpenChange = (costId: string, isOpen: boolean) => {
    setOpenItems(prev => ({
      ...prev,
      [costId]: isOpen
    }));
  };
  
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
  
  // Get all price breaks from the quote request for displaying
  const allPriceBreaks = quoteRequest.formats?.flatMap(format => 
    format.price_breaks?.map(pb => ({
      ...pb,
      format_name: format.format_name,
      format_id: format.format_id
    })) || []
  ) || [];
  
  // Sort price breaks by quantity in ascending order
  const sortedPriceBreaks = allPriceBreaks.sort((a, b) => a.quantity - b.quantity);
  
  // Group extra costs by unit of measure
  const groupedExtraCosts: Record<string, ExtraCostTableItem[]> = {};
  
  extraCosts.forEach(cost => {
    const unitKey = cost.unit_of_measure_name || 'Other';
    if (!groupedExtraCosts[unitKey]) {
      groupedExtraCosts[unitKey] = [];
    }
    groupedExtraCosts[unitKey].push(cost);
  });
  
  return (
    <CollapsibleSection
      title="Extra Costs"
      isEmpty={fields.length === 0}
      emptyMessage="No extra costs were requested for this quote request."
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-md font-medium">
            Unit Costs <span className="text-muted-foreground">({currencySymbol})</span>
          </div>
        </div>
        
        {Object.entries(groupedExtraCosts).map(([unitName, costsGroup]) => (
          <div key={unitName} className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">{unitName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {costsGroup.map(extraCost => {
                const fieldIndex = fields.findIndex(f => f.extra_cost_id === extraCost.id);
                if (fieldIndex === -1) return null;
                
                const field = fields[fieldIndex];
                
                return (
                  <ExtraCostItem 
                    key={field.id}
                    control={control}
                    index={fieldIndex}
                    extraCost={extraCost}
                    showMultiProducts={showMultiProducts}
                    maxNumProducts={maxNumProducts}
                    priceBreaks={sortedPriceBreaks}
                    isOpen={!!openItems[extraCost.id]}
                    onOpenChange={handleOpenChange}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
