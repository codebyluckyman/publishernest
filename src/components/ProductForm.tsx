
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
import { CartonSection } from "./products/form-sections/CartonSection";
import { AdditionalInfoSection } from "./products/form-sections/AdditionalInfoSection";
import { InternalImagesSection } from "./products/form-sections/InternalImagesSection";
import { PricingSection } from "./products/form-sections/PricingSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { StockTable } from "./products/form-sections/StockTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

type ProductFormProps = {
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  formId?: string;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  hideButtons?: boolean;
};

// Define the component with forwardRef to expose methods
const ProductForm = forwardRef<{ deleteProduct: () => Promise<void> }, ProductFormProps>(({ 
  productId, 
  onSuccess, 
  onCancel, 
  onDelete,
  formId = "product-form",
  setIsLoading: setParentIsLoading,
  hideButtons = false
}, ref) => {
  const { form, isLoading, isEditMode, onSubmit, deleteProduct } = useProductForm(productId, onSuccess);
  const { currentOrganization } = useOrganization();
  const [stockQuantities, setStockQuantities] = useState<Record<string, number>>({});

  // Expose the deleteProduct method via ref
  useImperativeHandle(ref, () => ({
    deleteProduct: async () => {
      console.log("ProductForm deleteProduct called");
      await deleteProduct();
    }
  }));

  // Debug log to check productId
  useEffect(() => {
    console.log("ProductForm isEditMode:", isEditMode, "productId:", productId);
  }, [isEditMode, productId]);

  // Sync loading state with parent if provided
  useEffect(() => {
    if (setParentIsLoading) {
      setParentIsLoading(isLoading);
    }
  }, [isLoading, setParentIsLoading]);

  const handleDelete = async () => {
    if (productId) {
      console.log("ProductForm handleDelete called");
      await deleteProduct();
      if (onDelete) onDelete();
    }
  };

  const handleStockChange = (warehouseId: string, quantity: number) => {
    setStockQuantities(prev => ({
      ...prev,
      [warehouseId]: quantity
    }));
  };

  const handleFormSubmit = async (values: any) => {
    try {
      // First submit the product form
      const result = await onSubmit(values);
      
      // Then update stock quantities if we have a product ID
      if (result.productId && currentOrganization) {
        // For each warehouse, upsert the stock quantity
        const stockPromises = Object.entries(stockQuantities).map(([warehouseId, quantity]) => {
          return supabase
            .from("stock_on_hand")
            .upsert({
              product_id: result.productId,
              warehouse_id: warehouseId,
              organization_id: currentOrganization.id,
              quantity
            }, { onConflict: 'product_id, warehouse_id' });
        });
        
        await Promise.all(stockPromises);
      }
      
      return result;
    } catch (error) {
      console.error("Error saving product with stock:", error);
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6" id={formId}>
        <CoverImageSection form={form} />
        <BasicInfoSection form={form} />
        <IdentifiersSection form={form} />
        <FormatSection form={form} />
        <PublicationSection form={form} />
        <PhysicalPropertiesSection form={form} />
        <CartonSection form={form} />
        <DescriptionSection form={form} />
        <AdditionalInfoSection form={form} />
        <InternalImagesSection form={form} />
        
        {/* Add the new Pricing Section */}
        {productId && (
          <PricingSection form={form} productId={productId} />
        )}
        
        {productId && (
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <StockTable 
                productId={productId} 
                onChange={handleStockChange}
              />
            </CardContent>
          </Card>
        )}

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
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
});

ProductForm.displayName = "ProductForm";

export default ProductForm;
