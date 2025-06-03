
import { useState } from "react";
import { Eye, Pencil, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProductActionMenuProps {
  product: Product;
  onViewProduct: (productId: string) => void;
  onEditProduct: (productId: string) => void;
  onCopyProduct?: (productId: string) => Promise<string>;
}

export function ProductActionMenu({ 
  product, 
  onViewProduct, 
  onEditProduct, 
  onCopyProduct 
}: ProductActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleCopyProduct = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyProduct) {
      try {
        const newProductId = await onCopyProduct(product.id);
        setIsOpen(false);
        
        if (newProductId) {
          onEditProduct(newProductId);
        }
      } catch (error) {
        console.error("Error copying product:", error);
      }
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Product Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => {
            onViewProduct(product.id);
            setIsOpen(false);
          }}>
            <Eye className="mr-2 h-4 w-4" />
            <span>View Product</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => {
            onEditProduct(product.id);
            setIsOpen(false);
          }}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit Product</span>
          </DropdownMenuItem>
          
          {onCopyProduct && (
            <DropdownMenuItem onClick={handleCopyProduct}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Product</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
