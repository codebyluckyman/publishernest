
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCostTableItem } from "@/types/extraCost";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PriceBreak } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExtraCostItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  extraCost: ExtraCostTableItem;
  showMultiProducts?: boolean;
  maxNumProducts?: number;
  priceBreaks?: (PriceBreak & { format_name?: string; format_id?: string })[];
  isOpen: boolean;
  onOpenChange: (costId: string, open: boolean) => void;
}

export function ExtraCostItem({ 
  control, 
  index, 
  extraCost,
  showMultiProducts = false,
  maxNumProducts = 1,
  priceBreaks = [],
  isOpen,
  onOpenChange
}: ExtraCostItemProps) {
  const { unitOfMeasures } = useUnitOfMeasures();
  const [isInventoryUnit, setIsInventoryUnit] = useState<boolean>(false);
  
  useEffect(() => {
    if (extraCost.unit_of_measure_id && unitOfMeasures) {
      const unitOfMeasure = unitOfMeasures.find(u => u.id === extraCost.unit_of_measure_id);
      setIsInventoryUnit(unitOfMeasure?.is_inventory_unit || false);
    } else {
      setIsInventoryUnit(false);
    }
  }, [extraCost.unit_of_measure_id, unitOfMeasures]);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{extraCost.name}</p>
              {extraCost.description && (
                <p className="text-sm text-muted-foreground">{extraCost.description}</p>
              )}
              {extraCost.unit_of_measure_name && (
                <p className="text-xs text-muted-foreground">
                  Unit: {extraCost.unit_of_measure_name} {isInventoryUnit ? "(Inventory Unit)" : "(Non-Inventory Unit)"}
                </p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(extraCost.id, !isOpen)}
              className="p-0 h-8 w-8"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          <Collapsible open={isOpen} onOpenChange={(open) => onOpenChange(extraCost.id, open)}>
            <CollapsibleContent>
              <div className="space-y-4">
                {priceBreaks && priceBreaks.length > 0 ? (
                  <div className="space-y-0">
                    {!isInventoryUnit && (
                      <div className="mb-3 p-3 border rounded-md">
                        <div className="flex items-center mb-2">
                          <p className="text-sm font-medium">Total Cost</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm max-w-xs">For non-inventory units, enter the total cost. The unit cost will be calculated automatically based on quantity.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormField
                          control={control}
                          name={`extra_costs.${index}.unit_cost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="w-full rounded-md border border-input bg-background"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? null : parseFloat(parseFloat(e.target.value).toFixed(2));
                                    field.onChange(value);
                                    
                                    // Auto-calculate unit costs for each price break
                                    if (value !== null) {
                                      const totalCost = value;
                                      control._formValues.extra_costs[index].price_breaks.forEach((pb, pbIndex) => {
                                        const priceBreak = priceBreaks.find(p => p.id === pb.price_break_id);
                                        if (priceBreak && priceBreak.quantity) {
                                          const unitCost = totalCost / priceBreak.quantity;
                                          control._formValues.extra_costs[index].price_breaks[pbIndex].unit_cost = parseFloat(unitCost.toFixed(3));
                                        }
                                      });
                                    }
                                  }}
                                  value={field.value === null ? "" : field.value}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {Array.from(new Set(priceBreaks.map(pb => pb.format_name))).map((formatName) => {
                      const formatBreaks = priceBreaks.filter(pb => pb.format_name === formatName);
                      
                      return (
                        <div key={formatName} className="border rounded-md p-3">
                          {formatName && <p className="text-sm font-medium mb-3">{formatName}</p>}
                          
                          {isInventoryUnit && showMultiProducts && (
                            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2 mb-3">
                              <div></div> {/* Empty cell for quantity column */}
                              {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((prodIndex) => (
                                <div key={prodIndex} className="flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">{prodIndex}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {formatBreaks.map((priceBreak, breakIndex) => {
                            const priceBreakFieldIndex = Array.isArray(control._formValues.extra_costs[index]?.price_breaks) 
                              ? control._formValues.extra_costs[index]?.price_breaks.findIndex(pb => pb.price_break_id === priceBreak.id)
                              : -1;
                            
                            if (priceBreakFieldIndex === -1) return null;
                              
                            return (
                              <div 
                                key={priceBreak.id} 
                                className={`py-2 ${breakIndex < formatBreaks.length - 1 ? 'border-b border-gray-200/50' : ''}`}
                              >
                                {isInventoryUnit ? (
                                  showMultiProducts ? (
                                    <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
                                      <div className="flex items-center">
                                        <span className="text-xs text-muted-foreground">{priceBreak.quantity.toLocaleString()}</span>
                                      </div>
                                      {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => i + 1).map((prodIndex) => (
                                        <div key={prodIndex}>
                                          <FormField
                                            control={control}
                                            name={`extra_costs.${index}.price_breaks.${priceBreakFieldIndex}.unit_cost_${prodIndex}` as any}
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
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex items-center">
                                        <span className="text-xs text-muted-foreground">{priceBreak.quantity.toLocaleString()}</span>
                                      </div>
                                      <FormField
                                        control={control}
                                        name={`extra_costs.${index}.price_breaks.${priceBreakFieldIndex}.unit_cost`}
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
                                    </div>
                                  )
                                ) : (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="flex items-center">
                                      <span className="text-xs text-muted-foreground">{priceBreak.quantity.toLocaleString()}</span>
                                    </div>
                                    <FormField
                                      control={control}
                                      name={`extra_costs.${index}.price_breaks.${priceBreakFieldIndex}.unit_cost`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.001"
                                              min="0"
                                              placeholder="0.000"
                                              className="h-7 text-xs px-1.5 w-full rounded-md border border-input bg-background bg-gray-100"
                                              readOnly
                                              {...field}
                                              value={field.value === null ? "" : field.value}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <div className="flex items-center">
                                      <span className="text-xs text-muted-foreground">= Total Cost ÷ {priceBreak.quantity.toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
