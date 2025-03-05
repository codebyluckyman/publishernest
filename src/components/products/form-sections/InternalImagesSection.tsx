
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/schemas/productSchema";
import { Image, Plus, X } from "lucide-react";

interface InternalImagesSectionProps {
  form: UseFormReturn<ProductFormValues>;
  readOnly?: boolean;
}

export function InternalImagesSection({ form, readOnly = false }: InternalImagesSectionProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    
    const currentImages = form.getValues("internal_images") || [];
    form.setValue("internal_images", [...currentImages, newImageUrl.trim()]);
    setNewImageUrl("");
  };
  
  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues("internal_images") || [];
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    form.setValue("internal_images", updatedImages);
  };
  
  const images = form.watch("internal_images") || [];
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Internal Images</h3>
      
      {!readOnly && (
        <div className="flex space-x-2 mb-3">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddImage}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="border rounded-md p-2 relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                <img 
                  src={url} 
                  alt={`Internal image ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              {!readOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 bg-muted/30 rounded-md border border-dashed">
          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
            <Image className="h-8 w-8" />
            <span>No internal images added</span>
          </div>
        </div>
      )}
    </div>
  );
}
