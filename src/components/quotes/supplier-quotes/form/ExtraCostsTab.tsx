
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  // Group all extra costs by unit of measure
  const groupedCosts = quoteRequest.extra_costs.reduce((acc, extraCost) => {
    const unitOfMeasure = unitOfMeasures.find(
      (unit) => unit.id === extraCost.unit_of_measure_id
    );
    
    const unitName = unitOfMeasure?.name || 'Other';
    if (!acc[unitName]) {
      acc[unitName] = [];
    }
    
    acc[unitName].push(extraCost);
    return acc;
  }, {} as Record<string, typeof quoteRequest.extra_costs>);

  // Get number of products for price breaks
  const getNumProductsForFormat = (formatId: string): number => {
    if (!quoteRequest.formats) return 1;
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format?.num_products || 1;
  };

  return (
    <div className="space-y-6">
      {/* Render all unit of measure groups */}
      {Object.entries(groupedCosts).map(([unitName, costs]) => {
        if (costs.length === 0) return null;
        
        // Check if this group contains inventory units
        const hasInventoryUnits = costs.some(cost => {
          const unitOfMeasure = unitOfMeasures.find(
            (unit) => unit.id === cost.unit_of_measure_id
          );
          return unitOfMeasure?.is_inventory_unit;
        });
        
        // For debugging - log the unit name and if it has inventory units
        console.log(`Unit group: ${unitName}, Has inventory units: ${hasInventoryUnits}`);
        
        // If group has inventory units, render price break tables
        if (hasInventoryUnits) {
          return (
            <Card key={unitName} className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{unitName} Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-0">
                {costs.map((extraCost) => {
                  const unitOfMeasure = unitOfMeasures.find(
                    (unit) => unit.id === extraCost.unit_of_measure_id
                  );
                  
                  // Only render price break tables for inventory units
                  if (!unitOfMeasure?.is_inventory_unit) return null;

                  // Find matching field index
                  const fieldIndex = fields.findIndex(field => field.extra_cost_id === extraCost.id);
                  if (fieldIndex === -1) return null;

                  // Log the field data for debugging
                  console.log(`Extra cost field at index ${fieldIndex}:`, fields[fieldIndex]);

                  // Prepare price breaks using the first format's price breaks
                  const formatId = quoteRequest.formats?.[0]?.id;
                  const priceBreaks = quoteRequest.formats?.[0]?.price_breaks || [];
                  const numProducts = getNumProductsForFormat(formatId || '');
                  
                  // Create products array for the table based on numProducts
                  const products = Array.from({ length: numProducts }, (_, index) => ({
                    index,
                    heading: `Product ${index + 1}`
                  }));

                  console.log(`Creating price break table for ${extraCost.name} with ${priceBreaks.length} price breaks and ${numProducts} products`);

                  return (
                    <div key={extraCost.id} className="pb-4">
                      <PriceBreakTable
                        formatName={extraCost.name}
                        formatDescription={`${extraCost.description || ''} (${unitOfMeasure?.name || 'Unknown unit'})`}
                        priceBreaks={priceBreaks.map(pb => ({
                          ...pb,
                          id: pb.id || '', 
                          price_break_id: pb.id || ''
                        }))}
                        products={products}
                        control={control}
                        fieldArrayName={`extra_costs.${fieldIndex}`}
                        className="mb-2"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        }
        
        // For non-inventory units, render regular table
        return (
          <Card key={unitName} className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{unitName} Costs</CardTitle>
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
                  {costs.filter(cost => {
                    // Only show non-inventory units in this table
                    const unit = unitOfMeasures.find(u => u.id === cost.unit_of_measure_id);
                    return !unit?.is_inventory_unit;
                  }).map((extraCost) => {
                    // Find the index in the form fields
                    const fieldIndex = fields.findIndex(
                      (field) => field.extra_cost_id === extraCost.id
                    );
                    
                    if (fieldIndex === -1) return null;
                    
                    // Set the unit_of_measure_id in the form if it's not already set
                    if (extraCost.unit_of_measure_id && !form.getValues(`extra_costs.${fieldIndex}.unit_of_measure_id`)) {
                      form.setValue(`extra_costs.${fieldIndex}.unit_of_measure_id`, extraCost.unit_of_measure_id);
                    }
                    
                    return (
                      <TableRow key={extraCost.id}>
                        <TableCell>{extraCost.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {extraCost.description || 'No description'}
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <FormField
                            control={control}
                            name={`extra_costs.${fieldIndex}.unit_cost`}
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
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                />
                              </div>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`extra_costs.${fieldIndex}.unit_of_measure_id`}
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
        );
      })}
    </div>
  );
}
