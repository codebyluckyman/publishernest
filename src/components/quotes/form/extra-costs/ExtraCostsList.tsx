
import { useFieldArray, Control, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { DefaultExtraCost } from "@/types/extraCost";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";

interface ExtraCostsListProps {
  control: Control<QuoteRequestFormValues>;
  extraCosts?: DefaultExtraCost[]; // Add this prop to trigger re-renders
  readOnly?: boolean;
}

export function ExtraCostsList({ control, extraCosts, readOnly = false }: ExtraCostsListProps) {
  const { setValue, watch } = useFormContext<QuoteRequestFormValues>();
  const { fields } = useFieldArray({
    control,
    name: "extra_costs"
  });
  
  // For debugging - log fields array when it changes
  console.log("ExtraCostsList rendering with fields:", fields);
  console.log("Current form value for extra_costs:", watch("extra_costs"));

  // If there are no fields to display, show a placeholder message
  if (fields.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-muted-foreground text-sm">
          No extra costs added.
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
                placeholder="Cost name" 
                {...control.register(`extra_costs.${index}.name` as const)} 
                className="w-full"
                disabled={readOnly}
              />
            </div>
            <div className="col-span-5">
              <Textarea 
                placeholder="Description (optional)" 
                {...control.register(`extra_costs.${index}.description` as const)} 
                className="w-full h-10 min-h-10 resize-none"
                disabled={readOnly}
              />
            </div>
            <div className="col-span-3">
              <UnitOfMeasureSelect
                value={watch(`extra_costs.${index}.unit_of_measure_id`) || ''}
                onChange={(value) => {
                  setValue(`extra_costs.${index}.unit_of_measure_id` as const, value);
                  console.log(`Updated unit of measure for extra cost at index ${index}:`, value);
                }}
                placeholder="Unit"
                className="w-full"
                disabled={readOnly}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
