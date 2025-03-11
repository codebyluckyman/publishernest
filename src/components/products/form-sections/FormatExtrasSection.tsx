
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ProductFormValues } from "@/schemas/productSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormatExtrasSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function FormatExtrasSection({ form, readOnly = false }: FormatExtrasSectionProps) {
  const formatExtras = [
    { id: "foil", label: "Foil Stamping", description: "Metallic foil accent on cover" },
    { id: "spot_uv", label: "Spot UV", description: "Glossy coating on selective areas" },
    { id: "glitter", label: "Glitter", description: "Glitter accents" },
    { id: "embossing", label: "Embossing", description: "Raised design elements" },
    { id: "die_cut", label: "Die Cut", description: "Custom shapes cut from cover" },
    { id: "holographic", label: "Holographic", description: "Holographic effects" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Format Extras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formatExtras.map((extra) => (
            <FormField
              key={extra.id}
              control={form.control}
              name={`format_extras.${extra.id}` as any}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      {extra.label}
                    </FormLabel>
                    <FormDescription>
                      {extra.description}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="format_extra_comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format Extra Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe extra requirements, i.e. 50% glitter"
                  className="min-h-20"
                  {...field}
                  value={field.value || ""}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                Use this field to provide specific details about your format extras.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
