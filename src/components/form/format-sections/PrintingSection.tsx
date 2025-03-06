
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface PrintingSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function PrintingSection({ form, readOnly = false }: PrintingSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Printing Specifications</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="cover_stock_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Print Specifications</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 4-color process + matte lamination" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
      </div>
    </div>
  );
}
