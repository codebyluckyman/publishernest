
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { SavingItem } from "./SavingItem";
import { SavingTableItem } from "@/types/saving";

interface SavingsSectionProps {
  control: Control<SupplierQuoteFormValues>;
  savings: SavingTableItem[];
  currency: string;
}

export function SavingsSection({ control, savings, currency }: SavingsSectionProps) {
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
    if (!savings || savings.length === 0 || !supplierId) {
      replace([]);
      return;
    }
    
    const newSavings = savings.map(saving => ({
      saving_id: saving.id || "",
      unit_cost: null,
      notes: ""
    }));
    
    replace(newSavings);
  }, [supplierId, savings, replace]);
  
  if (!savings || savings.length === 0) {
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
            const saving = savings.find(s => s.id === field.saving_id);
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
