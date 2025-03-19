
import { useFieldArray, Control, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";

interface ExtraCostsListProps {
  control: Control<QuoteRequestFormValues>;
}

export function ExtraCostsList({ control }: ExtraCostsListProps) {
  const {
    fields,
    remove
  } = useFieldArray({
    control,
    name: "extra_costs"
  });

  if (fields.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-muted-foreground text-sm">
          No extra costs added yet. 
        </p>
      </div>
    );
  }

  return (
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
            <UnitOfMeasureSelect
              value={useWatch({ control, name: `extra_costs.${index}.unit_of_measure_id` }) || ''}
              onChange={(value) => control.setValue(`extra_costs.${index}.unit_of_measure_id` as const, value)}
              placeholder="Unit"
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
  );
}
