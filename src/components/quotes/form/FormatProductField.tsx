
import { Control, useWatch, useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteRequestFormValues } from "./schema";
import { useLinkedProducts } from "@/components/format/hooks/useLinkedProducts";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

interface FormatProductFieldProps {
  control: Control<QuoteRequestFormValues>;
  formatIndex: number;
  formatId: string;
}

export function FormatProductField({ control, formatIndex, formatId }: FormatProductFieldProps) {
  // Access form context to update extra costs
  const { setValue, getValues } = useFormContext<QuoteRequestFormValues>();
  
  // Fetch products linked to this format
  const { data: linkedProducts = [], isLoading } = useLinkedProducts(formatId);

  // Watch for selected product IDs to display format extras
  const selectedProductId = useWatch({
    control,
    name: `formats.${formatIndex}.products.0.product_id`,
  });

  // Get product details by ID
  const getProductById = (productId: string) => {
    return linkedProducts.find(product => product.id === productId);
  };

  // Effect to add format extras to extra costs when a product is selected
  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct = getProductById(selectedProductId);
      
      if (selectedProduct?.format_extras && selectedProduct.format_extras.length > 0) {
        // Get current extra costs
        const currentExtraCosts = getValues("extra_costs") || [];
        
        // Get ISBN for reference
        const isbn = selectedProduct.isbn13 || selectedProduct.isbn10 || selectedProduct.id;
        
        // Add each format extra if it doesn't already exist
        selectedProduct.format_extras.forEach(extra => {
          // Check if this extra cost already exists by name
          const extraExists = currentExtraCosts.some(
            cost => cost.name.toLowerCase() === extra.name.toLowerCase()
          );
          
          if (!extraExists) {
            // Create description that mentions the product and includes format extra comments
            let description = `Related to "${selectedProduct.title}" (${isbn})`;
            
            // Add format extra comments if available
            if (selectedProduct.format_extra_comments) {
              description += `. Comments: ${selectedProduct.format_extra_comments}`;
            }
            
            // Add the extra cost
            setValue("extra_costs", [
              ...currentExtraCosts,
              {
                name: extra.name,
                description: description,
                unit_of_measure_id: extra.unit_of_measure_id || ""
              }
            ]);
          }
        });
      }
    }
  }, [selectedProductId, linkedProducts, setValue, getValues]);

  // Render badges for format extras
  const renderFormatExtrasBadges = (productId: string) => {
    const product = getProductById(productId);
    if (!product || !product.format_extras || product.format_extras.length === 0) return null;

    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1 mb-1">
          {product.format_extras.map((extra, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {extra.name}
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
