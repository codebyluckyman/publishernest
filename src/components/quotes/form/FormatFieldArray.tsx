
import { useFieldArray, Control, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FormatField } from "./FormatField";
import { QuoteRequestFormValues } from "./schema";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface FormatFieldArrayProps {
  form: UseFormReturn<QuoteRequestFormValues>;
}

export function FormatFieldArray({ form }: FormatFieldArrayProps) {
  const { currentOrganization } = useOrganization();
  const { data: formats = [], isLoading: isFormatsLoading } = useFormatsForSelect(currentOrganization);
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "formats",
  });

  const addFormat = () => {
    append({
      format_id: "",
      notes: "",
      num_products: currentOrganization?.default_num_products || 1,
    });
  };

  // Update existing formats with the default num_products if they don't have one set
  useEffect(() => {
    if (currentOrganization?.default_num_products && fields.length > 0) {
      fields.forEach((field, index) => {
        if (!field.num_products) {
          form.setValue(`formats.${index}.num_products`, currentOrganization.default_num_products || 1);
        }
      });
    }
  }, [currentOrganization?.default_num_products, fields, form]);

  // Ensure formats is always a valid array
  const safeFormats = Array.isArray(formats) ? formats : [];

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

      {isFormatsLoading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {!isFormatsLoading && fields.length === 0 && (
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
              control={form.control} 
              index={index} 
              formats={safeFormats} 
              isFormatsLoading={isFormatsLoading}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
