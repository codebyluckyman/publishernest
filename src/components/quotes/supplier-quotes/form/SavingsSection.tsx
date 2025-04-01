
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect, useState } from "react";
import { SavingItem } from "./SavingItem";
import { SavingTableItem } from "@/types/saving";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";
import { QuoteRequest, PriceBreak } from "@/types/quoteRequest";
import { CollapsibleSection } from "../CollapsibleSection";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";

interface SavingsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  savings: SavingTableItem[];
  currency: string;
  formats?: any[];
  quoteRequest: QuoteRequest;
}

export function SavingsSection({ control, savings, currency, formats, quoteRequest }: SavingsSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "savings"
  });
  
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  const { unitOfMeasures } = useUnitOfMeasures();
  
  // Initialize savings when supplier changes
  useEffect(() => {
    if (!savings || savings.length === 0 || !supplierId) {
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
    
    const newSavings = savings.map(saving => {
      // Check if this is an inventory unit
      const unitOfMeasure = unitOfMeasures?.find(u => u.id === saving.unit_of_measure_id);
      const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
      
      return {
        saving_id: saving.id || "",
        notes: "",
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
      };
    });
    
    replace(newSavings);
  }, [supplierId, savings, replace, quoteRequest.formats, unitOfMeasures]);

  const handleOpenChange = (savingId: string, isOpen: boolean) => {
    setOpenItems(prev => ({
      ...prev,
      [savingId]: isOpen
    }));
  };
  
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
  
  // Get all price breaks from the quote request for displaying
  const allPriceBreaks = quoteRequest.formats?.flatMap(format => 
    format.price_breaks?.map(pb => ({
      ...pb,
      format_name: format.format_name,
      format_id: format.format_id
    })) || []
  ) || [];
  
  // Sort price breaks by quantity in ascending order
  // Ensure each object has required 'id' property for PriceBreak compatibility
  const sortedPriceBreaks = allPriceBreaks
    .map(pb => ({
      ...pb,
      id: pb.id || `temp-id-${Math.random().toString(36).substring(2, 11)}` // Ensure id exists
    }))
    .sort((a, b) => a.quantity - b.quantity) as PriceBreak[];
  
  // Group savings by unit of measure
  const groupedSavings: Record<string, SavingTableItem[]> = {};
  
  savings.forEach(saving => {
    const unitKey = saving.unit_of_measure_name || 'Other';
    if (!groupedSavings[unitKey]) {
      groupedSavings[unitKey] = [];
    }
    groupedSavings[unitKey].push(saving);
  });
  
  return (
    <CollapsibleSection
      title="Savings"
      isEmpty={fields.length === 0}
      emptyMessage="No savings were requested for this quote request."
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-md font-medium">
            {currencySymbol} Savings
          </div>
        </div>
        
        {Object.entries(groupedSavings).map(([unitName, savingsGroup]) => (
          <div key={unitName} className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">{unitName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savingsGroup.map(saving => {
                const fieldIndex = fields.findIndex(f => f.saving_id === saving.id);
                if (fieldIndex === -1) return null;
                
                const field = fields[fieldIndex];
                
                return (
                  <SavingItem 
                    key={field.id}
                    control={control}
                    index={fieldIndex}
                    saving={saving}
                    showMultiProducts={showMultiProducts}
                    maxNumProducts={maxNumProducts}
                    priceBreaks={sortedPriceBreaks}
                    isOpen={!!openItems[saving.id]}
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
