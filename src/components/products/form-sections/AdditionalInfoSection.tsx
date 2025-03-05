
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";

interface AdditionalInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function AdditionalInfoSection({ form, readOnly = false }: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="age_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age Range</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 8-12 years" 
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
          name="license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License</FormLabel>
              <FormControl>
                <Input 
                  placeholder="License information" 
                  disabled={readOnly}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="synopsis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Synopsis</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief synopsis of the product" 
                    className="resize-none" 
                    rows={4}
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
    </div>
  );
}
