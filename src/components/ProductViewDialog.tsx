
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductReadOnlyForm from "./ProductReadOnlyForm";

type ProductViewDialogProps = {
  open: boolean;
  productId?: string;
  onOpenChange: (open: boolean) => void;
};

const ProductViewDialog = ({ open, productId, onOpenChange }: ProductViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Product Details</DialogTitle>
        </DialogHeader>
        {productId && <ProductReadOnlyForm productId={productId} />}
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;
