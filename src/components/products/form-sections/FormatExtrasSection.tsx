
import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ProductFormValues } from "@/schemas/productSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Library } from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@/context/OrganizationContext";
import { ExtraCostLibraryDialog } from "@/components/quotes/form/extra-costs/ExtraCostLibraryDialog";
import { ExtraCostTableItem } from "@/types/extraCost";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";
import { FormatExtra } from "@/types/product";

interface FormatExtrasSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function FormatExtrasSection({ form, readOnly = false }: FormatExtrasSectionProps) {
  const { currentOrganization } = useOrganization();
  const [libraryOpen, setLibraryOpen] = useState(false);
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "format_extras_array"
  });

  const handleLibraryOpen = () => {
    setLibraryOpen(true);
  };

  const handleAddFromLibrary = (extraCost: ExtraCostTableItem) => {
    append({
      id: extraCost.id,
      name: extraCost.name,
      description: extraCost.description || "",
      unit_of_measure_id: extraCost.unit_of_measure_id || undefined
    });
    setLibraryOpen(false);
    toast.success(`Added "${extraCost.name}" to format extras`);
  };

  const handleAddFormatExtra = () => {
    append({ 
      name: "",
      description: "",
      unit_of_measure_id: undefined
    });
    toast.success("New format extra field added");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Format Extras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-md">
            <p className="text-muted-foreground text-sm">
              No format extras added yet. 
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name={`format_extras_array.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Extra name" 
                            {...field} 
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`format_extras_array.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Description (optional)" 
                            {...field} 
                            className="h-10 min-h-10 resize-none"
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`format_extras_array.${index}.unit_of_measure_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <UnitOfMeasureSelect
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Unit"
                            className="w-full"
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  {!readOnly && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)} 
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!readOnly && (
          <div className="flex space-x-2">
            <Button 
              variant="success"  
              size="sm" 
              onClick={handleAddFormatExtra} 
              className="w-full"
              disabled={readOnly}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Format Extra
            </Button>
            <ExtraCostLibraryDialog 
              open={libraryOpen} 
              onOpenChange={setLibraryOpen}
              onAddFromLibrary={handleAddFromLibrary}
              onOpen={handleLibraryOpen}
              organizationId={currentOrganization?.id}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="format_extra_comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format Extra Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe extra requirements or specifications"
                  className="min-h-20"
                  {...field}
                  value={field.value || ""}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                Use this field to provide specific details about your format extras.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
