
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CostsAndSavingsTabsProps {
  extraCosts: Array<{
    id?: string;
    name: string;
    description?: string | null;
    unit_of_measure_name?: string | null;
  }>;
  savings: Array<{
    id?: string;
    name: string;
    description?: string | null;
    unit_of_measure_name?: string | null;
  }>;
}

export function CostsAndSavingsTabs({ extraCosts, savings }: CostsAndSavingsTabsProps) {
  const [activeTab, setActiveTab] = useState("extra-costs");
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const hasExtraCosts = extraCosts && extraCosts.length > 0;
  const hasSavings = savings && savings.length > 0;
  
  // If there are no extra costs or savings, don't render anything
  if (!hasExtraCosts && !hasSavings) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <div 
        className="flex justify-between items-center mb-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-md font-medium">Costs & Savings</h3>
        {isCollapsed ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      {!isCollapsed && (
        <Card>
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
      )}
    </div>
  );
}
