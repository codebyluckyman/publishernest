
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface InternalSpecificationsSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function InternalSpecificationsSection({ form, readOnly = false }: InternalSpecificationsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Internal Specifications</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="internal_stock_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interior Print Specifications</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 1-color black" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="internal_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interior Material</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 60# white offset" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
