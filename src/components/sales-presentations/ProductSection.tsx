import { useState } from "react";
import { PresentationDisplaySettings } from "@/types/salesPresentation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewToggle } from "./ViewToggle";
import { TableView } from "./TableView";
import { CarouselView } from "./CarouselView";
import { KanbanView } from "./KanbanView";
import { Button } from "@/components/ui/button";
import { Edit, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductWithFormat } from "@/hooks/useProductsWithFormats";
import { formatPrice } from "@/utils/productUtils";

interface ProductSectionProps {
  title: string;
  description?: string;
  products: Array<{
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  }>;
  displaySettings?: PresentationDisplaySettings;
  isEditable?: boolean;
  onEdit?: () => void;
}

export function ProductSection({ 
  title, 
  description, 
  products, 
  displaySettings, 
  isEditable = false,
  onEdit 
}: ProductSectionProps) {
  const [viewMode, setViewMode] = useState(displaySettings?.defaultView || 'card');
  const [selectedProduct, setSelectedProduct] = useState<{
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  } | null>(null);
  
  const features = displaySettings?.features;
  const enabledViews = features?.enabledViews || ['card', 'table'];
  const allowViewToggle = features?.allowViewToggle !== false;
  const showProductDetails = features?.showProductDetails !== false;
  const dialogColumns = displaySettings?.dialogColumns || ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];
  const showPricing = features?.showPricing !== false;
  
  const handleSelectProduct = (productData: {
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  }) => {
    if (showProductDetails) {
      setSelectedProduct(productData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center space-x-2">
          {isEditable && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {allowViewToggle && enabledViews.length > 1 && (
            <ViewToggle
              value={viewMode}
              onValueChange={setViewMode}
              availableViews={enabledViews}
            />
          )}
        </div>
      </div>
      
      <div className="mt-4">
        {products.length > 0 ? (
          viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((item) => (
                <Card 
                  key={item.product.id} 
                  className={`overflow-hidden ${showProductDetails ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
                  onClick={() => handleSelectProduct(item)}
                >
                  {item.product.cover_image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.product.cover_image_url}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{item.product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      {showPricing && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">
                            {item.customPrice !== undefined
                              ? formatPrice(item.customPrice, item.product.default_currency)
                              : item.product.list_price
                              ? formatPrice(item.product.list_price, item.product.default_currency)
                              : 'N/A'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISBN:</span>
                        <span>{item.product.isbn13 || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span>{item.product.format?.format_name || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === 'table' ? (
            <TableView 
              products={products} 
              displaySettings={displaySettings}
              onSelectProduct={handleSelectProduct}
            />
          ) : viewMode === 'carousel' ? (
            <CarouselView 
              products={products}
              displaySettings={displaySettings}
              onSelectProduct={handleSelectProduct}
            />
          ) : (
            <KanbanView 
              products={products}
              displaySettings={displaySettings}
              onSelectProduct={handleSelectProduct}
            />
          )
        ) : (
          <div className="py-12 text-center border rounded-md">
            <p className="text-muted-foreground">No products available in this section.</p>
          </div>
        )}
      </div>
      
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProduct.product.title}</DialogTitle>
              {selectedProduct.product.subtitle && (
                <DialogDescription className="text-lg font-normal">
                  {selectedProduct.product.subtitle}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="flex justify-center items-start">
                {selectedProduct.product.cover_image_url ? (
                  <div className="w-full max-w-[200px] h-auto border rounded-md overflow-hidden">
                    <img
                      src={selectedProduct.product.cover_image_url}
                      alt={selectedProduct.product.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[200px] h-[280px] bg-muted rounded-md flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
                    <span className="mt-2 text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 space-y-4">
                {showPricing && (
                  <div className="text-2xl font-bold">
                    {selectedProduct.customPrice !== undefined
                      ? formatPrice(selectedProduct.customPrice, selectedProduct.product.default_currency)
                      : selectedProduct.product.list_price
                      ? formatPrice(selectedProduct.product.list_price, selectedProduct.product.default_currency)
                      : 'Price not available'}
                  </div>
                )}
                
                <div className="space-y-4">
                  {dialogColumns.map((column) => {
                    // Skip price as it's already shown separately
                    if (column === 'price' || column === 'title' || column === 'subtitle') return null;
                    
                    const displayValue = (() => {
                      switch (column) {
                        // Basic info
                        case 'isbn13':
                          return selectedProduct.product.isbn13 || 'N/A';
                        case 'isbn10':
                          return selectedProduct.product.isbn10 || 'N/A';
                        
                        // Product details
                        case 'publisher':
                          return selectedProduct.product.publisher_name || 'N/A';
                        case 'publication_date':
                          return selectedProduct.product.publication_date 
                            ? new Date(selectedProduct.product.publication_date).toLocaleDateString() 
                            : 'N/A';
                        case 'product_form':
                          return selectedProduct.product.product_form || 'N/A';
                        case 'product_form_detail':
                          return selectedProduct.product.product_form_detail || 'N/A';
                        case 'status':
                          return selectedProduct.product.status || 'N/A';
                        
                        // Format details
                        case 'format':
                        case 'format_name':
                          return selectedProduct.product.format?.format_name || 'N/A';
                        case 'binding_type':
                          return selectedProduct.product.format?.binding_type || 'N/A';
                        case 'cover_material':
                          return selectedProduct.product.format?.cover_material || 'N/A';
                        case 'internal_material':
                          return selectedProduct.product.format?.internal_material || 'N/A';
                        case 'cover_stock_print':
                          return selectedProduct.product.format?.cover_stock_print || 'N/A';
                        case 'internal_stock_print':
                          return selectedProduct.product.format?.internal_stock_print || 'N/A';
                        case 'orientation':
                          return selectedProduct.product.format?.orientation || 'N/A';
                        case 'extent':
                          return selectedProduct.product.format?.extent || 'N/A';
                        case 'tps_dimensions':
                          if (selectedProduct.product.format?.tps_height_mm || selectedProduct.product.format?.tps_width_mm || selectedProduct.product.format?.tps_depth_mm) {
                            return `H: ${selectedProduct.product.format.tps_height_mm || '-'}mm × W: ${selectedProduct.product.format.tps_width_mm || '-'}mm × D: ${selectedProduct.product.format.tps_depth_mm || '-'}mm`;
                          }
                          return 'N/A';
                        case 'plc_dimensions':
                          if (selectedProduct.product.format?.tps_plc_height_mm || selectedProduct.product.format?.tps_plc_width_mm || selectedProduct.product.format?.tps_plc_depth_mm) {
                            return `H: ${selectedProduct.product.format.tps_plc_height_mm || '-'}mm × W: ${selectedProduct.product.format.tps_plc_width_mm || '-'}mm × D: ${selectedProduct.product.format.tps_plc_depth_mm || '-'}mm`;
                          }
                          return 'N/A';
                        
                        // Synopsis and additional information
                        case 'synopsis':
                          return selectedProduct.customDescription || selectedProduct.product.synopsis || 'N/A';
                        case 'series_name':
                          return selectedProduct.product.series_name || 'N/A';
                        case 'age_range':
                          return selectedProduct.product.age_range || 'N/A';
                        case 'license':
                          return selectedProduct.product.license || 'N/A';
                        
                        // Otherwise
                        default:
                          return 'N/A';
                      }
                    })();
                    
                    return (
                      <div key={column}>
                        <h3 className="font-semibold">{column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}</h3>
                        {column === 'synopsis' ? (
                          <p className="mt-1 whitespace-pre-wrap">{displayValue}</p>
                        ) : (
                          <p className="mt-1">{displayValue}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
