
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCost } from "@/types/extraCost";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ExtraCostItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  extraCost: ExtraCost;
  showMultiProducts?: boolean;
  maxNumProducts?: number;
}

export function ExtraCostItem({ 
  control, 
  index, 
  extraCost,
  showMultiProducts = false,
  maxNumProducts = 1
}: ExtraCostItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4"> {/* Changed from col-span-6 to col-span-4 */}
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
          </div>
          
          <div className="col-span-8"> {/* Changed from col-span-6 to col-span-8 */}
            {showMultiProducts ? (
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((i) => (
                  <FormField
                    key={i}
                    control={control}
                    name={`extra_costs.${index}.unit_cost_${i}` as any}
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
                              const value = e.target.value === "" ? null : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value === null ? "" : field.value}
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
                name={`extra_costs.${index}.unit_cost`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.000"
                        className="h-8 text-sm w-full rounded-md border border-input bg-background"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === null ? "" : field.value}
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

