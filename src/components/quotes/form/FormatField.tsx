
import { Control, useWatch, useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { QuoteRequestFormValues } from "./schema";
import { FormatProductField } from "./FormatProductField";
import { useState, useEffect } from "react";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { FormatSpecifications } from "./FormatSpecifications";

interface FormatFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
}

export function FormatField({ control, index, formats, isFormatsLoading }: FormatFieldProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>("");
  const { setValue } = useFormContext<QuoteRequestFormValues>();
  
  // Fetch format details
  const { data: formatDetails, isLoading: isFormatDetailsLoading } = useFormatDetails(selectedFormatId);
  
  // Watch the products array to calculate total quantity
  const productsArray = useWatch({
    control,
    name: `formats.${index}.products`,
    defaultValue: [],
  });

  // Calculate total quantity based on products
  useEffect(() => {
    if (productsArray && productsArray.length > 0) {
      const totalQuantity = productsArray.reduce((sum, product) => {
        return sum + (product.quantity || 0);
      }, 0);
      
      // Update the format quantity field using setValue instead of directly manipulating internal properties
      if (totalQuantity > 0) {
        // Safely update the value using the proper setValue method from useFormContext
        setValue(`formats.${index}.quantity`, totalQuantity, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  }, [productsArray, setValue, index]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name={`formats.${index}.format_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedFormatId(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.format_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`formats.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity (Auto-calculated)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  value={field.value || ''}
                  disabled={productsArray && productsArray.length > 0}
                />
              </FormControl>
              {productsArray && productsArray.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  This value is automatically calculated from product quantities
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`formats.${index}.notes`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific notes about this format"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {selectedFormatId && (
        <>
          <FormatSpecifications format={formatDetails} isLoading={isFormatDetailsLoading} />
          <FormatProductField 
            control={control} 
            formatIndex={index} 
            formatId={selectedFormatId}
          />
        </>
      )}
    </div>
  );
}
