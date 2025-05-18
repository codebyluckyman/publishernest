
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface EndPapersAndSpasersSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function EndPapersAndSpacersSection({ form, readOnly = false }: EndPapersAndSpasersSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">End Papers & Spacers</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="end_papers_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Papers Material</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 170gsm White Woodfree" {...field} value={field.value || ''} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="end_papers_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Papers Print</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 4/0 CMYK" {...field} value={field.value || ''} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="spacers_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spacers Material</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 120gsm Kraft Paper" {...field} value={field.value || ''} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="spacers_stock_print"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spacers Print</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1/0 Black" {...field} value={field.value || ''} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
