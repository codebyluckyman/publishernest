
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, useFieldArray } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";
import { Trash2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDefaultPriceBreaks } from "@/hooks/useDefaultPriceBreaks";
import { useOrganization } from "@/hooks/useOrganization";
import { useEffect } from "react";

interface PriceBreakFieldProps {
  control: Control<QuoteRequestFormValues>;
  formatIndex: number;
}

export function PriceBreakField({ control, formatIndex }: PriceBreakFieldProps) {
  const { currentOrganization } = useOrganization();
  const { defaultPriceBreaks, isLoading: isLoadingDefaults } = useDefaultPriceBreaks(currentOrganization);
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: `formats.${formatIndex}.price_breaks`,
  });

  // Populate with default price breaks if none exist and defaults are available
  useEffect(() => {
    if (defaultPriceBreaks.length > 0 && fields.length === 0) {
      // Add each default price break
      defaultPriceBreaks.forEach(priceBreak => {
        append({ quantity: priceBreak.quantity });
      });
    }
  }, [defaultPriceBreaks, fields.length, append]);

  const handleAddPriceBreak = () => {
    append({
      quantity: 1000,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Price Break Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Single Number of Products Input field for all price breaks */}
        <div className="mb-4">
          <FormField
            control={control}
            name={`formats.${formatIndex}.num_products`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Products</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full max-w-xs"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {fields.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Quantity</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`formats.${formatIndex}.price_breaks.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="h-8"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            {isLoadingDefaults 
              ? "Loading default price breaks..." 
              : "No price breaks specified. Add one below."}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPriceBreak}
          className="mt-2"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Price Break
        </Button>
      </CardContent>
    </Card>
  );
}
