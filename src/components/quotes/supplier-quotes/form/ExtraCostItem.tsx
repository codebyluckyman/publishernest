
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCost } from "@/types/extraCost";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface ExtraCostItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  extraCost: ExtraCost;
}

export function ExtraCostItem({ control, index, extraCost }: ExtraCostItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">{extraCost.name}</p>
            {extraCost.description && (
              <p className="text-sm text-muted-foreground">{extraCost.description}</p>
            )}
            {extraCost.unit_of_measure_name && (
              <p className="text-xs text-muted-foreground">
                Unit: {extraCost.unit_of_measure_name}
              </p>
            )}
          </div>
          
          <FormField
            control={control}
            name={`extra_costs.${index}.unit_cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                    value={field.value === null ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name={`extra_costs.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notes about this extra cost..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
