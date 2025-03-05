
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";

interface IdentifiersSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function IdentifiersSection({ form, readOnly = false }: IdentifiersSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Identifiers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="isbn13"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN-13</FormLabel>
              <FormControl>
                <Input placeholder="ISBN-13" disabled={readOnly} {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isbn10"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN-10</FormLabel>
              <FormControl>
                <Input placeholder="ISBN-10" disabled={readOnly} {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Subject classification code" 
                  disabled={readOnly} 
                  {...field} 
                  value={field.value || ""} 
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
