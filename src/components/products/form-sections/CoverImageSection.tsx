
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/context/OrganizationContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 

interface CoverImageSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function CoverImageSection({ form, readOnly = false }: CoverImageSectionProps) {
  const { currentOrganization } = useOrganization();
  const [isUploading, setIsUploading] = useState(false);
  const coverImageUrl = form.watch("cover_image_url");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!currentOrganization) {
      toast.error("No organization selected");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("File must be an image (JPEG, PNG, WebP, or GIF)");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("organizationId", currentOrganization.id);
      
      // Call the edge function directly
      const { data, error } = await supabase.functions.invoke('upload-product-image', {
        body: formData,
        method: 'POST',
      });
      
      if (error) {
        throw new Error(error.message || "Failed to upload image");
      }
      
      if (!data || !data.url) {
        throw new Error("No URL returned from upload");
      }
      
      form.setValue("cover_image_url", data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

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

        <div className="flex-1 space-y-4">
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
          
          {!readOnly && (
            <div>
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => document.getElementById("cover-image-upload")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Cover Image"}
              </Button>
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum size: 5MB. Supported formats: JPEG, PNG, WebP, GIF
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
