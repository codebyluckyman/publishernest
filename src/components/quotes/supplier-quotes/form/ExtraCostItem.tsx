
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCost } from "@/types/extraCost";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PriceBreak } from "@/types/quoteRequest";

interface ExtraCostItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  extraCost: ExtraCost;
  showMultiProducts?: boolean;
  maxNumProducts?: number;
  priceBreaks?: (PriceBreak & { format_name?: string })[];
}

export function ExtraCostItem({ 
  control, 
  index, 
  extraCost,
  showMultiProducts = false,
  maxNumProducts = 1,
  priceBreaks = []
}: ExtraCostItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-4">
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
          
          <div className="md:col-span-8">
            {priceBreaks && priceBreaks.length > 0 ? (
              <div className="space-y-2">
                {/* Group by format name to avoid duplicate quantities */}
                {Array.from(new Set(priceBreaks.map(pb => pb.format_name))).map((formatName) => {
                  const formatBreaks = priceBreaks.filter(pb => pb.format_name === formatName);
                  return (
                    <div key={formatName} className="space-y-2">
                      {formatName && <p className="text-xs font-medium">{formatName}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {formatBreaks.map((priceBreak, pbIndex) => (
                          <div key={pbIndex} className="border rounded p-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              Quantity: {priceBreak.quantity.toLocaleString()}
                            </p>
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
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : showMultiProducts ? (
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
                name={`extra_costs.${index}.unit_cost`}
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
