import { Control, useFormContext, useFieldArray } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues, SupplierQuoteExtraCost, SupplierQuoteSaving } from "@/types/supplierQuote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { getSymbolForCurrency } from "@/api/organizations/currencySymbols";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const [activeTab, setActiveTab] = useState("extra-costs");
  const { getValues, watch } = useFormContext<SupplierQuoteFormValues>();
  const { unitOfMeasures } = useUnitOfMeasures();
  
  const extraCostsFieldArray = useFieldArray({
    control,
    name: "extra_costs",
  });
  
  const savingsFieldArray = useFieldArray({
    control,
    name: "savings",
  });
  
  const hasExtraCosts = quoteRequest.extra_costs && quoteRequest.extra_costs.length > 0;
  const hasSavings = quoteRequest.savings && quoteRequest.savings.length > 0;
  
  const extraCosts = watch("extra_costs") || [];
  const savings = watch("savings") || [];
  const currency = watch("currency") || "USD";
  const currencySymbol = getSymbolForCurrency(currency);
  
  // Group savings by whether they use inventory units or not
  const inventorySavings = savings.filter(saving => {
    const savingDetails = quoteRequest.savings?.find(s => s.id === saving.saving_id);
    if (!savingDetails) return false;
    
    // Get the unit of measure from the unitOfMeasures array using the unit_of_measure_id
    const unitOfMeasure = unitOfMeasures.find(
      unit => unit.id === savingDetails.unit_of_measure_id
    );
    
    return unitOfMeasure?.is_inventory_unit;
  });
  
  const regularSavings = savings.filter(saving => {
    const savingDetails = quoteRequest.savings?.find(s => s.id === saving.saving_id);
    if (!savingDetails) return false;
    
    // Get the unit of measure from the unitOfMeasures array using the unit_of_measure_id
    const unitOfMeasure = unitOfMeasures.find(
      unit => unit.id === savingDetails.unit_of_measure_id
    );
    
    return !unitOfMeasure?.is_inventory_unit;
  });
  
  // Create a map of saving ID to index in the form array for easy lookup
  const savingIndexMap = savings.reduce((map, saving, index) => {
    map[saving.saving_id] = index;
    return map;
  }, {} as Record<string, number>);
  
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
                      const extraCostDetails = quoteRequest.extra_costs?.find(
                        ec => ec.id === cost.extra_cost_id
                      ) || { name: 'Unknown', description: '', unit_of_measure_name: '' };
                      
                      return (
                        <tr key={cost.extra_cost_id || index} className="border-b">
                          <td className="py-2 px-4 text-sm">{extraCostDetails.name}</td>
                          <td className="py-2 px-4 text-sm text-muted-foreground">{extraCostDetails.description || '-'}</td>
                          <td className="py-2 px-4 text-sm text-right">{extraCostDetails.unit_of_measure_name || '-'}</td>
                          <td className="py-2 px-4 text-sm text-right flex justify-end items-center">
                            <FormField
                              control={control}
                              name={`extra_costs.${index}.unit_cost`}
                              render={({ field }) => (
                                <FormItem className="w-24">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      value={field.value || ''}
                                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                      className="text-right"
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
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the savings details as specified in the quote request
                </p>
                
                {/* Regular (non-inventory) savings */}
                {regularSavings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Standard Savings</h3>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left text-sm font-medium">Item</th>
                          <th className="py-2 px-4 text-left text-sm font-medium">Description</th>
                          <th className="py-2 px-4 text-right text-sm font-medium">Unit of Measure</th>
                          <th className="py-2 px-4 text-right text-sm font-medium">Unit Value {currency}{currencySymbol}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regularSavings.map((saving) => {
                          const savingDetails = quoteRequest.savings?.find(
                            s => s.id === saving.saving_id
                          ) || { name: 'Unknown', description: '', unit_of_measure_name: '' };
                          
                          const index = savingIndexMap[saving.saving_id];
                          
                          return (
                            <tr key={saving.saving_id || index} className="border-b">
                              <td className="py-2 px-4 text-sm">{savingDetails.name}</td>
                              <td className="py-2 px-4 text-sm text-muted-foreground">{savingDetails.description || '-'}</td>
                              <td className="py-2 px-4 text-sm text-right">{savingDetails.unit_of_measure_name || '-'}</td>
                              <td className="py-2 px-4 text-sm text-right flex justify-end items-center">
                                <FormField
                                  control={control}
                                  name={`savings.${index}.unit_cost`}
                                  render={({ field }) => (
                                    <FormItem className="w-24">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          step="0.01"
                                          value={field.value || ''}
                                          onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                          className="text-right"
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
                )}
                
                {/* Inventory-based savings with price breaks */}
                {inventorySavings.length > 0 && inventorySavings.map((saving) => {
                  const savingDetails = quoteRequest.savings?.find(
                    s => s.id === saving.saving_id
                  ) || { name: 'Unknown', description: '', unit_of_measure_name: '' };
                  
                  const index = savingIndexMap[saving.saving_id];
                  
                  // For each format in the quote request, show price break tables for this saving
                  return quoteRequest.formats?.map((format) => {
                    // Get price breaks for this format
                    const priceBreaks = format.price_breaks || [];
                    
                    // Create the products array for the price break table - use the number of products from the format
                    const numProducts = format.num_products || 1;
                    const products = Array.from({ length: numProducts }, (_, productIndex) => ({
                      index: productIndex,
                      heading: `Product ${productIndex + 1}`
                    }));
                    
                    // Map the price breaks to the structure expected by PriceBreakTable
                    const mappedPriceBreaks = priceBreaks.map((pb) => {
                      return {
                        id: pb.id,
                        price_break_id: pb.id,
                        quantity: pb.quantity,
                        unit_cost_1: saving[`unit_cost_1`] || null,
                        unit_cost_2: saving[`unit_cost_2`] || null,
                        unit_cost_3: saving[`unit_cost_3`] || null,
                        unit_cost_4: saving[`unit_cost_4`] || null,
                        unit_cost_5: saving[`unit_cost_5`] || null,
                        unit_cost_6: saving[`unit_cost_6`] || null,
                        unit_cost_7: saving[`unit_cost_7`] || null,
                        unit_cost_8: saving[`unit_cost_8`] || null,
                        unit_cost_9: saving[`unit_cost_9`] || null,
                        unit_cost_10: saving[`unit_cost_10`] || null,
                      };
                    });
                    
                    return (
                      <div className="mb-6" key={`${saving.saving_id}-${format.id}`}>
                        <h3 className="text-sm font-medium mb-2">
                          {savingDetails.name} - {format.format_name} 
                          <span className="text-muted-foreground ml-2">({savingDetails.unit_of_measure_name})</span>
                        </h3>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {savingDetails.description || "Enter savings values by quantity and product"}
                        </p>
                        
                        <PriceBreakTable
                          formatName={`${savingDetails.name} Savings`}
                          formatDescription={savingDetails.description}
                          priceBreaks={mappedPriceBreaks}
                          products={products}
                          isReadOnly={false}
                          currency={currency}
                          control={control}
                          fieldArrayName={`savings.${index}`}
                          className="mt-2"
                        />
                      </div>
                    );
                  });
                })}
                
                {inventorySavings.length === 0 && regularSavings.length === 0 && (
                  <p className="text-muted-foreground py-2">No savings defined for this quote request</p>
                )}
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
