
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NonInventoryExtraCostsProps {
  nonInventoryCosts: QuoteRequest['extra_costs'];
  findFieldIndex: (extraCostId: string) => number;
  control: Control<SupplierQuoteFormValues>;
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function NonInventoryExtraCosts({ 
  nonInventoryCosts, 
  findFieldIndex, 
  control,
  form
}: NonInventoryExtraCostsProps) {
  return (
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
  );
}
