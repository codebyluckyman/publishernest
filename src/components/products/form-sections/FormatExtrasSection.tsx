
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

interface FormatExtrasSectionProps {
  form: any;
  readOnly?: boolean;
}

export function FormatExtrasSection({ form, readOnly = false }: FormatExtrasSectionProps) {
  const { currentOrganization } = useOrganization();

  const { data: unitOfMeasures } = useQuery({
    queryKey: ['unit-of-measures', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('unit_of_measures')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');
        
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });

  const formatExtras = form.watch("format_extras") || [];

  // Ensure formatExtras is always an array before using .map()
  const validFormatExtras = Array.isArray(formatExtras) ? formatExtras : [];

  const addFormatExtra = () => {
    if (readOnly) return;
    const currentExtras = form.getValues("format_extras") || [];
    const validCurrentExtras = Array.isArray(currentExtras) ? currentExtras : [];
    form.setValue("format_extras", [
      ...validCurrentExtras,
      { name: "", description: "", unit_of_measure_id: "" }
    ]);
  };

  const removeFormatExtra = (index: number) => {
    if (readOnly) return;
    const currentExtras = form.getValues("format_extras") || [];
    const validCurrentExtras = Array.isArray(currentExtras) ? currentExtras : [];
    const newExtras = validCurrentExtras.filter((_, i) => i !== index);
    form.setValue("format_extras", newExtras);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Format Extras</CardTitle>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFormatExtra}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Extra
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {validFormatExtras.length === 0 ? (
          <p className="text-muted-foreground text-sm">No format extras added.</p>
        ) : (
          validFormatExtras.map((extra: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Extra {index + 1}</h4>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFormatExtra(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`format_extras.${index}.name` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`format_extras.${index}.unit_of_measure_id` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "none"} 
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {unitOfMeasures?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`format_extras.${index}.description` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))
        )}

        <FormField
          control={form.control}
          name="format_extra_comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format Extra Comments</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""} 
                  disabled={readOnly}
                  placeholder="Additional comments about format extras..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
