
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useOrganization } from "@/hooks/useOrganization";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers } from "lucide-react";

const numProductsSchema = z.object({
  defaultNumProducts: z.number()
    .int("Number must be a whole number")
    .min(1, "Minimum is 1 product")
    .max(20, "Maximum is 20 products"),
});

type NumProductsFormValues = z.infer<typeof numProductsSchema>;

export function DefaultNumProducts() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<NumProductsFormValues>({
    resolver: zodResolver(numProductsSchema),
    defaultValues: {
      defaultNumProducts: currentOrganization?.default_num_products || 1,
    },
  });

  async function onSubmit(values: NumProductsFormValues) {
    if (!currentOrganization) return;
    
    setIsSaving(true);
    try {
      await updateOrganizationSetting('default_num_products', values.defaultNumProducts);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Default Number of Products
        </CardTitle>
        <CardDescription>
          Set the default number of products when creating new quote requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="defaultNumProducts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Products</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the default number of products that will be pre-filled when creating a quote request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
