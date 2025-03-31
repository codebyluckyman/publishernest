import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect, useState } from "react";
import { SavingItem } from "./SavingItem";
import { SavingTableItem } from "@/types/saving";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";
import { QuoteRequest } from "@/types/quoteRequest";
import { CollapsibleSection } from "../CollapsibleSection";

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
  
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  // Initialize savings when supplier changes, but preserve existing values
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
    
    // Get current form values to preserve them
    const currentValues = control._formValues.savings || [];
    
    const newSavings = savings.map(saving => {
      // Find existing saving data if it exists
      const existingSaving = currentValues.find(s => s.saving_id === saving.id);
      
      if (existingSaving) {
        // If the saving already exists, preserve its values
        return existingSaving;
      }
      
      // Otherwise create a new entry
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
  }, [supplierId, savings, replace, quoteRequest.formats, control._formValues.savings]);

  const handleOpenChange = (index: number, isOpen: boolean) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: isOpen
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
  const sortedPriceBreaks = allPriceBreaks.sort((a, b) => a.quantity - b.quantity);
  
  return (
    <CollapsibleSection
      title="Savings"
      isEmpty={fields.length === 0}
      emptyMessage="No savings were requested for this quote request."
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-md font-medium">
            Unit Savings <span className="text-muted-foreground">({currencySymbol})</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map((field, index) => {
            const saving = savings.find(s => s.id === field.saving_id);
            if (!saving) return null;
            
            return (
              <SavingItem 
                key={field.id}
                control={control}
                index={index}
                saving={saving}
                showMultiProducts={showMultiProducts}
                maxNumProducts={maxNumProducts}
                priceBreaks={sortedPriceBreaks}
                isOpen={!!openItems[index]}
                onOpenChange={handleOpenChange}
              />
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
