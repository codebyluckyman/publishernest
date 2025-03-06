
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface ExtentSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function ExtentSection({ form, readOnly = false }: ExtentSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Extent Information</h3>
      <div className="grid grid-cols-1 gap-4">
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
      </div>
    </div>
  );
}
