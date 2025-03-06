
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface SizeSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function SizeSection({ form, readOnly = false }: SizeSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Size Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="extent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dimensions</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 6x9 inches" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TPS (Total Pages)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 240 pages" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
