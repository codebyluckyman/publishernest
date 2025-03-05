
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";

interface DescriptionSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function DescriptionSection({ form, readOnly = false }: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Description</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description" 
                  className="resize-none" 
                  rows={2}
                  disabled={readOnly}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="long_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed description" 
                  className="resize-none" 
                  rows={5}
                  disabled={readOnly}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
