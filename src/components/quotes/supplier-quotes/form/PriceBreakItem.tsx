
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
  showLabels?: boolean;
}

export function PriceBreakItem({ 
  control, 
  index, 
  quantity, 
  productName, 
  numProducts,
  showLabels = false
}: PriceBreakItemProps) {
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
              <FormLabel className="text-xs">Unit Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  className="h-8 text-sm"
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

    // Multiple products case - create a horizontal grid for product costs
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
        {Array.from({ length: Math.min(numProducts, 10) }, (_, i) => i + 1).map((i) => (
          <FormField
            key={`unit_cost_${i}`}
            control={control}
            name={`price_breaks.${index}.unit_cost_${i}` as any}
            render={({ field }) => (
              <FormItem className="space-y-1">
                {showLabels && <FormLabel className="text-xs text-muted-foreground">{i}</FormLabel>}
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.000"
                    className="h-8 text-sm px-1.5"
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
        ))}
      </div>
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="space-y-1 md:col-span-1">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Quantity</p>
              <p className="text-sm">{quantity?.toLocaleString()}</p>
            </div>
            
            {productName && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Product</p>
                <p className="text-sm">{productName}</p>
              </div>
            )}
          </div>

          <div className="md:col-span-11">
            {renderUnitCostFields()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
