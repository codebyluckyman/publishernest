
import { Control, useWatch } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { QuoteRequestFormValues } from "./schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { QuantityField } from "./format-fields/QuantityField";
import { NotesField } from "./format-fields/NotesField";
import { FormatSpecificationsDisplay } from "./format-fields/FormatSpecificationsDisplay";
import { FormatProductField } from "./FormatProductField";
import { PriceBreakField } from "./PriceBreakField";
import { FormatSelectField } from "./format-fields/FormatSelectField";

interface FormatFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
}

export function FormatField({
  control,
  index,
  formats,
  isFormatsLoading,
}: FormatFieldProps) {
  // Watch the format_id to pass it to child components
  const formatId = useWatch({
    control,
    name: `formats.${index}.format_id`,
  });

  return (
    <div className="space-y-4">
      {/* Add Format Selection Field */}
      <FormatSelectField 
        control={control} 
        index={index} 
        formats={formats} 
        isLoading={isFormatsLoading} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <QuantityField control={control} index={index} />
      </div>

      <NotesField control={control} index={index} />

      {/* Format specifications if available - always show if format is selected */}
      <FormatSpecificationsDisplay 
        control={control} 
        index={index} 
        formats={formats} 
      />

      <Separator />

      {/* Products section */}
      <div>
        <h4 className="text-sm font-medium mb-2">Products</h4>
        <FormatProductField 
          control={control} 
          formatIndex={index}
          formatId={formatId || ""} 
        />
      </div>

      <Separator />

      {/* Price Break section */}
      <PriceBreakField control={control} formatIndex={index} />
    </div>
  );
}
