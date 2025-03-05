
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type ProductDialogProps = {
  open: boolean;
  productId?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const ProductDialog = ({ open, productId, onOpenChange, onSuccess }: ProductDialogProps) => {
  const isEditMode = !!productId;
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDelete = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
          <div className="flex space-x-2">
            <Button variant="outline" type="button" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="product-form" 
              disabled={isLoading} 
              variant={isEditMode ? "success" : "default"}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </DialogHeader>
        <ProductForm 
          productId={productId} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          onDelete={handleDelete}
          formId="product-form"
          setIsLoading={setIsLoading}
          hideButtons={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
