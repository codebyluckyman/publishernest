
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface CoverSpecificationsSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function CoverSpecificationsSection({ form, readOnly = false }: CoverSpecificationsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Cover Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cover_stock_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Print Specifications</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 4-color process + matte lamination" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cover_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Material</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 12pt C1S" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
