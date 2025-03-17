
import { Control } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { FormatSpecifications } from "../FormatSpecifications";

interface FormatSpecificationsDisplayProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  showSpecifications: boolean;
}

export function FormatSpecificationsDisplay({
  control,
  index,
  formats,
  showSpecifications,
}: FormatSpecificationsDisplayProps) {
  if (!showSpecifications) return null;
  
  // Ensure formats is valid before using
  const safeFormats = Array.isArray(formats) ? formats : [];

  return (
    <FormField
      control={control}
      name={`formats.${index}.format_id`}
      render={({ field }) => {
        const selectedFormatId = field.value;
        const selectedFormat = safeFormats.find(
          (format) => format.id === selectedFormatId
        );
        return selectedFormat ? (
          <div className="p-3 bg-slate-50 rounded-md">
            <FormatSpecifications 
              format={selectedFormat as any} 
              isLoading={false} 
            />
          </div>
        ) : null;
      }}
    />
  );
}
