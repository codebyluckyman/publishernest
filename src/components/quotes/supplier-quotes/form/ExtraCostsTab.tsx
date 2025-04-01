
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteExtraCost } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/PriceBreakTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/formatters";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const { unitOfMeasures } = useUnitOfMeasures();
  const form = useFormContext<SupplierQuoteFormValues>();
  const [extraCosts, setExtraCosts] = useState<SupplierQuoteExtraCost[]>([]);
  
  // Initialize extra costs field array if it doesn't exist
  const { fields, append } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  // Prepare extra costs on mount
  useEffect(() => {
    if (!quoteRequest.extra_costs || quoteRequest.extra_costs.length === 0 || fields.length > 0) {
      return;
    }
    
    // Initialize extra costs for the form
    quoteRequest.extra_costs.forEach(extraCost => {
      append({
        extra_cost_id: extraCost.id,
        unit_cost: null
      });
    });
  }, [quoteRequest.extra_costs, append, fields.length]);

  // If no extra costs, show empty state
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

  return (
    <div className="space-y-6">
      {quoteRequest.extra_costs.map((extraCost, index) => {
        // Find the unit of measure
        const unitOfMeasure = unitOfMeasures.find(
          (unit) => unit.id === extraCost.unit_of_measure_id
        );

        // Check if it's an inventory unit that needs price breaks
        if (unitOfMeasure?.is_inventory_unit) {
          // Prepare price breaks if they exist
          const priceBreaks = quoteRequest.formats?.[0]?.price_breaks || [];
          const products = [{ index: 0, heading: extraCost.name }];

          return (
            <PriceBreakTable
              key={extraCost.id}
              formatName={extraCost.name}
              formatDescription={`${extraCost.description || ''} (${unitOfMeasure.name})`}
              priceBreaks={priceBreaks}
              products={products}
              control={control}
              fieldArrayName="extra_costs_price_breaks"
              className="mb-2"
            />
          );
        }

        // For non-inventory units, show a card with unit cost input
        return (
          <Card key={extraCost.id} className="mb-2">
            <CardHeader>
              <CardTitle className="text-base">{extraCost.name}</CardTitle>
              {extraCost.description && (
                <CardDescription>{extraCost.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between">
                  <span>Unit of Measure:</span>
                  <span>{unitOfMeasure?.name || 'Not specified'}</span>
                </div>
                
                <FormField
                  control={control}
                  name={`extra_costs.${index}.unit_cost`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost</FormLabel>
                      <div className="flex items-center">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">{form.watch('currency')}</span>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="0.00"
                              className="pl-10"
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
