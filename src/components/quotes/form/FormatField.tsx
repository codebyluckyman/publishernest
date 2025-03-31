import { useFieldArray, Control, Controller, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { QuoteRequestFormValues } from "./schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormatSpecifications } from "./FormatSpecifications";
import { FormatProductField } from "./FormatProductField";
import { PriceBreakField } from "./PriceBreakField";
import { useDefaultPriceBreaks } from "@/hooks/useDefaultPriceBreaks";
import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormatDetails } from "@/hooks/format/useFormatDetails";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormatSelectField } from "./format-fields/FormatSelectField";

interface FormatFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isFormatsLoading: boolean;
}

export function FormatField({ control, index, formats, isFormatsLoading }: FormatFieldProps) {
  const { currentOrganization } = useOrganization();
  const { defaultPriceBreaks = [], isLoading: isDefaultPriceBreaksLoading } = useDefaultPriceBreaks(currentOrganization);
  const [isPriceBreaksOpen, setIsPriceBreaksOpen] = useState(false);

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
    // Auto-expand the section when adding a new price break
    setIsPriceBreaksOpen(true);
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
        {/* Using FormatSelectField (combobox) instead of Select component */}
        <FormatSelectField 
          control={control}
          index={index}
          formats={formats}
          isLoading={isFormatsLoading}
        />
      </div>

      {selectedFormatId && <FormatSpecifications format={formatDetails} isLoading={isFormatDetailsLoading} />}
      
      {/* Collapsible Price Breaks section */}
      <Collapsible 
        open={isPriceBreaksOpen} 
        onOpenChange={setIsPriceBreaksOpen}
        className="border rounded-md overflow-hidden"
      >
        <div className="flex justify-between items-center p-3 bg-muted/20">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center justify-between w-full text-left"
            >
              <Label className="font-medium">Price Breaks ({priceBreakFields.length})</Label>
              {isPriceBreaksOpen ? 
                <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="p-3 border-t">
            {/* Number of Products field moved inside the collapsible */}
            <FormField
              control={control}
              name={`formats.${index}.num_products`}
              render={({ field }) => (
                <FormItem className="mb-4">
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
          
            <div className="flex justify-end mb-2">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Notes field */}
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
              productIndex={productIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
