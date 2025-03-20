
import { useFieldArray, Control, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";
import { DefaultSaving } from "@/types/saving";

interface SavingsListProps {
  control: Control<QuoteRequestFormValues>;
  savings?: DefaultSaving[]; // Add this prop to trigger re-renders
}

export function SavingsList({ control, savings }: SavingsListProps) {
  const { setValue, watch } = useFormContext<QuoteRequestFormValues>();
  const {
    fields,
    remove
  } = useFieldArray({
    control,
    name: "savings"
  });
  
  // For debugging - log fields array when it changes
  console.log("SavingsList rendering with fields:", fields);
  console.log("Current form value for savings:", watch("savings"));

  // If there are no fields to display, show a placeholder message
  if (fields.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-muted-foreground text-sm">
          No savings added yet. 
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        console.log(`Rendering field at index ${index}:`, field);
        return (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-4">
              <Input 
                placeholder="Saving name" 
                {...control.register(`savings.${index}.name` as const)} 
                className="w-full" 
                onChange={(e) => {
                  // Update the field value and log the change
                  setValue(`savings.${index}.name` as const, e.target.value);
                  console.log(`Updated name for saving at index ${index}:`, e.target.value);
                }}
              />
            </div>
            <div className="col-span-5">
              <Textarea 
                placeholder="Description (optional)" 
                {...control.register(`savings.${index}.description` as const)} 
                className="w-full h-10 min-h-10 resize-none" 
                onChange={(e) => {
                  // Update the field value and log the change
                  setValue(`savings.${index}.description` as const, e.target.value);
                  console.log(`Updated description for saving at index ${index}:`, e.target.value);
                }}
              />
            </div>
            <div className="col-span-2">
              <UnitOfMeasureSelect
                value={watch(`savings.${index}.unit_of_measure_id`) || ''}
                onChange={(value) => {
                  setValue(`savings.${index}.unit_of_measure_id` as const, value);
                  console.log(`Updated unit of measure for saving at index ${index}:`, value);
                }}
                placeholder="Unit"
                className="w-full"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  console.log(`Removing saving at index ${index}`);
                  remove(index);
                  console.log("Fields after removal:", fields.filter((_, i) => i !== index));
                }} 
                type="button" 
                className="text-destructive"
                data-testid={`remove-saving-${index}`}
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
