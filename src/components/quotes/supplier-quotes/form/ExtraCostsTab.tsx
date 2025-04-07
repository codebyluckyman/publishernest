import { Control, useFormContext, useFieldArray } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteExtraCost } from "@/types/supplierQuote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const [activeTab, setActiveTab] = useState("extra-costs");
  const { getValues, watch } = useFormContext<SupplierQuoteFormValues>();
  
  // Set up field arrays for extra costs and savings
  const extraCostsFieldArray = useFieldArray({
    control,
    name: "extra_costs",
  });
  
  const hasExtraCosts = quoteRequest.extra_costs && quoteRequest.extra_costs.length > 0;
  const hasSavings = quoteRequest.savings && quoteRequest.savings.length > 0;
  
  const extraCosts = watch("extra_costs") || [];
  const currency = watch("currency") || "USD";
  const currencySymbol = getSymbolForCurrency(currency);
  
  // If there are no extra costs or savings, show a message
  if (!hasExtraCosts && !hasSavings) {
    return (
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-muted-foreground">No extra costs or savings defined for this quote request</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="extra-costs">
            {hasExtraCosts ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the unit costs for the extra costs specified in the quote request
                </p>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left text-sm font-medium">Item</th>
                      <th className="py-2 px-4 text-left text-sm font-medium">Description</th>
                      <th className="py-2 px-4 text-right text-sm font-medium">Unit of Measure</th>
                      <th className="py-2 px-4 text-right text-sm font-medium">Unit Cost {currency}{currencySymbol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraCosts.map((cost, index) => {
                      // Find the corresponding extra cost from the quote request to get name and description
                      const extraCostDetails = quoteRequest.extra_costs?.find(
                        ec => ec.id === cost.extra_cost_id
                      ) || { name: 'Unknown', description: '', unit_of_measure_name: '' };
                      
                      return (
                        <tr key={cost.extra_cost_id || index} className="border-b">
                          <td className="py-2 px-4 text-sm">{extraCostDetails.name}</td>
                          <td className="py-2 px-4 text-sm text-muted-foreground">{extraCostDetails.description || '-'}</td>
                          <td className="py-2 px-4 text-sm text-right">{extraCostDetails.unit_of_measure_name || '-'}</td>
                          <td className="py-2 px-4 text-sm text-right">
                            <FormField
                              control={control}
                              name={`extra_costs.${index}.unit_cost`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      value={field.value || ''}
                                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                      className="w-24 text-right"
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground py-2">No extra costs defined for this quote request</p>
            )}
          </TabsContent>
          
          <TabsContent value="savings">
            {hasSavings ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the savings details as specified in the quote request
                </p>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left text-sm font-medium">Item</th>
                      <th className="py-2 px-4 text-left text-sm font-medium">Description</th>
                      <th className="py-2 px-4 text-right text-sm font-medium">Unit of Measure</th>
                      <th className="py-2 px-4 text-right text-sm font-medium">Unit Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteRequest.savings?.map((saving, index) => (
                      <tr key={saving.id || index} className="border-b">
                        <td className="py-2 px-4 text-sm">{saving.name}</td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">{saving.description || '-'}</td>
                        <td className="py-2 px-4 text-sm text-right">{saving.unit_of_measure_name || '-'}</td>
                        <td className="py-2 px-4 text-sm text-right">
                          <Input
                            type="number"
                            step="0.01"
                            className="w-24 text-right"
                            placeholder="0.00"
                            disabled
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <p className="text-sm text-amber-500">
                  Note: Savings capture will be implemented in a future update
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground py-2">No savings defined for this quote request</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
