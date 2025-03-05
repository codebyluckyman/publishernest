
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoverImageSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

export function CoverImageSection({ form }: CoverImageSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const coverImage = form.watch('cover_image_url');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('product_covers')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product_covers')
        .getPublicUrl(filePath);

      // Update the form with the new image URL
      form.setValue('cover_image_url', publicUrl);
      toast.success("Cover image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    form.setValue('cover_image_url', '');
    toast.success("Cover image removed");
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Cover Image</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          {coverImage ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="relative border rounded overflow-hidden w-48 h-72 group">
                <img 
                  src={coverImage} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 border rounded w-48 h-72 flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">No cover image</p>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/cover.jpg" 
                    {...field}
                    className="mb-2"
                  />
                </FormControl>
                <div className="grid gap-2">
                  <label htmlFor="cover-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload Cover Image"}
                    </Button>
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a JPEG, PNG or WebP image (max 5MB)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
