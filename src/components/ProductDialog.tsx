
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";

type ProductDialogProps = {
  open: boolean;
  productId?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const ProductDialog = ({ open, productId, onOpenChange, onSuccess }: ProductDialogProps) => {
  const isEditMode = !!productId;
  
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1050px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <ProductForm 
          productId={productId} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
