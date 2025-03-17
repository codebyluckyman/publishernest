
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { QuoteRequestFormValues } from "./schema";
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

  const addPriceBreak = () => {
    append({
      from_quantity: 0,
      to_quantity: 0,
      one_product_price: false,
      two_products_price: false,
      three_products_price: false,
      four_products_price: false,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Price Break Requests</h4>
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
      
      {fields.length === 0 ? (
        <div className="text-sm text-muted-foreground p-3 bg-slate-50 rounded-md border border-dashed">
          Add price breaks to request specific quantity pricing from the supplier.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Quantity Range</TableHead>
              <TableHead className="text-center">1 Product</TableHead>
              <TableHead className="text-center">2 Products</TableHead>
              <TableHead className="text-center">3 Products</TableHead>
              <TableHead className="text-center">4 Products</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="p-2">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={control}
                      name={`formats.${formatIndex}.price_breaks.${index}.from_quantity`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="h-8"
                              placeholder="From"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="text-xs">to</span>
                    <FormField
                      control={control}
                      name={`formats.${formatIndex}.price_breaks.${index}.to_quantity`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="h-8"
                              placeholder="To"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TableCell>
                
                <TableCell className="text-center">
                  <FormField
                    control={control}
                    name={`formats.${formatIndex}.price_breaks.${index}.one_product_price`}
                    render={({ field }) => (
                      <FormItem>
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
                      <FormItem>
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
                      <FormItem>
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
                      <FormItem>
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
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
