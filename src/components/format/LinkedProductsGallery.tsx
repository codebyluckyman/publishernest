
import { useState } from "react";
import { EmptyProductsList } from "./gallery/EmptyProductsList";
import { ProductsLoader } from "./gallery/ProductsLoader";
import { GalleryView } from "./gallery/GalleryView";
import { TableView } from "./gallery/TableView";
import { ViewToggle, ViewMode } from "./gallery/ViewToggle";
import { useLinkedProducts } from "./hooks/useLinkedProducts";
import ProductViewDialog from "@/components/ProductViewDialog";

interface LinkedProductsGalleryProps {
  formatId: string;
}

export function LinkedProductsGallery({ formatId }: LinkedProductsGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const { data: products, isLoading, error } = useLinkedProducts(formatId);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsProductDialogOpen(false);
    setSelectedProductId(undefined);
  };

  if (isLoading) {
    return <ProductsLoader viewMode={viewMode} setViewMode={setViewMode} />;
  }

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/20 rounded-md">
        Error loading linked products: {(error as Error).message}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyProductsList />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Linked Products ({products.length})</h3>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
      
      {viewMode === "gallery" ? (
        <GalleryView products={products} onProductClick={handleProductClick} />
      ) : (
        <TableView products={products} onProductClick={handleProductClick} />
      )}

      <ProductViewDialog 
        open={isProductDialogOpen} 
        productId={selectedProductId}
        onOpenChange={setIsProductDialogOpen}
      />
    </div>
  );
}
