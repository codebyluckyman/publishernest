
import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";

interface ExtraCostsSectionProps {
  extraCostsData: any[];
}

export function ExtraCostsSection({ extraCostsData }: ExtraCostsSectionProps) {
  const { control, setValue, watch } = useFormContext<SupplierQuoteFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  const { unitOfMeasures } = useUnitOfMeasures();
  const extraCosts = watch("extra_costs") || [];
  
  // Debug output
  console.log("Rendering ExtraCostsSection with fields:", fields);
  console.log("Current extra costs data:", extraCosts);

  const handleCostChange = (index: number, field: string, value: number | null) => {
    if (value === null || isNaN(Number(value))) {
      setValue(`extra_costs.${index}.${field}`, null);
    } else {
      setValue(`extra_costs.${index}.${field}`, Number(value));
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Extra Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No extra costs available for this quote request
          </div>
        ) : (
          fields.map((field, index) => {
            const extraCost = extraCostsData.find(ec => ec.id === field.extra_cost_id);
            const unitOfMeasure = unitOfMeasures.find(u => u.id === field.unit_of_measure_id);
            const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
            
            return (
              <div key={field.id} className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{extraCost?.name || "Unknown Extra Cost"}</h3>
                    {extraCost?.description && (
                      <p className="text-sm text-gray-500">{extraCost.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {unitOfMeasure?.name} {unitOfMeasure?.abbreviation ? `(${unitOfMeasure.abbreviation})` : ""}
                  </div>
                </div>
                
                {isInventoryUnit ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor={`extra-cost-${index}-cost`}>Base Cost</Label>
                      <Input
                        id={`extra-cost-${index}-cost`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(extraCosts[index]?.unit_cost)}
                        onChange={(e) => handleCostChange(index, "unit_cost", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`extra-cost-${index}-cost-1`}>Tier 1</Label>
                      <Input
                        id={`extra-cost-${index}-cost-1`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(extraCosts[index]?.unit_cost_1)}
                        onChange={(e) => handleCostChange(index, "unit_cost_1", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`extra-cost-${index}-cost-2`}>Tier 2</Label>
                      <Input
                        id={`extra-cost-${index}-cost-2`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(extraCosts[index]?.unit_cost_2)}
                        onChange={(e) => handleCostChange(index, "unit_cost_2", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`extra-cost-${index}-cost-3`}>Tier 3</Label>
                      <Input
                        id={`extra-cost-${index}-cost-3`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(extraCosts[index]?.unit_cost_3)}
                        onChange={(e) => handleCostChange(index, "unit_cost_3", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`extra-cost-${index}-cost-4`}>Tier 4</Label>
                      <Input
                        id={`extra-cost-${index}-cost-4`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(extraCosts[index]?.unit_cost_4)}
                        onChange={(e) => handleCostChange(index, "unit_cost_4", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    {/* Add more tiers as needed */}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={`extra-cost-${index}-cost`}>Cost Value</Label>
                    <Input
                      id={`extra-cost-${index}-cost`}
                      type="number"
                      step="0.01"
                      value={formatCurrency(extraCosts[index]?.unit_cost)}
                      onChange={(e) => handleCostChange(index, "unit_cost", e.target.valueAsNumber)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
