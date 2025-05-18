
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormatFormValues } from "@/hooks/useFormatForm";
import { Separator } from "@/components/ui/separator";
import { SizeSection } from "./format-sections/SizeSection";
import { ExtentSection } from "./format-sections/ExtentSection";
import { CoverSpecificationsSection } from "./format-sections/CoverSpecificationsSection";
import { InternalSpecificationsSection } from "./format-sections/InternalSpecificationsSection";
import { BindingSection } from "./format-sections/BindingSection";
import { ComponentsSection } from "./format-sections/ComponentsSection";
import { EndPapersSection } from "./format-sections/EndPapersSection";
import { SpacersSection } from "./format-sections/SpacersSection";

interface FormatFormFieldsProps {
  form: UseFormReturn<FormatFormValues>;
  formatId?: string;
  readOnly?: boolean;
}

export function FormatFormFields({ form, formatId, readOnly = false }: FormatFormFieldsProps) {
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
      <ExtentSection form={form} readOnly={readOnly} />
      
      <Separator />
      <CoverSpecificationsSection form={form} readOnly={readOnly} />
      
      <Separator />
      <InternalSpecificationsSection form={form} readOnly={readOnly} />
      
      <Separator />
      <EndPapersSection form={form} readOnly={readOnly} />
      
      <Separator />
      <SpacersSection form={form} readOnly={readOnly} />
      
      <Separator />
      <BindingSection form={form} readOnly={readOnly} />

      {/* Only show components section when the format has been saved */}
      {formatId && (
        <>
          <Separator />
          <ComponentsSection form={form} formatId={formatId} readOnly={readOnly} />
        </>
      )}
    </div>
  );
}
