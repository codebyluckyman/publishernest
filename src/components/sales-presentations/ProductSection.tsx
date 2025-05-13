
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/productUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from '@/components/ui/img';
import { useFormatDetails } from '@/hooks/format/useFormatDetails';
import { PresentationDisplaySettings, PresentationViewMode, PresentationFeatures } from '@/types/salesPresentation';
import { ViewToggle } from './ViewToggle';
import { TableView } from './TableView';
import { CarouselView } from './CarouselView';
import { KanbanView } from './KanbanView';

interface ProductSectionProps {
  title: string;
  description?: string;
  displaySettings?: PresentationDisplaySettings;
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }>;
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
  const [selectedProduct, setSelectedProduct] = useState<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  } | null>(null);
  
  // Extract features from displaySettings
  const features = displaySettings?.features;
  const enabledViews = features?.enabledViews || ['card', 'table', 'carousel', 'kanban'];
  const allowViewToggle = features?.allowViewToggle !== false;
  const showProductDetails = features?.showProductDetails !== false;
  const showPricing = features?.showPricing !== false;
  
  // Use the defaultView from displaySettings, falling back to 'card' if not specified
  // But ensure it's one of the enabled views
  const defaultView = displaySettings?.defaultView && enabledViews.includes(displaySettings.defaultView)
    ? displaySettings.defaultView
    : (enabledViews.length > 0 ? enabledViews[0] : 'card');
    
  const [viewMode, setViewMode] = useState<PresentationViewMode>(defaultView);
  
  // If current viewMode becomes disabled, switch to first available view
  useEffect(() => {
    if (!enabledViews.includes(viewMode) && enabledViews.length > 0) {
      setViewMode(enabledViews[0]);
    }
  }, [enabledViews, viewMode]);

  const cardColumns = displaySettings?.cardColumns || 
    (displaySettings?.displayColumns as Array<string>) || 
    ['price', 'isbn13'];

  const dialogColumns = displaySettings?.dialogColumns || 
    (displaySettings?.displayColumns as Array<string>) || 
    ['price', 'isbn13', 'publisher', 'publication_date'];
    
  const shouldShowFormatDetails = dialogColumns.includes("format");
  const { data: formatDetails, isLoading: isLoadingFormat } = useFormatDetails(
    shouldShowFormatDetails && showProductDetails ? selectedProduct?.product.format_id || null : null
  );

  const getDisplayValue = (product: Product, column: string) => {
    // Don't show price if pricing is disabled
    if (column === 'price' && !showPricing) {
      return 'Contact for pricing';
    }
    
    switch (column) {
      case 'price':
        return formatPrice(product.list_price, product.default_currency);
      case 'isbn13':
        return product.isbn13 || 'N/A';
      case 'publisher':
        return product.publisher_name || 'N/A';
      case 'publication_date':
        return product.publication_date ? new Date(product.publication_date).toLocaleDateString() : 'N/A';
      case 'format':
        return product.format_extra_comments || 'N/A';
      case 'physical_properties':
        return `${product.height_measurement || '-'}mm × ${product.width_measurement || '-'}mm × ${product.thickness_measurement || '-'}mm | ${product.weight_measurement || '-'}g`;
      case 'carton_dimensions':
        const qty = product.carton_quantity ? `${product.carton_quantity} units` : 'N/A';
        const dims = product.carton_length_mm && product.carton_width_mm && product.carton_height_mm
          ? `${product.carton_length_mm}mm × ${product.carton_width_mm}mm × ${product.carton_height_mm}mm`
          : 'N/A';
        return `${qty} | ${dims}`;
      case 'synopsis':
        return product.synopsis || 'N/A';
      default:
        return '';
    }
  };

  // Handle product selection based on showProductDetails setting
  const handleProductSelection = (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => {
    if (showProductDetails) {
      setSelectedProduct(product);
    }
  };

  // Render the card view (default)
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((item) => (
        <Card 
          key={item.product.id} 
          className={`overflow-hidden ${showProductDetails ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
          onClick={() => handleProductSelection(item)}
        >
          {item.product.cover_image_url && (
            <div className="w-full h-48 overflow-hidden">
              <Image
                src={item.product.cover_image_url}
                alt={item.product.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-xl line-clamp-2">{item.product.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cardColumns.map((column) => (
              <div key={column} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}:</span>
                <span>{getDisplayValue(item.product, column)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          {allowViewToggle && enabledViews.length > 1 && (
            <ViewToggle 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              features={displaySettings?.features}
            />
          )}
          
          {isEditable && onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Section
            </Button>
          )}
        </div>
      </div>
      
      {products.length > 0 ? (
        <div>
          {viewMode === 'card' && enabledViews.includes('card') && renderCardView()}
          
          {viewMode === 'table' && enabledViews.includes('table') && (
            <TableView 
              products={products} 
              displaySettings={displaySettings}
              onSelectProduct={handleProductSelection}
            />
          )}
          
          {viewMode === 'carousel' && enabledViews.includes('carousel') && (
            <CarouselView 
              products={products} 
              displaySettings={displaySettings}
              onSelectProduct={handleProductSelection}
            />
          )}
          
          {viewMode === 'kanban' && enabledViews.includes('kanban') && (
            <KanbanView 
              products={products}
              onSelectProduct={handleProductSelection}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No products in this section</p>
        </div>
      )}
      
      <Dialog open={!!selectedProduct && showProductDetails} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl">
          {selectedProduct && showProductDetails && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.product.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {selectedProduct.product.cover_image_url && (
                  <div className="w-full h-64 overflow-hidden">
                    <Image
                      src={selectedProduct.product.cover_image_url}
                      alt={selectedProduct.product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {dialogColumns.map((column) => {
                    if (column === 'synopsis') return null;
                    return (
                      <div key={column}>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {column.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </h4>
                        <p>{getDisplayValue(selectedProduct.product, column)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {dialogColumns.includes('synopsis') && selectedProduct.product.synopsis && (
                <div className="mt-6 border rounded-lg p-4 bg-slate-50">
                  <h3 className="text-lg font-medium mb-3">Synopsis</h3>
                  <p className="text-sm text-gray-600">{selectedProduct.product.synopsis}</p>
                </div>
              )}
              
              {shouldShowFormatDetails && selectedProduct.product.format_id && (
                <div className="mt-6 border rounded-lg p-4 bg-slate-50">
                  <h3 className="text-lg font-medium mb-3">Format Details</h3>
                  {isLoadingFormat ? (
                    <p className="text-sm text-muted-foreground">Loading format details...</p>
                  ) : formatDetails ? (
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {formatDetails.extent && (
                        <div>
                          <p className="font-medium">Extent:</p>
                          <p>{formatDetails.extent}</p>
                        </div>
                      )}
                      
                      {formatDetails.tps_height_mm && formatDetails.tps_width_mm && (
                        <div>
                          <p className="font-medium">TPS Dimensions:</p>
                          <p>{formatDetails.tps_height_mm}mm × {formatDetails.tps_width_mm}mm
                            {formatDetails.tps_depth_mm && ` × ${formatDetails.tps_depth_mm}mm`}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="font-medium">PLC Dimensions:</p>
                        <p>
                          {formatDetails.tps_plc_height_mm && formatDetails.tps_plc_width_mm 
                            ? `${formatDetails.tps_plc_height_mm}mm × ${formatDetails.tps_plc_width_mm}mm${formatDetails.tps_plc_depth_mm ? ` × ${formatDetails.tps_plc_depth_mm}mm` : ''}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      
                      {formatDetails.cover_stock_print && (
                        <div>
                          <p className="font-medium">Cover Stock/Print:</p>
                          <p>{formatDetails.cover_stock_print}</p>
                        </div>
                      )}
                      
                      {formatDetails.internal_stock_print && (
                        <div>
                          <p className="font-medium">Internal Stock/Print:</p>
                          <p>{formatDetails.internal_stock_print}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No format details available</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setSelectedProduct(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
