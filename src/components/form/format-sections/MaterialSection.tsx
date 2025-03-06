
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface MaterialSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function MaterialSection({ form, readOnly = false }: MaterialSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Material Specifications</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="cover_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Material</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 12pt C1S" {...field} disabled={readOnly} />
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
