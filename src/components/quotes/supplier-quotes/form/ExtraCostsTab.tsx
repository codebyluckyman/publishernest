
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

  const getNumProductsForFormat = (formatId: string): number => {
    if (!quoteRequest.formats) return 1;
    
    const format = quoteRequest.formats.find(f => f.id === formatId);
    return format?.num_products || 1;
  };

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

  return (
    <div className="space-y-6">
      {Object.entries(groupedCosts).map(([unitName, costs]) => {
        if (costs.length === 0) return null;
        
        const hasInventoryUnits = costs.some(cost => {
          const unitOfMeasure = unitOfMeasures.find(
            (unit) => unit.id === cost.unit_of_measure_id
          );
          return unitOfMeasure?.is_inventory_unit;
        });
        
        console.log(`Unit group: ${unitName}, Has inventory units: ${hasInventoryUnits}`);
        
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
                  
                  if (!unitOfMeasure?.is_inventory_unit) return null;

                  const fieldIndex = fields.findIndex(field => field.extra_cost_id === extraCost.id);
                  if (fieldIndex === -1) return null;

                  console.log(`Extra cost field at index ${fieldIndex}:`, fields[fieldIndex]);

                  const formatId = quoteRequest.formats?.[0]?.id;
                  const format = quoteRequest.formats?.[0];
                  const numProducts = getNumProductsForFormat(formatId || '');

                  return (
                    <div key={extraCost.id} className="px-4 py-4 border-b">
                      <div className="mb-4">
                        <FormatSpecWrapper formatId={format?.format_id || null} />
                      </div>
                      
                      <h3 className="text-base font-medium mb-2">{extraCost.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {extraCost.description || 'No description'} ({unitOfMeasure?.name || 'Unknown unit'})
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {Array.from({ length: numProducts }, (_, index) => {
                          const fieldName = `extra_costs.${fieldIndex}.unit_cost_${index + 1}`;
                          
                          return (
                            <div key={index} className="space-y-2">
                              <label className="text-xs font-medium">Product {index + 1}</label>
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        }
        
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
                    const unit = unitOfMeasures.find(u => u.id === cost.unit_of_measure_id);
                    return !unit?.is_inventory_unit;
                  }).map((extraCost) => {
                    const fieldIndex = fields.findIndex(
                      (field) => field.extra_cost_id === extraCost.id
                    );
                    
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
        );
      })}
    </div>
  );
}
