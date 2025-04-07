
import { Control } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ExtraCostsTabProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
}

export function ExtraCostsTab({ control, quoteRequest }: ExtraCostsTabProps) {
  const [activeTab, setActiveTab] = useState("extra-costs");
  
  const hasExtraCosts = quoteRequest.extra_costs && quoteRequest.extra_costs.length > 0;
  const hasSavings = quoteRequest.savings && quoteRequest.savings.length > 0;
  
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
                    </tr>
                  </thead>
                  <tbody>
                    {quoteRequest.extra_costs.map((cost, index) => (
                      <tr key={cost.id || index} className="border-b">
                        <td className="py-2 px-4 text-sm">{cost.name}</td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">{cost.description || '-'}</td>
                        <td className="py-2 px-4 text-sm text-right">{cost.unit_of_measure_name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="border rounded-md p-4 mt-4">
                  <p className="text-sm">
                    Extra costs pricing component would be implemented here based on specific requirements
                  </p>
                </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {quoteRequest.savings.map((saving, index) => (
                      <tr key={saving.id || index} className="border-b">
                        <td className="py-2 px-4 text-sm">{saving.name}</td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">{saving.description || '-'}</td>
                        <td className="py-2 px-4 text-sm text-right">{saving.unit_of_measure_name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="border rounded-md p-4 mt-4">
                  <p className="text-sm">
                    Savings pricing component would be implemented here based on specific requirements
                  </p>
                </div>
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
