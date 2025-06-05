
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { QuoteRequestFormValues } from "../schema";
import { FormatOption } from "@/hooks/useFormatsForSelect";
import { Combobox } from "@/components/ui/combobox";

interface FormatSelectFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatOption[];
  isLoading: boolean;
}

export function FormatSelectField({
  control,
  index,
  formats,
  isLoading,
}: FormatSelectFieldProps) {
  // Transform formats data for the combobox - ensure this is always an array
  const formatOptions = Array.isArray(formats) 
    ? formats.map(format => ({
        label: format.label,
        value: format.value
      }))
    : [];

  return (
    <FormField
      control={control}
      name={`formats.${index}.id`}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Format</FormLabel>
          <FormControl>
            <Combobox
              items={formatOptions}
              value={field.value || ""}
              onChange={(value) => {
                field.onChange(value);
              }}
              placeholder="Select a format"
              searchPlaceholder="Search formats..."
              emptyMessage="No format found."
              disabled={isLoading}
              isLoading={isLoading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
