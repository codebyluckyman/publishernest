
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";
import { Separator } from "@/components/ui/separator";
import { SizeSection } from "./format-sections/SizeSection";
import { PrintingSection } from "./format-sections/PrintingSection";
import { MaterialSection } from "./format-sections/MaterialSection";
import { BindingSection } from "./format-sections/BindingSection";

interface FormatFormFieldsProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function FormatFormFields({ form, readOnly = false }: FormatFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="format_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Format Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Paperback 6x9" {...field} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />
      <SizeSection form={form} readOnly={readOnly} />
      
      <Separator />
      <PrintingSection form={form} readOnly={readOnly} />
      
      <Separator />
      <MaterialSection form={form} readOnly={readOnly} />
      
      <Separator />
      <BindingSection form={form} readOnly={readOnly} />
    </div>
  );
}
