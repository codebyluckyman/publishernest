
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierQuote } from "@/types/supplierQuote";
import { PriceBreakTable } from "@/components/quotes/shared/price-break";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";

interface ExtraCostsViewProps {
  quote: SupplierQuote;
}

export function ExtraCostsView({ quote }: ExtraCostsViewProps) {
  const [activeTab, setActiveTab] = useState("extra-costs");
  const { unitOfMeasures } = useUnitOfMeasures();
  
  // Get extra costs and savings from the quote request
  const extraCosts = quote.quote_request?.extra_costs || [];
  const savings = quote.quote_request?.savings || [];
  
  // Get submitted extra costs and savings from the supplier quote
  const submittedExtraCosts = quote.extra_costs || [];
  const submittedSavings = quote.savings || [];
  
  const hasExtraCosts = extraCosts.length > 0;
  const hasSavings = savings.length > 0;
  
  // Group savings by whether they use inventory units or not
  const inventorySavings = savings.filter(item => {
    // Find the unit of measure using unit_of_measure_id
    const unitOfMeasure = item.unit_of_measures || unitOfMeasures.find(
      unit => unit.id === item.unit_of_measure_id
    );
    
    return unitOfMeasure?.is_inventory_unit;
  });
  
  const regularSavings = savings.filter(item => {
    // Find the unit of measure using unit_of_measure_id
    const unitOfMeasure = item.unit_of_measures || unitOfMeasures.find(
      unit => unit.id === item.unit_of_measure_id
    );
    
    return !unitOfMeasure?.is_inventory_unit;
  });
  
  if (!hasExtraCosts && !hasSavings) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 pb-4">
          <p className="text-center text-muted-foreground">No extra costs or savings defined for this quote request.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full rounded-t-md rounded-b-none">
            <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="extra-costs" className="p-0 m-0">
            {hasExtraCosts ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-4 font-medium text-sm">Item</th>
                    <th className="py-2 px-4 font-medium text-sm">Description</th>
                    <th className="py-2 px-4 font-medium text-sm">Unit of Measure</th>
                    <th className="py-2 px-4 font-medium text-sm text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {extraCosts.map((item, index) => {
                    // Find if there's a corresponding cost submission
                    const submittedCost = submittedExtraCosts.find(
                      c => c.extra_cost_id === item.id
                    );
                    
                    return (
                      <tr key={item.id || index} className="border-b">
                        <td className="py-2 px-4 text-sm">{item.name}</td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">
                          {item.description || '-'}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {item.unit_of_measures?.name || '-'}
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {submittedCost && submittedCost.unit_cost !== null 
                            ? `${quote.currency} ${submittedCost.unit_cost.toFixed(2)}` 
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No extra costs defined</p>
            )}
          </TabsContent>
          
          <TabsContent value="savings" className="p-0 m-0">
            {hasSavings ? (
              <div className="p-4 space-y-6">
                {/* Regular savings display */}
                {regularSavings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Standard Savings</h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 px-4 font-medium text-sm">Item</th>
                          <th className="py-2 px-4 font-medium text-sm">Description</th>
                          <th className="py-2 px-4 font-medium text-sm">Unit of Measure</th>
                          <th className="py-2 px-4 font-medium text-sm text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regularSavings.map((item, index) => {
                          // Find if there's a corresponding saving submission
                          const submittedSaving = submittedSavings.find(
                            s => s.saving_id === item.id
                          );
                          
                          return (
                            <tr key={item.id || index} className="border-b">
                              <td className="py-2 px-4 text-sm">{item.name}</td>
                              <td className="py-2 px-4 text-sm text-muted-foreground">
                                {item.description || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm">
                                {item.unit_of_measures?.name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-right">
                                {submittedSaving && submittedSaving.unit_cost !== null 
                                  ? `${quote.currency} ${submittedSaving.unit_cost.toFixed(2)}` 
                                  : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Inventory-based savings with price breaks */}
                {inventorySavings.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium mb-2">Inventory-based Savings by Price Break</h3>
                    
                    {inventorySavings.map(savingItem => {
                      // Find the corresponding submitted saving
                      const submittedSaving = submittedSavings.find(
                        s => s.saving_id === savingItem.id
                      );
                      
                      if (!submittedSaving) return null;
                      
                      // For each format in the quote request, display a price break table for this saving
                      return quote.quote_request?.formats?.map(format => {
                        // Get price breaks for this format
                        const priceBreaks = format.price_breaks || [];
                        
                        if (priceBreaks.length === 0) return null;
                        
                        // Create products array for the PriceBreakTable
                        const numProducts = format.num_products || 1;
                        const products = Array.from({ length: numProducts }, (_, idx) => ({
                          index: idx,
                          heading: `Product ${idx + 1}`
                        }));
                        
                        // Map price breaks to the format expected by PriceBreakTable
                        const mappedPriceBreaks = priceBreaks.map(pb => {
                          return {
                            id: pb.id,
                            price_break_id: pb.id,
                            quantity: pb.quantity,
                            unit_cost_1: submittedSaving.unit_cost_1,
                            unit_cost_2: submittedSaving.unit_cost_2,
                            unit_cost_3: submittedSaving.unit_cost_3,
                            unit_cost_4: submittedSaving.unit_cost_4,
                            unit_cost_5: submittedSaving.unit_cost_5,
                            unit_cost_6: submittedSaving.unit_cost_6,
                            unit_cost_7: submittedSaving.unit_cost_7,
                            unit_cost_8: submittedSaving.unit_cost_8,
                            unit_cost_9: submittedSaving.unit_cost_9,
                            unit_cost_10: submittedSaving.unit_cost_10,
                          };
                        });
                        
                        return (
                          <div key={`${savingItem.id}-${format.id}`} className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              {savingItem.name} - {format.formats?.format_name}
                            </h4>
                            <PriceBreakTable
                              formatName={`${savingItem.name}`}
                              formatDescription={savingItem.description}
                              priceBreaks={mappedPriceBreaks}
                              products={products}
                              isReadOnly={true}
                              currency={quote.currency}
                              className="mt-2"
                            />
                          </div>
                        );
                      });
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No savings defined</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
