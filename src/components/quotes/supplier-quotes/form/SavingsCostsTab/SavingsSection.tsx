
import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SavingsSectionProps {
  savingsData: any[];
}

export function SavingsSection({ savingsData }: SavingsSectionProps) {
  const { control, setValue, watch } = useFormContext<SupplierQuoteFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "savings"
  });
  
  const { unitOfMeasures } = useUnitOfMeasures();
  const savings = watch("savings") || [];
  
  // Debug output
  console.log("Rendering SavingsSection with fields:", fields);
  console.log("Current savings data:", savings);
  console.log("Form savings data:", savingsData);

  const handleCostChange = (index: number, field: string, value: number | null) => {
    // Use the proper type for accessing nested fields in react-hook-form
    const fieldPath = `savings.${index}.${field}` as any;
    
    if (value === null || isNaN(Number(value))) {
      setValue(fieldPath, null);
    } else {
      setValue(fieldPath, Number(value));
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return value.toString();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Savings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No savings available for this quote request
          </div>
        ) : (
          fields.map((field, index) => {
            const saving = savingsData.find(s => s.id === field.saving_id);
            const unitOfMeasure = unitOfMeasures.find(u => u.id === field.unit_of_measure_id);
            const isInventoryUnit = unitOfMeasure?.is_inventory_unit || false;
            
            return (
              <div key={field.id} className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{saving?.name || "Unknown Saving"}</h3>
                    {saving?.description && (
                      <p className="text-sm text-gray-500">{saving.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {unitOfMeasure?.name} {unitOfMeasure?.abbreviation ? `(${unitOfMeasure.abbreviation})` : ""}
                  </div>
                </div>
                
                {isInventoryUnit ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor={`saving-${index}-cost`}>Base Cost</Label>
                      <Input
                        id={`saving-${index}-cost`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(savings[index]?.unit_cost)}
                        onChange={(e) => handleCostChange(index, "unit_cost", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`saving-${index}-cost-1`}>Tier 1</Label>
                      <Input
                        id={`saving-${index}-cost-1`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(savings[index]?.unit_cost_1)}
                        onChange={(e) => handleCostChange(index, "unit_cost_1", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`saving-${index}-cost-2`}>Tier 2</Label>
                      <Input
                        id={`saving-${index}-cost-2`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(savings[index]?.unit_cost_2)}
                        onChange={(e) => handleCostChange(index, "unit_cost_2", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`saving-${index}-cost-3`}>Tier 3</Label>
                      <Input
                        id={`saving-${index}-cost-3`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(savings[index]?.unit_cost_3)}
                        onChange={(e) => handleCostChange(index, "unit_cost_3", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`saving-${index}-cost-4`}>Tier 4</Label>
                      <Input
                        id={`saving-${index}-cost-4`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(savings[index]?.unit_cost_4)}
                        onChange={(e) => handleCostChange(index, "unit_cost_4", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`saving-${index}-cost-5`}>Tier 5</Label>
                      <Input
                        id={`saving-${index}-cost-5`}
                        type="number"
                        step="0.01"
                        value={formatCurrency(savings[index]?.unit_cost_5)}
                        onChange={(e) => handleCostChange(index, "unit_cost_5", e.target.valueAsNumber)}
                        className="w-full"
                      />
                    </div>
                    {/* Add more tiers as needed */}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={`saving-${index}-cost`}>Saving Value</Label>
                    <Input
                      id={`saving-${index}-cost`}
                      type="number"
                      step="0.01"
                      value={formatCurrency(savings[index]?.unit_cost)}
                      onChange={(e) => handleCostChange(index, "unit_cost", e.target.valueAsNumber)}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Price break selection for inventory savings */}
                {isInventoryUnit && (
                  <div>
                    <Label htmlFor={`saving-${index}-price-break`}>Associated Price Break</Label>
                    <Select
                      value={savings[index]?.price_break_id || "null"} 
                      onValueChange={(value) => {
                        // Cast to any to avoid TypeScript errors
                        setValue(`savings.${index}.price_break_id` as any, value === "null" ? null : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select price break" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {/* Add price break options here from context/props */}
                      </SelectContent>
                    </Select>
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
