
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Combobox } from "@/components/ui/combobox";

interface FormatSelectionFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
}

export function FormatSelectionField({
  control,
  index,
  formats,
  isFormatsLoading,
}: FormatSelectionFieldProps) {
  // Ensure formats is valid before mapping
  const safeFormats = Array.isArray(formats) ? formats : [];
  
  // Format options for the combobox
  const formatOptions = safeFormats.map((format) => ({
    label: format.format_name,
    value: format.id,
  }));

  return (
    <FormField
      control={control}
      name={`formats.${index}.format_id`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Format</FormLabel>
          <FormControl>
            <Combobox
              items={formatOptions}
              placeholder="Select format"
              value={field.value}
              onChange={field.onChange}
              isLoading={isFormatsLoading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
