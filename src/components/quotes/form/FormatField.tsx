import { useFieldArray, Control, Controller, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { QuoteRequestFormValues } from "./schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormatSpecifications } from "./FormatSpecifications";
import { FormatProductField } from "./FormatProductField";
import { PriceBreakField } from "./PriceBreakField";
import { useDefaultPriceBreaks } from "@/hooks/useDefaultPriceBreaks";
import { useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";

interface FormatFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
}

export function FormatField({ control, index, formats, isFormatsLoading }: FormatFieldProps) {
  const { currentOrganization } = useOrganization();
  const { defaultPriceBreaks = [], isLoading: isDefaultPriceBreaksLoading } = useDefaultPriceBreaks(currentOrganization);

  // Watch the currently selected format to load its details
  const selectedFormatId = useWatch({
    control,
    name: `formats.${index}.format_id`
  });
  
  // Fetch format details when a format is selected
  const { data: formatDetails, isLoading: isFormatDetailsLoading } = useFormatDetails(selectedFormatId || null);

  // Setup nested arrays for products and price breaks within this format
  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: `formats.${index}.products`,
  });

  const {
    fields: priceBreakFields,
    append: appendPriceBreak,
    remove: removePriceBreak,
    replace: replacePriceBreaks,
  } = useFieldArray({
    control,
    name: `formats.${index}.price_breaks`,
  });

  // When format selection changes, add default price breaks if empty
  const onFormatChange = (formatId: string) => {
    if (priceBreakFields.length === 0 && defaultPriceBreaks.length > 0) {
      const formattedBreaks = defaultPriceBreaks.map(pb => ({
        quantity: pb.quantity
      }));
      replacePriceBreaks(formattedBreaks);
    }
  };

  // Add a product to this format
  const addProduct = () => {
    appendProduct({
      product_id: "",
      quantity: 1,
      notes: ""
    });
  };

  // Add a price break to this format
  const addPriceBreak = () => {
    appendPriceBreak({
      quantity: 1000
    });
  };

  // Set up default price breaks if none exist
  useEffect(() => {
    if (priceBreakFields.length === 0 && defaultPriceBreaks.length > 0) {
      const formattedBreaks = defaultPriceBreaks.map(pb => ({
        quantity: pb.quantity
      }));
      replacePriceBreaks(formattedBreaks);
    }
  }, [defaultPriceBreaks, priceBreakFields.length, replacePriceBreaks]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`formats.${index}.format_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select
                disabled={isFormatsLoading}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  onFormatChange(value);
                }}
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
          name={`formats.${index}.num_products`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Products</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)}
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
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter any additional notes about this format"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedFormatId && <FormatSpecifications format={formatDetails} isLoading={isFormatDetailsLoading} />}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Products</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProduct}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>
        {productFields.length === 0 && (
          <div className="text-sm text-muted-foreground border p-3 rounded-md border-dashed text-center">
            No products added yet
          </div>
        )}
        {productFields.map((field, productIndex) => (
          <div key={field.id} className="border p-3 rounded-md">
            <div className="flex justify-between items-start mb-3">
              <Label>Product {productIndex + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(productIndex)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <FormatProductField
              control={control}
              formatIndex={index}
              formatId={selectedFormatId}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Price Breaks</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPriceBreak}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Price Break
          </Button>
        </div>
        {priceBreakFields.length === 0 && (
          <div className="text-sm text-muted-foreground border p-3 rounded-md border-dashed text-center">
            No price breaks added yet
          </div>
        )}
        <div className="space-y-2">
          {priceBreakFields.map((field, priceBreakIndex) => (
            <PriceBreakField
              key={field.id}
              control={control}
              formatIndex={index}
              priceBreakIndex={priceBreakIndex}
              onRemove={() => removePriceBreak(priceBreakIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
