
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteRequestFormValues } from "./schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Combobox } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { FormatProductField } from "./FormatProductField";
import { FormatSpecifications } from "./FormatSpecifications";
import { PriceBreakField } from "./PriceBreakField";

interface FormatFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
  showFormatSpecifications?: boolean;
}

export function FormatField({
  control,
  index,
  formats,
  isFormatsLoading,
  showFormatSpecifications = false,
}: FormatFieldProps) {
  // Format options for the combobox
  const formatOptions = formats.map((format) => ({
    label: format.format_name,
    value: format.id,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {...field}
                  isLoading={isFormatsLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`formats.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`formats.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Format Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any additional notes about this format"
                className="h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Format specifications if available and enabled */}
      {showFormatSpecifications && (
        <FormField
          control={control}
          name={`formats.${index}.format_id`}
          render={({ field }) => {
            const selectedFormatId = field.value;
            const selectedFormat = formats.find(
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
      )}

      <Separator />

      {/* Products section */}
      <div>
        <h4 className="text-sm font-medium mb-2">Products</h4>
        <FormatProductField 
          control={control} 
          formatIndex={index} 
        />
      </div>

      <Separator />

      {/* Price Break section */}
      <PriceBreakField control={control} formatIndex={index} />
    </div>
  );
}
