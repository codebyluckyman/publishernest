
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { QuoteRequest } from "@/types/quoteRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { SavingItem } from "./SavingItem";

interface SavingsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function SavingsSection({ control, quoteRequest }: SavingsSectionProps) {
  const { fields, replace } = useFieldArray({
    control,
    name: "savings"
  });
  
  const supplierId = useWatch({
    control,
    name: "supplier_id"
  });
  
  // Initialize savings when supplier changes
  useEffect(() => {
    if (!quoteRequest.savings || quoteRequest.savings.length === 0 || !supplierId) {
      replace([]);
      return;
    }
    
    const newSavings = quoteRequest.savings.map(saving => ({
      saving_id: saving.id || "",
      unit_cost: null,
      notes: ""
    }));
    
    replace(newSavings);
  }, [supplierId, quoteRequest.savings, replace]);
  
  if (!quoteRequest.savings || quoteRequest.savings.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => {
            const saving = quoteRequest.savings?.find(s => s.id === field.saving_id);
            if (!saving) return null;
            
            return (
              <SavingItem 
                key={field.id}
                control={control}
                index={index}
                saving={saving}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
