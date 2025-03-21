
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface PriceBreakItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  quantity?: number;
  productName?: string;
}

export function PriceBreakItem({ control, index, quantity, productName }: PriceBreakItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">Quantity</p>
            <p className="text-sm">{quantity?.toLocaleString()}</p>
          </div>
          
          {productName && (
            <div>
              <p className="text-sm font-medium">Product</p>
              <p className="text-sm">{productName}</p>
            </div>
          )}
          
          <FormField
            control={control}
            name={`price_breaks.${index}.unit_cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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
        </div>
      </CardContent>
    </Card>
  );
}
