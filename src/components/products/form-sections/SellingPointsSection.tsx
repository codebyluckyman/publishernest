
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { PlusCircle, MinusCircle, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SellingPointsSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function SellingPointsSection({ form, readOnly = false }: SellingPointsSectionProps) {
  // Get selling points from form
  const sellingPoints = form.watch("selling_points") || [];

  // Add a new selling point
  const addSellingPoint = () => {
    const currentPoints = form.getValues("selling_points") || [];
    form.setValue("selling_points", [...currentPoints, ""], { shouldDirty: true });
  };

  // Remove a selling point at specific index
  const removeSellingPoint = (index: number) => {
    const currentPoints = form.getValues("selling_points") || [];
    form.setValue(
      "selling_points",
      currentPoints.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Selling Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellingPoints.map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`selling_points.${index}`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        placeholder={`Selling point ${index + 1}`}
                        disabled={readOnly}
                        {...field}
                      />
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => removeSellingPoint(index)}
                        >
                          <MinusCircle className="h-4 w-4" />
                          <span className="sr-only">Remove selling point</span>
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSellingPoint}
              className="mt-2 flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Selling Point
            </Button>
          )}

          {sellingPoints.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No selling points added. Add key points that highlight why customers should purchase this product.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
