
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { QuoteFormValues } from "./quoteFormSchema";

interface QuoteItemsSectionProps {
  form: UseFormReturn<QuoteFormValues>;
  addItem: () => void;
  removeItem: (index: number) => void;
}

export function QuoteItemsSection({ form, addItem, removeItem }: QuoteItemsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Quote Items</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="border rounded-md">
        <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit Price</div>
          <div className="col-span-2">Subtotal</div>
          <div className="col-span-1"></div>
        </div>

        {form.watch("items").map((_, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t">
            <div className="col-span-5">
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="Qty" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name={`items.${index}.unit_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="Price" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name={`items.${index}.subtotal`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        disabled 
                        value={field.value?.toFixed(2) || '0.00'} 
                        className="bg-muted"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={form.watch("items").length <= 1}
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-12 gap-2 p-3 border-t bg-muted">
          <div className="col-span-9 text-right font-medium">Total:</div>
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      disabled 
                      value={field.value?.toFixed(2) || '0.00'} 
                      className="bg-muted font-medium"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </div>
  );
}
