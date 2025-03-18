
import { Control, Controller } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";

interface FormatSelectFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isLoading: boolean;
}

export function FormatSelectField({
  control,
  index,
  formats,
  isLoading,
}: FormatSelectFieldProps) {
  // Transform formats data for the combobox
  const formatOptions = formats.map(format => ({
    label: format.format_name,
    value: format.id
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
              value={field.value}
              onChange={field.onChange}
              placeholder="Select a format..."
              searchPlaceholder="Search formats..."
              emptyMessage="No formats found."
              isLoading={isLoading}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
