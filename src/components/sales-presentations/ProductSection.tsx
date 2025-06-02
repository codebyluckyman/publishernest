
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/productUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from '@/components/ui/img';
import { useFormatDetails } from '@/hooks/format/useFormatDetails';
import { PresentationDisplaySettings, PresentationViewMode, PresentationFeatures, CardGridLayout, CardWidthType } from '@/types/salesPresentation';
import { ViewToggle } from './ViewToggle';
import { TableView } from './TableView';
import { CarouselView } from './CarouselView';
import { KanbanView } from './KanbanView';
import { cn } from '@/lib/utils';

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
  const features = displaySettings?.features || {};
  const enabledViews = features.enabledViews || ['card', 'table', 'carousel', 'kanban'];
  const allowViewToggle = features.allowViewToggle !== false;
  const showProductDetails = features.showProductDetails !== false;
  const showPricing = features.showPricing !== false;
  const cardWidthType: CardWidthType = features.cardWidthType || 'responsive';
  const fixedCardWidth = features.fixedCardWidth || 320;

  // Only use cardGridLayout if we're in responsive mode
  const cardGridLayout = cardWidthType === 'responsive' ? features.cardGridLayout || {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 5
  } : undefined;

  // Use the defaultView from displaySettings, falling back to 'card' if not specified
  // But ensure it's one of the enabled views
  const defaultView = displaySettings?.defaultView && enabledViews.includes(displaySettings.defaultView) ? displaySettings.defaultView : enabledViews.length > 0 ? enabledViews[0] : 'card';
  const [viewMode, setViewMode] = useState<PresentationViewMode>(defaultView);

  // If current viewMode becomes disabled, switch to first available view
  useEffect(() => {
    if (!enabledViews.includes(viewMode) && enabledViews.length > 0) {
      setViewMode(enabledViews[0]);
    }
  }, [enabledViews, viewMode]);

  const cardColumns = displaySettings?.cardColumns || displaySettings?.displayColumns as Array<string> || ['price', 'isbn13'];
  const dialogColumns = displaySettings?.dialogColumns || displaySettings?.displayColumns as Array<string> || ['price', 'isbn13', 'publisher', 'publication_date'];
  const shouldShowFormatDetails = dialogColumns.includes("format");

  const {
    data: formatDetails,
    isLoading: isLoadingFormat
  } = useFormatDetails(shouldShowFormatDetails && showProductDetails ? selectedProduct?.product.format_id || null : null);

  // Generate grid classes based on card grid layout configuration
  const generateGridClasses = () => {
    if (cardWidthType === 'fixed') {
      return "flex flex-wrap gap-6";
    }

    // Use responsive grid for 'responsive' mode
    if (!cardGridLayout) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6";
    }

    const classes = ["grid", "gap-6"];

    // Small screens (default)
    classes.push(`grid-cols-${cardGridLayout.sm || 1}`);

    // Medium screens (md: ≥768px)
    if (cardGridLayout.md) classes.push(`md:grid-cols-${cardGridLayout.md}`);

    // Large screens (lg: ≥1024px)
    if (cardGridLayout.lg) classes.push(`lg:grid-cols-${cardGridLayout.lg}`);

    // Extra large screens (xl: ≥1280px)
    if (cardGridLayout.xl) classes.push(`xl:grid-cols-${cardGridLayout.xl}`);

    // 2XL screens (2xl: ≥1536px)
    if (cardGridLayout.xxl) classes.push(`2xl:grid-cols-${cardGridLayout.xxl}`);

    return classes.join(" ");
  };

  // Helper to format dimensions
  const formatDimensions = (height?: number | null, width?: number | null, depth?: number | null) => {
    if (!height && !width) return 'N/A';
    let dimensions = `${height || '-'}mm × ${width || '-'}mm`;
    if (depth) dimensions += ` × ${depth}mm`;
    return dimensions;
  };

  const getDisplayValue = (product: Product, column: string, customPrice?: number) => {
    // Don't show price if pricing is disabled
    if (column === 'price' && !showPricing) {
      return 'Contact for pricing';
    }

    switch (column) {
      case 'title':
        return product.title;
      case 'price':
        if (customPrice !== undefined) {
          return formatPrice(customPrice, product.default_currency || product.currency_code || 'USD');
        }
        return formatPrice(product.list_price, product.default_currency || product.currency_code || 'USD');
      case 'isbn13':
        return product.isbn13 || 'N/A';
      case 'isbn10':
        return product.isbn10 || 'N/A';
      case 'publisher':
      case 'publisher_name':
        return product.publisher_name || 'N/A';
      case 'publication_date':
        return product.publication_date ? new Date(product.publication_date).toLocaleDateString() : 'N/A';
      case 'synopsis':
        return product.synopsis || 'N/A';
      default:
        return 'N/A';
    }
  };

  // Get friendly display name for column
  const getDisplayName = (column: string): string => {
    const displayNameMap: Record<string, string> = {
      'price': 'Price',
      'isbn13': 'ISBN-13',
      'isbn10': 'ISBN-10',
      'publisher': 'Publisher',
      'publisher_name': 'Publisher',
      'publication_date': 'Publication Date',
      'synopsis': 'Synopsis',
    };
    return displayNameMap[column] || column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ');
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
  const renderCardView = () => {
    if (cardWidthType === 'fixed') {
      return (
        <div className={generateGridClasses()}>
          {products.map(item => (
            <Card 
              key={item.product.id} 
              className={cn("overflow-hidden", showProductDetails ? "hover:shadow-md transition-shadow cursor-pointer" : "")} 
              onClick={() => handleProductSelection(item)}
              style={{
                width: `${fixedCardWidth}px`,
                flexShrink: 0
              }}
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
                {item.product.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.product.subtitle}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {cardColumns.map(column => (
                  <div key={column} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{getDisplayName(column)}:</span>
                    <span className="text-right ml-2">{getDisplayValue(item.product, column, item.customPrice)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else {
      return (
        <div className={generateGridClasses()}>
          {products.map(item => (
            <Card 
              key={item.product.id} 
              className={cn("overflow-hidden", showProductDetails ? "hover:shadow-md transition-shadow cursor-pointer" : "")} 
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
                {item.product.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.product.subtitle}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {cardColumns.map(column => (
                  <div key={column} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{getDisplayName(column)}:</span>
                    <span className="text-right ml-2">{getDisplayValue(item.product, column, item.customPrice)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          {allowViewToggle && enabledViews.length > 1 && (
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} features={displaySettings?.features} />
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
            <TableView products={products} displaySettings={displaySettings} onSelectProduct={handleProductSelection} />
          )}
          
          {viewMode === 'carousel' && enabledViews.includes('carousel') && (
            <CarouselView products={products} displaySettings={displaySettings} onSelectProduct={handleProductSelection} />
          )}
          
          {viewMode === 'kanban' && enabledViews.includes('kanban') && (
            <KanbanView products={products} displaySettings={displaySettings} onSelectProduct={handleProductSelection} />
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No products in this section</p>
        </div>
      )}
      
      <Dialog open={!!selectedProduct && showProductDetails} onOpenChange={open => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && showProductDetails && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.product.title}</DialogTitle>
                {selectedProduct.product.subtitle && (
                  <p className="text-muted-foreground">{selectedProduct.product.subtitle}</p>
                )}
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
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>
                    <div className="space-y-1">
                      {dialogColumns.filter(column => column !== 'synopsis').map(column => (
                        <div key={column} className="grid grid-cols-2 gap-2">
                          <span className="text-sm font-medium">{getDisplayName(column)}</span>
                          <span className="text-sm">
                            {getDisplayValue(selectedProduct.product, column, selectedProduct.customPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {dialogColumns.includes('synopsis') && selectedProduct.product.synopsis && (
                <div className="mt-6 border rounded-lg p-4 bg-slate-50">
                  <h3 className="text-lg font-medium mb-3">Synopsis</h3>
                  <p className="text-sm text-gray-600">{selectedProduct.product.synopsis}</p>
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
