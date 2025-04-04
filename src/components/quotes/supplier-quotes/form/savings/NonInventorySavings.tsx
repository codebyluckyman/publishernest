
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSavingsManagement } from "@/hooks/useSavingsManagement";

interface NonInventorySavingsProps {
  nonInventorySavings: QuoteRequest['savings'];
  findFieldIndex: (savingId: string) => number;
  control: Control<SupplierQuoteFormValues>;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function NonInventorySavings({ 
  nonInventorySavings, 
  findFieldIndex, 
  control,
  form
}: NonInventorySavingsProps) {
  if (!nonInventorySavings || nonInventorySavings.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Non-Inventory Savings</CardTitle>
        <CardDescription>
          Enter fixed savings for non-inventory items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {nonInventorySavings.map(saving => {
            const fieldIndex = findFieldIndex(saving.id);
            if (fieldIndex === -1) return null;
            
            return (
              <div key={saving.id} className="space-y-2">
                <Label htmlFor={`saving-${saving.id}`}>{saving.name}</Label>
                <p className="text-xs text-muted-foreground">
                  {saving.description || 'No description'}
                </p>
                <Input 
                  id={`saving-${saving.id}`}
                  type="number"
                  placeholder="Enter amount"
                  step="0.01"
                  {...form.register(`savings.${fieldIndex}.unit_cost`, {
                    valueAsNumber: true
                  })}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
