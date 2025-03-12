
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FormatField } from "./FormatField";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { z } from "zod";
import { quoteRequestFormSchema } from "./schema";

type FormValues = z.infer<typeof quoteRequestFormSchema>;

interface FormatFieldArrayProps {
  control: Control<FormValues>;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
}

export function FormatFieldArray({ control, formats, isFormatsLoading }: FormatFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "formats",
  });

  const addFormat = () => {
    append({
      format_id: "",
      quantity: 1,
      notes: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Formats</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addFormat}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Format
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            No formats added yet. Click 'Add Format' to include formats in this quote request.
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium">Format {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <FormatField 
              control={control} 
              index={index} 
              formats={formats} 
              isFormatsLoading={isFormatsLoading}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
