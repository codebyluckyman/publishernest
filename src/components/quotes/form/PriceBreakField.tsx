
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Control, useFieldArray } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";
import { Trash2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PriceBreakFieldProps {
  control: Control<QuoteRequestFormValues>;
  formatIndex: number;
}

export function PriceBreakField({ control, formatIndex }: PriceBreakFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `formats.${formatIndex}.price_breaks`,
  });

  const handleAddPriceBreak = () => {
    append({
      quantity: 1000,
      one_product_price: false,
      two_products_price: false,
      three_products_price: false,
      four_products_price: false,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Price Break Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {fields.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Quantity</TableHead>
                  <TableHead className="text-center">1 Product</TableHead>
                  <TableHead className="text-center">2 Products</TableHead>
                  <TableHead className="text-center">3 Products</TableHead>
                  <TableHead className="text-center">4 Products</TableHead>
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
                    <TableCell className="text-center">
                      <FormField
                        control={control}
                        name={`formats.${formatIndex}.price_breaks.${index}.one_product_price`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 flex justify-center items-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <FormField
                        control={control}
                        name={`formats.${formatIndex}.price_breaks.${index}.two_products_price`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 flex justify-center items-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <FormField
                        control={control}
                        name={`formats.${formatIndex}.price_breaks.${index}.three_products_price`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 flex justify-center items-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <FormField
                        control={control}
                        name={`formats.${formatIndex}.price_breaks.${index}.four_products_price`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 flex justify-center items-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
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
            No price breaks specified. Add one below.
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
