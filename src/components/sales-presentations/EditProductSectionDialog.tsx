
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductSectionForm } from "./ProductSectionForm";
import { Product } from "@/types/product";

interface EditProductSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sectionData: {
    title: string;
    description: string;
    products: {
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }[];
  }) => void;
  initialData: {
    title: string;
    description: string;
    products: {
      productId: string;
      product?: Product;
      customPrice?: number;
      customDescription?: string;
    }[];
  };
}

export function EditProductSectionDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: EditProductSectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Product Section</DialogTitle>
        </DialogHeader>
        <ProductSectionForm 
          onSave={(data) => {
            onSave(data);
            onOpenChange(false);
          }}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
