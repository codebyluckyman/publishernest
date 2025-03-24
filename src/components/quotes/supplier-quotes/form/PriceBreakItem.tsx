
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
  numProducts: number;
}

export function PriceBreakItem({ control, index, quantity, productName, numProducts }: PriceBreakItemProps) {
  // Generate unit cost fields based on the number of products
  const renderUnitCostFields = () => {
    if (numProducts <= 1) {
      // Single product case - use the standard unit_cost field
      return (
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
      );
    }

    // Multiple products case - create a field for each product count
    const fields = [];
    for (let i = 1; i <= Math.min(numProducts, 4); i++) {
      fields.push(
        <FormField
          key={`unit_cost_${i}`}
          control={control}
          name={`price_breaks.${index}.unit_cost_${i}` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Cost ({i} product{i !== 1 ? 's' : ''})</FormLabel>
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
      );
    }
    
    return <div className="space-y-4">{fields}</div>;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Quantity</p>
              <p className="text-sm">{quantity?.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Products</p>
              <p className="text-sm">{numProducts}</p>
            </div>
            
            {productName && (
              <div>
                <p className="text-sm font-medium">Product</p>
                <p className="text-sm">{productName}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {renderUnitCostFields()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
