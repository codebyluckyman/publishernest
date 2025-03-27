
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCost } from "@/types/extraCost";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
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
        <div className="space-y-4">
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
          
          {showMultiProducts ? (
            <div className="space-y-3">
              {extraCost.description && <hr className="my-2" />}
              
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-1"></div>
                <div className="col-span-11">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
                    {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((i) => (
                      <div key={i} className="text-center">
                        <span className="text-xs font-medium text-muted-foreground">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-1 flex items-center">
                  <span className="text-xs font-medium text-muted-foreground">Cost</span>
                </div>
                <div className="col-span-11">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
                    {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((i) => (
                      <div key={i} className="space-y-0.5">
                        <FormField
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <FormField
              control={control}
              name={`extra_costs.${index}.unit_cost`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.000"
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
      </CardContent>
    </Card>
  );
}
