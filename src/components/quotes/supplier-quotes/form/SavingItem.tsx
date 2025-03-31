
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Saving } from "@/types/saving";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PriceBreak } from "@/types/quoteRequest";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";

interface SavingItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  saving: Saving;
  showMultiProducts?: boolean;
  maxNumProducts?: number;
  priceBreaks?: (PriceBreak & { format_name?: string; format_id?: string })[];
}

export function SavingItem({ 
  control, 
  index, 
  saving,
  showMultiProducts = false,
  maxNumProducts = 1,
  priceBreaks = []
}: SavingItemProps) {
  // Set default collapsed state
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center">
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
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(!isOpen)}
              className="p-0 h-8 w-8"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent>
              <div className="space-y-4">
                {/* Add notes field */}
                <FormField
                  control={control}
                  name={`savings.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Notes (optional)"
                          className="h-20 resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {priceBreaks && priceBreaks.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by format name to avoid duplicate quantities */}
                    {Array.from(new Set(priceBreaks.map(pb => pb.format_name))).map((formatName) => {
                      const formatBreaks = priceBreaks.filter(pb => pb.format_name === formatName);
                      
                      return (
                        <div key={formatName} className="border rounded-md p-3">
                          {formatName && <p className="text-sm font-medium mb-2">{formatName}</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {formatBreaks.map((priceBreak, pbIndex) => {
                              // Find price break index in the savings.price_breaks array
                              const priceBreakFieldIndex = Array.isArray(control._formValues.savings[index]?.price_breaks) 
                                ? control._formValues.savings[index]?.price_breaks.findIndex(pb => pb.price_break_id === priceBreak.id)
                                : -1;
                              
                              if (priceBreakFieldIndex === -1) return null;
                                
                              return (
                                <div key={priceBreak.id} className="border rounded p-2">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Quantity: {priceBreak.quantity.toLocaleString()}
                                  </p>
                                  
                                  {showMultiProducts ? (
                                    <div className="grid grid-cols-10 gap-1 mt-2">
                                      {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((prodIndex) => (
                                        <FormField
                                          key={prodIndex}
                                          control={control}
                                          name={`savings.${index}.price_breaks.${priceBreakFieldIndex}.unit_cost_${prodIndex}` as any}
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
                                      name={`savings.${index}.price_breaks.${priceBreakFieldIndex}.unit_cost`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.001"
                                              min="0"
                                              placeholder="0.000"
                                              className="h-8 text-sm px-2 w-full rounded-md border border-input bg-background"
                                              {...field}
                                              onChange={(e) => {
                                                const value = e.target.value === "" ? null : parseFloat(parseFloat(e.target.value).toFixed(3));
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
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No price breaks available</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
