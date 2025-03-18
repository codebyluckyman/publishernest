
import { Control, useWatch } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { FormatSpecifications } from "../FormatSpecifications";
import { useEffect, useState } from "react";
import { Format } from "@/components/format/types/FormatTypes";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";

interface FormatSpecificationsDisplayProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
}

export function FormatSpecificationsDisplay({
  control,
  index,
  formats,
}: FormatSpecificationsDisplayProps) {
  // Watch for format_id changes
  const formatId = useWatch({
    control,
    name: `formats.${index}.format_id`,
  });
  
  // Fetch format details when a format is selected
  const { data: formatDetails, isLoading } = useFormatDetails(formatId || null);
  
  // Ensure formats is always a valid array
  const safeFormats = Array.isArray(formats) ? formats : [];

  // Only show specifications if we have a selected format
  if (!formatId) return null;
  
  return (
    <FormField
      control={control}
      name={`formats.${index}.format_id`}
      render={({ field }) => {
        const selectedFormatId = field.value || "";
        const selectedFormat = safeFormats.find(
          (format) => format.id === selectedFormatId
        );
        
        return selectedFormat ? (
          <div className="mt-4 p-3 bg-slate-50 rounded-md">
            <FormatSpecifications 
              format={formatDetails as any} 
              isLoading={isLoading} 
            />
          </div>
        ) : null;
      }}
    />
  );
}
