
import { Control, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteRequestFormValues } from "./schema";
import { useLinkedProducts } from "@/components/format/hooks/useLinkedProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FormatProductFieldProps {
  control: Control<QuoteRequestFormValues>;
  formatIndex: number;
  formatId: string;
}

export function FormatProductField({ control, formatIndex, formatId }: FormatProductFieldProps) {
  // Fetch products linked to this format
  const { data: linkedProducts = [], isLoading } = useLinkedProducts(formatId);

  // Watch for selected product IDs to display format extras
  const selectedProducts = useWatch({
    control,
    name: `formats.${formatIndex}.products`,
  });

  // Get product details by ID
  const getProductById = (productId: string) => {
    return linkedProducts.find(product => product.id === productId);
  };

  // Render badges for format extras
  const renderFormatExtrasBadges = (productId: string) => {
    const product = getProductById(productId);
    if (!product || !product.format_extras) return null;

    const activeExtras = Object.entries(product.format_extras)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    if (activeExtras.length === 0) return null;

    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1 mb-1">
          {activeExtras.map((extra) => (
            <Badge key={extra} variant="outline" className="capitalize text-xs">
              {extra.replace('_', ' ')}
            </Badge>
          ))}
        </div>
        
        {product.format_extra_comments && (
          <div className="mt-1 p-2 bg-slate-50 rounded-md border text-xs text-slate-800">
            <p className="font-medium mb-1">Format Extra Details:</p>
            <p>{product.format_extra_comments}</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading products...</div>;
  }

  if (linkedProducts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No products linked to this format. Select a different format or add products to this format first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          control={control}
          name={`formats.${formatIndex}.products.0.product_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Product</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {linkedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {field.value && renderFormatExtrasBadges(field.value)}
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`formats.${formatIndex}.products.0.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    field.onChange(newValue);
                  }}
                  value={field.value || ''}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`formats.${formatIndex}.products.0.notes`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific notes about this product"
                  className="resize-none text-sm h-16"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
