
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { DefaultExtraCost } from "@/types/extraCost";
import { useOrganization } from "@/hooks/useOrganization";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function ExtraCostsField() {
  const { currentOrganization } = useOrganization();
  const { control, setValue } = useFormContext<QuoteRequestFormValues>();
  const [defaultCostsAdded, setDefaultCostsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extra_costs",
  });

  const handleAddCost = () => {
    append({ name: "" });
  };

  // Add default extra costs from organization settings if available
  useEffect(() => {
    if (
      !defaultCostsAdded && 
      currentOrganization?.default_extra_costs && 
      currentOrganization.default_extra_costs.length > 0 &&
      (!fields || fields.length === 0)
    ) {
      const defaultCosts = currentOrganization.default_extra_costs.map(
        (cost: DefaultExtraCost) => ({
          name: cost.name,
          description: cost.description || "",
          unit_of_measure: cost.unit_of_measure || "",
        })
      );
      
      setValue("extra_costs", defaultCosts);
      setDefaultCostsAdded(true);
    }
  }, [currentOrganization, fields, setValue, defaultCostsAdded]);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Extra Costs</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-3">
              {fields.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground text-sm">
                    No extra costs added yet. 
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <Input
                          placeholder="Cost name"
                          {...control.register(`extra_costs.${index}.name` as const)}
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-5">
                        <Textarea
                          placeholder="Description (optional)"
                          {...control.register(`extra_costs.${index}.description` as const)}
                          className="w-full h-10 min-h-10 resize-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Unit of measure"
                          {...control.register(`extra_costs.${index}.unit_of_measure` as const)}
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          type="button"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={handleAddCost}
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Extra Cost
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
