
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useProductForm } from "@/hooks/useProductForm";
import { CoverImageSection } from "./products/form-sections/CoverImageSection";
import { BasicInfoSection } from "./products/form-sections/BasicInfoSection";
import { IdentifiersSection } from "./products/form-sections/IdentifiersSection";
import { FormatSection } from "./products/form-sections/FormatSection";
import { PublicationSection } from "./products/form-sections/PublicationSection";
import { PhysicalPropertiesSection } from "./products/form-sections/PhysicalPropertiesSection";
import { DescriptionSection } from "./products/form-sections/DescriptionSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect } from "react";

type ProductFormProps = {
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  formId?: string;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  hideButtons?: boolean;
};

export default function ProductForm({ 
  productId, 
  onSuccess, 
  onCancel, 
  onDelete,
  formId = "product-form",
  setIsLoading: setParentIsLoading,
  hideButtons = false
}: ProductFormProps) {
  const { form, isLoading, isEditMode, onSubmit, deleteProduct } = useProductForm(productId, onSuccess);

  // Sync loading state with parent if provided
  useEffect(() => {
    if (setParentIsLoading) {
      setParentIsLoading(isLoading);
    }
  }, [isLoading, setParentIsLoading]);

  const handleDelete = async () => {
    if (productId) {
      await deleteProduct();
      if (onDelete) onDelete();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id={formId}>
        <CoverImageSection form={form} />
        <BasicInfoSection form={form} />
        <IdentifiersSection form={form} />
        <FormatSection form={form} />
        <PublicationSection form={form} />
        <PhysicalPropertiesSection form={form} />
        <DescriptionSection form={form} />

        {!hideButtons && (
          <div className="flex justify-end space-x-2">
            {isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this product and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              variant={isEditMode ? "success" : "default"}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
