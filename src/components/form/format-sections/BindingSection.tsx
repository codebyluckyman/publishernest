
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface BindingSectionProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function BindingSection({ form, readOnly = false }: BindingSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Binding Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="binding_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Binding Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Perfect Bound, Saddle Stitch" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
