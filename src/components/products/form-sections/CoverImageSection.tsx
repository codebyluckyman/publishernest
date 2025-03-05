
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";

interface CoverImageSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CoverImageSection({ form }: CoverImageSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Cover Image</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/cover.jpg" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {form.watch('cover_image_url') && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="border rounded overflow-hidden w-48 h-72">
                <img 
                  src={form.watch('cover_image_url')} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
