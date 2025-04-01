
import { useEffect, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SavingTableItem } from "@/types/saving";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy } from "lucide-react";
import { toast } from "sonner";

// Define interfaces for price breaks and formats
interface PriceBreak {
  id: string;
  quantity: number;
  format_id?: string;
  format_name?: string;
  quote_request_format_id?: string;
  num_products?: number;
  [key: string]: any;
}

interface GroupedFormat {
  format_name: string;
  breaks: PriceBreak[];
}

interface SavingItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  saving: SavingTableItem;
  showMultiProducts: boolean;
  maxNumProducts: number;
  priceBreaks: PriceBreak[];
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
  onOpenChange,
}: SavingItemProps) {
  const { setValue, getValues } = useFormContext<SupplierQuoteFormValues>();
  const [sortedBreaks, setSortedBreaks] = useState<Array<{type: string; format_name?: string; [key: string]: any}>>([]);

  useEffect(() => {
    // Group price breaks by format and sort by quantity
    const grouped: Record<string, GroupedFormat> = priceBreaks.reduce((acc, pb) => {
      const formatKey = pb.format_id || "unknown";
      if (!acc[formatKey]) {
        acc[formatKey] = {
          format_name: pb.format_name || "Unknown Format",
          breaks: [],
        };
      }
      acc[formatKey].breaks.push(pb);
      return acc;
    }, {} as Record<string, GroupedFormat>);

    // Sort each group's breaks by quantity
    Object.values(grouped).forEach((group) => {
      group.breaks.sort((a, b) => a.quantity - b.quantity);
    });

    // Flatten back to array but maintain grouping
    const result: Array<{type: string; format_name?: string; [key: string]: any}> = [];
    Object.values(grouped).forEach((group) => {
      result.push({
        type: "header",
        format_name: group.format_name,
      });
      group.breaks.forEach((pb) => {
        result.push({
          type: "price_break",
          ...pb,
        });
      });
    });

    setSortedBreaks(result);
  }, [priceBreaks]);

  const handleCopyDown = (priceBreakIndex: number, productIndex?: number) => {
    const savings = getValues("savings");
    if (!savings || !savings[index] || !savings[index].price_breaks) return;

    const priceBreak = savings[index].price_breaks[priceBreakIndex];
    if (!priceBreak) return;

    // Get the value to copy
    let valueToCopy: number | null = null;
    if (productIndex !== undefined) {
      // Copy specific product cost
      const fieldName = `unit_cost_${productIndex + 1}` as keyof typeof priceBreak;
      valueToCopy = priceBreak[fieldName] as number | null;
    } else {
      // Copy standard unit cost
      valueToCopy = priceBreak.unit_cost;
    }

    // Apply value to all price breaks below the current one
    for (let i = priceBreakIndex + 1; i < savings[index].price_breaks.length; i++) {
      if (productIndex !== undefined) {
        const fieldName = `unit_cost_${productIndex + 1}`;
        setValue(`savings.${index}.price_breaks.${i}.${fieldName}`, valueToCopy);
      } else {
        setValue(`savings.${index}.price_breaks.${i}.unit_cost`, valueToCopy);
      }
    }

    toast.success(`Value copied to all rows below`);
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible
        open={isOpen}
        onOpenChange={(open) => onOpenChange(saving.id, open)}
      >
        <CardHeader className="p-3">
          <div className="flex justify-between items-center">
            <div className="font-medium">{saving.name}</div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          {saving.description && (
            <p className="text-sm text-muted-foreground">{saving.description}</p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-3 pt-0">
            {saving.unit_of_measure_id && (
              <div className="mb-3 text-sm text-muted-foreground">
                Unit: {saving.unit_of_measure_name}
              </div>
            )}

            <FormField
              control={control}
              name={`savings.${index}.notes`}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Textarea
                      placeholder="Notes (optional)"
                      className="resize-none h-20"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {sortedBreaks.map((item, i) => {
                if (item.type === "header") {
                  return (
                    <div
                      key={`header-${i}`}
                      className="text-sm font-medium pt-2 first:pt-0"
                    >
                      {item.format_name}
                    </div>
                  );
                }

                // Find the index of this price break in the form data
                const priceBreakIndex = getValues("savings")[index]?.price_breaks?.findIndex(
                  (pb) => pb.price_break_id === item.id
                );

                if (priceBreakIndex === undefined || priceBreakIndex === -1) {
                  return null;
                }

                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-24 text-sm">{item.quantity.toLocaleString()}</div>
                    <div className="flex-1">
                      {showMultiProducts ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
                          {Array.from({ length: Math.min(maxNumProducts, 10) }, (_, idx) => (
                            <FormField
                              key={`${item.id}-product-${idx}`}
                              control={control}
                              name={`savings.${index}.price_breaks.${priceBreakIndex}.unit_cost_${idx + 1}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <ContextMenu>
                                      <ContextMenuTrigger>
                                        <Input
                                          type="number"
                                          step="0.001"
                                          min="0"
                                          placeholder="0.000"
                                          className="h-8"
                                          {...field}
                                          onChange={(e) => {
                                            const value = e.target.value === "" ? null : parseFloat(e.target.value);
                                            field.onChange(value);
                                          }}
                                          value={field.value === null ? "" : field.value}
                                        />
                                      </ContextMenuTrigger>
                                      <ContextMenuContent>
                                        <ContextMenuItem onClick={() => handleCopyDown(priceBreakIndex, idx)}>
                                          <Copy className="mr-2 h-4 w-4" />
                                          <span>Copy to rows below</span>
                                        </ContextMenuItem>
                                      </ContextMenuContent>
                                    </ContextMenu>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      ) : (
                        <FormField
                          control={control}
                          name={`savings.${index}.price_breaks.${priceBreakIndex}.unit_cost` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ContextMenu>
                                  <ContextMenuTrigger>
                                    <Input
                                      type="number"
                                      step="0.001"
                                      min="0"
                                      placeholder="0.000"
                                      className="h-8"
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value === "" ? null : parseFloat(e.target.value);
                                        field.onChange(value);
                                      }}
                                      value={field.value === null ? "" : field.value}
                                    />
                                  </ContextMenuTrigger>
                                  <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleCopyDown(priceBreakIndex)}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      <span>Copy to rows below</span>
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
