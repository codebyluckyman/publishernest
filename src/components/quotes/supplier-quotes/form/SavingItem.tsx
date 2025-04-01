
import { useState } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { SavingTableItem } from "@/types/saving";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PriceBreak } from "@/types/quoteRequest";

// Define a local interface for extended price break
interface ExtendedPriceBreak extends PriceBreak {
  format_name?: string;
  format_id?: string;
  quote_request_format_id?: string;
  num_products?: number;
}

// Define structure for grouped formats
interface GroupedFormat {
  format_name: string;
  format_id: string;
  breaks: ExtendedPriceBreak[];
}

interface SavingItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  saving: SavingTableItem;
  showMultiProducts: boolean;
  maxNumProducts: number;
  priceBreaks: ExtendedPriceBreak[];
  isOpen: boolean;
  onOpenChange: (id: string, isOpen: boolean) => void;
}

export function SavingItem({
  control,
  index,
  saving,
  showMultiProducts,
  maxNumProducts,
  priceBreaks,
  isOpen,
  onOpenChange
}: SavingItemProps) {
  // Group price breaks by format
  const [groupedFormats, setGroupedFormats] = useState<GroupedFormat[]>(() => {
    // Process and group price breaks by format_id
    const formats: Record<string, GroupedFormat> = {};
    
    priceBreaks.forEach(pb => {
      const formatId = pb.format_id || '';
      if (!formats[formatId]) {
        formats[formatId] = {
          format_id: formatId,
          format_name: pb.format_name || 'Unknown Format',
          breaks: []
        };
      }
      formats[formatId].breaks.push(pb);
    });
    
    return Object.values(formats);
  });

  // Get the nested field array for price breaks
  const { fields } = useFieldArray({
    control,
    name: `savings.${index}.price_breaks` as const
  });

  // Watch the field values
  const fieldValues = useWatch({
    control,
    name: `savings.${index}.price_breaks`
  });

  // Watch notes field
  const notes = useWatch({
    control,
    name: `savings.${index}.notes`
  });

  const handleOpenChange = (open: boolean) => {
    onOpenChange(saving.id, open);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="w-full border rounded-md"
    >
      <div className="flex flex-col h-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex w-full justify-between p-4 text-left font-normal",
              isOpen && "border-b"
            )}
          >
            <div>
              <h3 className="text-base font-medium">{saving.name}</h3>
              <p className="text-sm text-muted-foreground">
                {saving.description}
              </p>
            </div>
            <div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="p-4">
          <FormField
            control={control}
            name={`savings.${index}.notes` as const}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <Textarea
                    placeholder="Notes about this saving"
                    className="resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {groupedFormats.map((format, formatIndex) => (
            <div key={format.format_id} className="mb-4">
              <h4 className="text-sm font-medium mb-2">{format.format_name}</h4>
              {format.breaks.map((priceBreak, priceBreakIndex) => {
                const fieldIndex = fields.findIndex(
                  f => f.price_break_id === priceBreak.id
                );
                
                if (fieldIndex === -1) return null;

                return (
                  <Card key={priceBreak.id} className="mb-2 border-none shadow-none">
                    <CardContent className="p-2">
                      <div className="grid grid-cols-3 md:grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 md:col-span-2">
                          <span className="text-xs text-muted-foreground">Qty: {priceBreak.quantity.toLocaleString()}</span>
                        </div>
                        
                        <div className="col-span-2 md:col-span-10">
                          {showMultiProducts ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
                              {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, i) => {
                                const fieldName = `unit_cost_${i + 1}` as const;
                                return (
                                  <FormField
                                    key={`${priceBreak.id}-${i}`}
                                    control={control}
                                    name={`savings.${index}.price_breaks.${fieldIndex}.${fieldName}` as any}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            step="0.001"
                                            placeholder={`Product ${i + 1}`}
                                            className="h-8 text-xs"
                                            {...field}
                                            onChange={(e) => {
                                              const value = e.target.value === "" ? null : parseFloat(e.target.value);
                                              field.onChange(value);
                                            }}
                                            value={field.value === null ? "" : field.value}
                                          />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                      </FormItem>
                                    )}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <FormField
                              control={control}
                              name={`savings.${index}.price_breaks.${fieldIndex}.unit_cost` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.001"
                                      placeholder="Saving"
                                      className="h-8"
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                                        field.onChange(value);
                                      }}
                                      value={field.value === null ? "" : field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
