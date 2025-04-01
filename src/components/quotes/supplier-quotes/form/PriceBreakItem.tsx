
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { Copy } from "lucide-react";

interface PriceBreakItemProps {
  control: Control<SupplierQuoteFormValues>;
  index: number;
  quantity?: number;
  productName?: string;
  numProducts: number;
  showLabels?: boolean;
  onCopyDown?: (index: number, fieldType?: string) => void;
}

export function PriceBreakItem({ 
  control, 
  index, 
  quantity, 
  productName, 
  numProducts,
  showLabels = false,
  onCopyDown
}: PriceBreakItemProps) {
  // Generate unit cost fields based on the number of products
  const renderUnitCostFields = () => {
    if (numProducts <= 1) {
      // Single product case - use unit_cost_1 field
      return (
        <FormField
          control={control}
          name={`price_breaks.${index}.unit_cost_1` as const}
          render={({ field }) => (
            <FormItem>
              {showLabels && <FormLabel className="text-xs">Unit Cost</FormLabel>}
              <FormControl>
                <ContextMenu>
                  <ContextMenuTrigger>
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
                        console.log(`value is: ${field.value}`);
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onCopyDown && onCopyDown(index, 'price_break')}>
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
      );
    }

    // Multiple products case - create a horizontal grid for product costs
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
        {Array.from({ length: Math.min(numProducts, 10) }, (_, i) => i + 1).map((productNumber) => (
          <FormField
            key={`unit_cost_${productNumber}`}
            control={control}
            name={`price_breaks.${index}.unit_cost_${productNumber}` as any}
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                {showLabels && <FormLabel className="text-xs text-muted-foreground">{productNumber}</FormLabel>}
                <FormControl>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.000"
                        className="h-7 text-xs px-1.5"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === null ? "" : field.value}
                      />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => onCopyDown && onCopyDown(index * numProducts + (productNumber - 1), 'price_break_product')}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy to rows below</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1">
          <div className="space-y-0.5 md:col-span-1">
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
