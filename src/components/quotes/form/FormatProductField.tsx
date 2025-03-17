
import { useFieldArray, Control, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Info } from "lucide-react";
import { QuoteRequestFormValues } from "./schema";
import { useLinkedProducts } from "@/components/format/hooks/useLinkedProducts";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/productUtils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormatProductFieldProps {
  control: Control<QuoteRequestFormValues>;
  formatIndex: number;
  formatId: string;
}

export function FormatProductField({ control, formatIndex, formatId }: FormatProductFieldProps) {
  // Fetch products linked to this format
  const { data: linkedProducts = [], isLoading } = useLinkedProducts(formatId);

  // Field array for products within this format
  const { fields, append, remove } = useFieldArray({
    control,
    name: `formats.${formatIndex}.products`,
  });

  // Watch for selected product IDs to display format extras
  const selectedProducts = useWatch({
    control,
    name: `formats.${formatIndex}.products`,
  });

  const addProduct = () => {
    append({
      product_id: "",
      quantity: 1,
      notes: "",
    });
  };

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
      <div className="mt-2 flex flex-wrap gap-1">
        {activeExtras.map((extra) => (
          <TooltipProvider key={extra}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="capitalize text-xs">
                  {extra.replace('_', ' ')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Format extra: {extra.replace('_', ' ')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {product.format_extra_comments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  <Info className="h-3 w-3 mr-1" />
                  Details
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{product.format_extra_comments}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
    <div className="space-y-3 mt-3">
      <div className="flex justify-between items-center">
        <h5 className="text-sm font-medium">Products for this format</h5>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addProduct}
          className="flex items-center text-xs"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Product
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground border border-dashed rounded-md p-2">
          No products added. Click 'Add Product' to include products in this quote request.
        </div>
      )}

      {fields.map((field, productIndex) => (
        <Card key={field.id} className="overflow-hidden bg-slate-50">
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h6 className="text-xs font-medium">Product {productIndex + 1}</h6>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(productIndex)}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={control}
                name={`formats.${formatIndex}.products.${productIndex}.product_id`}
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
                name={`formats.${formatIndex}.products.${productIndex}.quantity`}
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
                name={`formats.${formatIndex}.products.${productIndex}.notes`}
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
