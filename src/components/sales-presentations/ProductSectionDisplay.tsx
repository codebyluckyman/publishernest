
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { TableView } from "./TableView";
import { CardView } from "./CarouselView";
import { useProductsWithFormats, ProductWithFormat } from "@/hooks/useProductsWithFormats";
import { PresentationDisplaySettings, PresentationItem } from "@/types/salesPresentation";
import { ViewToggle } from "./ViewToggle";
import { ProductDetailsDialog } from "./ProductDetailsDialog";

interface ProductSectionDisplayProps {
  items: PresentationItem[];
  displaySettings?: PresentationDisplaySettings;
}

export function ProductSectionDisplay({ items, displaySettings }: ProductSectionDisplayProps) {
  const { currentOrganization } = useOrganization();
  const [viewMode, setViewMode] = useState<"grid" | "table">(displaySettings?.defaultView === "table" ? "table" : "grid");
  const [selectedProduct, setSelectedProduct] = useState<{
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  } | null>(null);
  
  // Extract all product IDs from the section items
  const productIds = items
    .filter(item => item.item_type === "product" && item.item_id)
    .map(item => item.item_id!) as string[];
  
  // Fetch all products with their format data
  const { products, isLoading } = useProductsWithFormats();
  
  // Filter products to only those in this section
  const sectionProducts = products.filter(product => productIds.includes(product.id));
  
  // Create the full product items with any custom data from presentation items
  const productItems = sectionProducts.map(product => {
    const presentationItem = items.find(item => item.item_id === product.id);
    
    return {
      product,
      customPrice: presentationItem?.custom_price || undefined,
      customDescription: presentationItem?.description || undefined
    };
  });
  
  const features = displaySettings?.features || {
    enabledViews: ["grid", "table"],
    allowViewToggle: true,
    showProductDetails: true
  };
  
  const handleSelectProduct = (product: {
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  }) => {
    if (features.showProductDetails !== false) {
      setSelectedProduct(product);
    }
  };
  
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading products...</div>;
  }
  
  if (productItems.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No products in this section</div>;
  }
  
  return (
    <div className="space-y-4">
      {features.allowViewToggle && features.enabledViews && features.enabledViews.length > 1 && (
        <div className="flex justify-end">
          <ViewToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
        </div>
      )}
      
      <div>
        {viewMode === "table" ? (
          <TableView 
            products={productItems} 
            displaySettings={displaySettings}
            onSelectProduct={handleSelectProduct}
          />
        ) : (
          <CardView 
            products={productItems} 
            displaySettings={displaySettings}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </div>
      
      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct.product}
          customPrice={selectedProduct.customPrice}
          customDescription={selectedProduct.customDescription}
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
          displaySettings={displaySettings}
        />
      )}
    </div>
  );
}
