
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteExtraCost } from "@/types/supplierQuote";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormatSpecifications } from "@/components/quotes/form/FormatSpecifications";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const { unitOfMeasures } = useUnitOfMeasures();
  const form = useFormContext<SupplierQuoteFormValues>();
  const [extraCosts, setExtraCosts] = useState<SupplierQuoteExtraCost[]>([]);
  
  const { fields, append } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  useEffect(() => {
    if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0 || fields.length > 0) {
      return;
    }
    
    quoteRequest.extra_costs.forEach(extraCost => {
      const unitOfMeasure = unitOfMeasures.find(
        unit => unit.id === extraCost.unit_of_measure_id
      );
      
      const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
      
      if (isInventoryUnit) {
        append({
          extra_cost_id: extraCost.id,
          unit_cost: null,
          unit_cost_1: null,
          unit_cost_2: null,
          unit_cost_3: null,
          unit_cost_4: null,
          unit_cost_5: null,
          unit_cost_6: null,
          unit_cost_7: null,
          unit_cost_8: null,
          unit_cost_9: null,
          unit_cost_10: null,
          unit_of_measure_id: extraCost.unit_of_measure_id
        });
      } else {
        append({
          extra_cost_id: extraCost.id,
          unit_cost: null,
          unit_of_measure_id: extraCost.unit_of_measure_id
        });
      }
    });
  }, [quoteRequest.extra_costs, append, fields.length, unitOfMeasures]);

  if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No Extra Costs</h3>
        <p className="text-muted-foreground mt-2">
          This quote request does not have any extra costs defined.
        </p>
      </div>
    );
  }

  // Group costs by unit of measure type (inventory vs non-inventory)
  const inventoryCosts: typeof quoteRequest.extra_costs = [];
  const nonInventoryCosts: typeof quoteRequest.extra_costs = [];
  
  quoteRequest.extra_costs.forEach(cost => {
    const unitOfMeasure = unitOfMeasures.find(unit => unit.id === cost.unit_of_measure_id);
    if (unitOfMeasure?.is_inventory_unit) {
      inventoryCosts.push(cost);
    } else {
      nonInventoryCosts.push(cost);
    }
  });

  // Helper function to get the number of products for a format
  const getNumProductsForFormat = (formatId: string): number => {
    if (!quoteRequest.formats) return 1;
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format?.num_products || 1;
  };

  // Group formats with their price breaks
  const formatPriceBreaks: Record<string, any[]> = {};
  if (quoteRequest.formats) {
    quoteRequest.formats.forEach(format => {
      if (format.price_breaks && format.price_breaks.length > 0) {
        formatPriceBreaks[format.id] = format.price_breaks;
      }
    });
  }

  // Component for format specifications
  const FormatSpecWrapper = ({ formatId }: { formatId: string | null }) => {
    const { data: formatDetails, isLoading } = useFormatDetails(formatId);
    
    return (
      <FormatSpecifications 
        format={formatDetails || null} 
        isLoading={isLoading}
        hide={true}
      />
    );
  };

  // Create helper to find the field index
  const findFieldIndex = (extraCostId: string) => {
    return fields.findIndex(field => field.extra_cost_id === extraCostId);
  };

  return (
    <div className="space-y-6">
      {/* Inventory Costs with Price Breaks */}
      {inventoryCosts.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inventory Costs</CardTitle>
            <CardDescription>
              Enter costs per quantity break for inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {Object.keys(formatPriceBreaks).map(formatId => {
              const format = quoteRequest.formats?.find(f => f.id === formatId);
              const formatName = format?.format_name || "Unknown Format";
              const numProducts = getNumProductsForFormat(formatId);
              const priceBreaks = formatPriceBreaks[formatId];
              
              // Create products array for the price break table
              const products = Array.from({ length: numProducts }, (_, index) => ({
                index,
                heading: `Product ${index + 1}`
              }));
              
              return (
                <div key={formatId} className="mb-6 p-4 border-b">
                  <h3 className="text-base font-medium mb-2">{formatName}</h3>
                  <div className="mb-4">
                    <FormatSpecWrapper formatId={format?.format_id || null} />
                  </div>
                  
                  {inventoryCosts.map(extraCost => {
                    const fieldIndex = findFieldIndex(extraCost.id);
                    if (fieldIndex === -1) return null;
                    
                    // Create a custom set of price breaks for this extra cost
                    const extraCostPriceBreaks = priceBreaks.map(priceBreak => {
                      const fieldValues = form.getValues(`extra_costs.${fieldIndex}`);
                      return {
                        ...priceBreak,
                        ...fieldValues,
                        extra_cost_id: extraCost.id
                      };
                    });
                    
                    return (
                      <div key={extraCost.id} className="mb-4">
                        <h4 className="text-sm font-medium mb-2">{extraCost.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {extraCost.description || 'No description'}
                        </p>
                        
                        <PriceBreakTable
                          formatName={`${extraCost.name} Pricing`}
                          formatDescription={`Please supply costs for each quantity break`}
                          priceBreaks={extraCostPriceBreaks}
                          products={products}
                          control={control}
                          fieldArrayName="extra_costs"
                          className="mb-4"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Non-Inventory Costs */}
      {nonInventoryCosts.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Other Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonInventoryCosts.map((extraCost) => {
                  const fieldIndex = findFieldIndex(extraCost.id);
                  if (fieldIndex === -1) return null;
                  
                  if (extraCost.unit_of_measure_id && !form.getValues(`extra_costs.${fieldIndex}.unit_of_measure_id`)) {
                    form.setValue(`extra_costs.${fieldIndex}.unit_of_measure_id`, extraCost.unit_of_measure_id);
                  }
                  
                  const fieldName = `extra_costs.${fieldIndex}.unit_cost`;
                  const unitFieldName = `extra_costs.${fieldIndex}.unit_of_measure_id`;
                  
                  return (
                    <TableRow key={extraCost.id}>
                      <TableCell>{extraCost.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {extraCost.description || 'No description'}
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <FormField
                          control={control}
                          name={fieldName as any}
                          render={({ field }) => (
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500">{form.watch('currency')}</span>
                              </div>
                              <Input
                                placeholder="0.00"
                                className="pl-10"
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                value={field.value === null ? '' : field.value}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : null;
                                  field.onChange(value);
                                }}
                              />
                            </div>
                          )}
                        />
                        <FormField
                          control={control}
                          name={unitFieldName as any}
                          render={({ field }) => (
                            <input type="hidden" {...field} />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
