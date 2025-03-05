
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type ProductDialogProps = {
  open: boolean;
  productId?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const ProductDialog = ({ open, productId, onOpenChange, onSuccess }: ProductDialogProps) => {
  const isEditMode = !!productId;
  const [isLoading, setIsLoading] = useState(false);
  const productFormRef = useRef<{ deleteProduct: () => Promise<void> } | null>(null);
  
  // Debug log to check productId
  useEffect(() => {
    console.log("ProductDialog isEditMode:", isEditMode, "productId:", productId);
  }, [isEditMode, productId]);
  
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDelete = async () => {
    console.log("Dialog handleDelete called, productFormRef:", productFormRef.current);
    if (productFormRef.current) {
      await productFormRef.current.deleteProduct();
    }
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
          <div className="flex space-x-2">
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
          ref={productFormRef}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
