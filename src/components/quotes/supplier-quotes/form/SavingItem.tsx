
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Saving } from "@/types/saving";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface SavingItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  saving: Saving;
  showMultiProducts?: boolean;
  maxNumProducts?: number;
}

export function SavingItem({ 
  control, 
  index, 
  saving,
  showMultiProducts = false,
  maxNumProducts = 1
}: SavingItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-4">
            <div>
              <p className="text-sm font-medium">{saving.name}</p>
              {saving.description && (
                <p className="text-sm text-muted-foreground">{saving.description}</p>
              )}
              {saving.unit_of_measure_name && (
                <p className="text-xs text-muted-foreground">
                  Unit: {saving.unit_of_measure_name}
                </p>
              )}
              <div className="mt-2">
                <FormField
                  control={control}
                  name={`savings.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Notes"
                          className="min-h-[60px] text-sm resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-8">
            {showMultiProducts ? (
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((i) => (
                  <FormField
                    key={i}
                    control={control}
                    name={`savings.${index}.unit_cost_${i}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            className="h-7 text-xs px-1.5 w-full rounded-md border border-input bg-background"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : parseFloat(parseFloat(e.target.value).toFixed(3));
                              field.onChange(value);
                            }}
                            value={field.value === null ? "" : field.value.toFixed(3)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            ) : (
              <FormField
                control={control}
                name={`savings.${index}.unit_cost`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.000"
                        className="h-7 text-xs px-1.5 w-full rounded-md border border-input bg-background"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(parseFloat(e.target.value).toFixed(3));
                          field.onChange(value);
                        }}
                        value={field.value === null ? "" : field.value.toFixed(3)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
