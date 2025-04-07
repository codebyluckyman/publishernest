
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierQuote } from "@/types/supplierQuote";

interface ExtraCostsViewProps {
  quote: SupplierQuote;
}

export function ExtraCostsView({ quote }: ExtraCostsViewProps) {
  const [activeTab, setActiveTab] = useState("extra-costs");
  
  // Get extra costs and savings from the quote request
  const extraCosts = quote.quote_request?.extra_costs || [];
  const savings = quote.quote_request?.savings || [];
  
  const hasExtraCosts = extraCosts.length > 0;
  const hasSavings = savings.length > 0;
  
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
                    <th className="py-2 px-4 font-medium text-sm text-right">Unit of Measure</th>
                  </tr>
                </thead>
                <tbody>
                  {extraCosts.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-2 px-4 text-sm">{item.name}</td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {item.description || '-'}
                      </td>
                      <td className="py-2 px-4 text-sm text-right">
                        {item.unit_of_measure_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No extra costs defined</p>
            )}
          </TabsContent>
          
          <TabsContent value="savings" className="p-0 m-0">
            {hasSavings ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-4 font-medium text-sm">Item</th>
                    <th className="py-2 px-4 font-medium text-sm">Description</th>
                    <th className="py-2 px-4 font-medium text-sm text-right">Unit of Measure</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-2 px-4 text-sm">{item.name}</td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {item.description || '-'}
                      </td>
                      <td className="py-2 px-4 text-sm text-right">
                        {item.unit_of_measure_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No savings defined</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
