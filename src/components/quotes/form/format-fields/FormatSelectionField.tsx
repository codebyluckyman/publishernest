
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Combobox } from "@/components/ui/combobox";
import { Loader2 } from "lucide-react";

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
  // Ensure formats is always a valid array (defensive programming)
  const safeFormats = Array.isArray(formats) ? formats : [];
  
  // Format options for the combobox - only process if we have a valid array
  const formatOptions = safeFormats.map((format) => ({
    label: format.format_name || "Unnamed Format",
    value: format.id,
  }));

  return (
    <FormField
      control={control}
      name={`formats.${index}.format_id`}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>Format</FormLabel>
          <FormControl>
            <Combobox
              items={formatOptions}
              placeholder={isFormatsLoading ? "Loading formats..." : "Search and select format..."}
              value={field.value || ""}
              onChange={field.onChange}
              isLoading={isFormatsLoading}
              searchPlaceholder="Search formats..."
              emptyMessage="No formats found"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
