
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";

interface IdentifiersSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function IdentifiersSection({ form }: IdentifiersSectionProps) {
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
                <Input placeholder="ISBN-13" {...field} />
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
                <Input placeholder="ISBN-10" {...field} />
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
                <Input placeholder="Subject classification code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
