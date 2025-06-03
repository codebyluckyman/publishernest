
import { useFieldArray, Control, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { DefaultExtraCost } from "@/types/extraCost";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExtraCostsListProps {
  control: Control<QuoteRequestFormValues>;
  extraCosts?: DefaultExtraCost[]; // Add this prop to trigger re-renders
}

export function ExtraCostsList({ control, extraCosts }: ExtraCostsListProps) {
  const { setValue, watch } = useFormContext<QuoteRequestFormValues>();
  const { fields, remove } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  // For debugging - log fields array when it changes
  console.log("ExtraCostsList rendering with fields:", fields);
  console.log("Current form value for extra_costs:", watch("extra_costs"));

  const handleRemove = (index: number, costName: string) => {
    remove(index);
    toast.success(`"${costName}" removed from extra costs`);
  };

  // If there are no fields to display, show a placeholder message
  if (fields.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-muted-foreground text-sm">
          No extra costs added. Add from the library below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        console.log(`Rendering field at index ${index}:`, field);
        const costName = watch(`extra_costs.${index}.name`) || 'Unnamed Cost';
        
        return (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-3">
              <Input 
                placeholder="Cost name" 
                {...control.register(`extra_costs.${index}.name` as const)} 
                className="w-full"
              />
            </div>
            <div className="col-span-4">
              <Textarea 
                placeholder="Description (optional)" 
                {...control.register(`extra_costs.${index}.description` as const)} 
                className="w-full h-10 min-h-10 resize-none"
              />
            </div>
            <div className="col-span-4">
              <UnitOfMeasureSelect
                value={watch(`extra_costs.${index}.unit_of_measure_id`) || ''}
                onChange={(value) => {
                  setValue(`extra_costs.${index}.unit_of_measure_id` as const, value);
                  console.log(`Updated unit of measure for extra cost at index ${index}:`, value);
                }}
                placeholder="Unit"
                className="w-full"
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index, costName)}
                className="h-10 w-10 text-destructive hover:text-destructive"
                title={`Remove ${costName}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
