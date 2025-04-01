
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

  // Group extra costs by unit of measure
  const groupedCosts = quoteRequest.extra_costs.reduce((acc, extraCost) => {
    const unitOfMeasure = unitOfMeasures.find(
      (unit) => unit.id === extraCost.unit_of_measure_id
    );
    
    // Skip inventory units, they are handled separately
    if (unitOfMeasure?.is_inventory_unit) {
      return acc;
    }
    
    const unitName = unitOfMeasure?.name || 'Other';
    if (!acc[unitName]) {
      acc[unitName] = [];
    }
    
    acc[unitName].push(extraCost);
    return acc;
  }, {} as Record<string, typeof quoteRequest.extra_costs>);

  // First render all price break tables (inventory units)
  const inventoryUnitCosts = quoteRequest.extra_costs.filter(extraCost => {
    const unitOfMeasure = unitOfMeasures.find(
      (unit) => unit.id === extraCost.unit_of_measure_id
    );
    return unitOfMeasure?.is_inventory_unit;
  });

  return (
    <div className="space-y-6">
      {/* First render inventory unit costs as price break tables */}
      {inventoryUnitCosts.map((extraCost) => {
        const unitOfMeasure = unitOfMeasures.find(
          (unit) => unit.id === extraCost.unit_of_measure_id
        );
        
        // Prepare price breaks if they exist
        const priceBreaks = quoteRequest.formats?.[0]?.price_breaks || [];
        const products = [{ index: 0, heading: extraCost.name }];

        return (
          <PriceBreakTable
            key={extraCost.id}
            formatName={extraCost.name}
            formatDescription={`${extraCost.description || ''} (${unitOfMeasure?.name || 'Unknown unit'})`}
            priceBreaks={priceBreaks}
            products={products}
            control={control}
            fieldArrayName="extra_costs_price_breaks"
            className="mb-2"
          />
        );
      })}
      
      {/* Then render grouped non-inventory unit costs as tables */}
      {Object.entries(groupedCosts).map(([unitName, costs]) => {
        if (costs.length === 0) return null;
        
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
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.map((extraCost, costIndex) => {
                    // Find the index in the form fields
                    const fieldIndex = fields.findIndex(
                      (field) => field.extra_cost_id === extraCost.id
                    );
                    
                    if (fieldIndex === -1) return null;
                    
                    const unitOfMeasure = unitOfMeasures.find(
                      (unit) => unit.id === extraCost.unit_of_measure_id
                    );
                    
                    return (
                      <TableRow key={extraCost.id}>
                        <TableCell>{extraCost.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {extraCost.description || 'No description'}
                        </TableCell>
                        <TableCell>{unitOfMeasure?.name || 'N/A'}</TableCell>
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
