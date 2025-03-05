
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { Image } from "lucide-react";

interface CoverImageSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function CoverImageSection({ form, readOnly = false }: CoverImageSectionProps) {
  const coverImageUrl = form.watch("cover_image_url");

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Cover Image</h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-32 h-44 overflow-hidden rounded border bg-muted flex items-center justify-center">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="Product cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          ) : (
            <Image className="h-10 w-10 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1">
          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input
                    disabled={readOnly}
                    placeholder="https://example.com/cover.jpg"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
