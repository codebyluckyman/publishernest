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
  const features = displaySettings?.features;
  const enabledViews = features?.enabledViews || ['card', 'table', 'carousel', 'kanban'];
  const allowViewToggle = features?.allowViewToggle !== false;
  const showProductDetails = features?.showProductDetails !== false;
  const showPricing = features?.showPricing !== false;
  const cardWidthType: CardWidthType = features?.cardWidthType || 'responsive';
  const fixedCardWidth = features?.fixedCardWidth || 320;
  
  // Only use cardGridLayout if we're in responsive mode
  const cardGridLayout = cardWidthType === 'responsive' ? features?.cardGridLayout || {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 5
  } : undefined;
  
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
      // Basic info
      case 'title':
        return product.title;
      case 'price':
        // First check if there's a custom price set
        if (customPrice !== undefined) {
          return formatPrice(customPrice, product.default_currency);
        }
        return formatPrice(product.list_price, product.default_currency);
      case 'isbn13':
        return product.isbn13 || 'N/A';
      case 'isbn10':
        return product.isbn10 || 'N/A';
        
      // Product details
      case 'publisher':
      case 'publisher_name': // Handle both column names
        return product.publisher_name || 'N/A';
      case 'publication_date':
        return product.publication_date ? new Date(product.publication_date).toLocaleDateString() : 'N/A';
      case 'product_form':
        return product.product_form || 'N/A';
      case 'product_form_detail':
        return product.product_form_detail || 'N/A';
      case 'status':
        return product.status || 'N/A';
        
      // Format information from formats table
      case 'format_name':
        return product.format?.format_name || 'N/A';
      case 'binding_type':
        return product.format?.binding_type || 'N/A';
      case 'cover_material':
        return product.format?.cover_material || 'N/A';
      case 'cover_stock_print':
        return product.format?.cover_stock_print || 'N/A';
      case 'internal_material':
        return product.format?.internal_material || 'N/A';
      case 'internal_stock_print':
        return product.format?.internal_stock_print || 'N/A';
      case 'orientation':
        return product.format?.orientation || 'N/A';
      case 'extent':
        return product.format?.extent || 'N/A';
      case 'tps_dimensions':
        return formatDimensions(product.format?.tps_height_mm, product.format?.tps_width_mm, product.format?.tps_depth_mm);
      case 'plc_dimensions':
        return formatDimensions(product.format?.tps_plc_height_mm, product.format?.tps_plc_width_mm, product.format?.tps_plc_depth_mm);
        
      // Physical properties - individual
      case 'height':
        return product.height_measurement ? `${product.height_measurement}mm` : 'N/A';
      case 'width':
        return product.width_measurement ? `${product.width_measurement}mm` : 'N/A';
      case 'thickness':
        return product.thickness_measurement ? `${product.thickness_measurement}mm` : 'N/A';
      case 'weight':
        return product.weight_measurement ? `${product.weight_measurement}g` : 'N/A';
        
      // Physical properties - grouped
      case 'physical_properties':
        return `${product.height_measurement || '-'}mm × ${product.width_measurement || '-'}mm × ${product.thickness_measurement || '-'}mm | ${product.weight_measurement || '-'}g`;
        
      // Format details
      case 'format':
        return product.format_extra_comments || 'N/A';
      case 'format_extras':
        if (typeof product.format_extras === 'object' && product.format_extras !== null) {
          // Check if it's the old format with boolean flags
          if ('foil' in product.format_extras) {
            const extras = product.format_extras as Record<string, boolean>;
            return Object.entries(extras)
              .filter(([_, value]) => value)
              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
              .join(', ') || 'None';
          } 
          // Handle new format with array of extras
          else if (Array.isArray(product.format_extras)) {
            return product.format_extras
              .map(extra => extra.name)
              .join(', ') || 'None';
          }
        }
        return 'N/A';
      case 'format_extra_comments':
        return product.format_extra_comments || 'N/A';
        
      // Content details
      case 'page_count':
        return product.page_count ? `${product.page_count} pages` : 'N/A';
      case 'edition_number':
        return product.edition_number ? `${getOrdinal(product.edition_number)} edition` : 'N/A';
        
      // Carton information - individual
      case 'carton_quantity':
        return product.carton_quantity ? `${product.carton_quantity} units` : 'N/A';
      case 'carton_length':
        return product.carton_length_mm ? `${product.carton_length_mm}mm` : 'N/A';
      case 'carton_width':
        return product.carton_width_mm ? `${product.carton_width_mm}mm` : 'N/A';
      case 'carton_height':
        return product.carton_height_mm ? `${product.carton_height_mm}mm` : 'N/A';
      case 'carton_weight':
        return product.carton_weight_kg ? `${product.carton_weight_kg}kg` : 'N/A';
        
      // Carton information - grouped
      case 'carton_dimensions':
        const qty = product.carton_quantity ? `${product.carton_quantity} units` : 'N/A';
        const dims = product.carton_length_mm && product.carton_width_mm && product.carton_height_mm
          ? `${product.carton_length_mm}mm × ${product.carton_width_mm}mm × ${product.carton_height_mm}mm`
          : 'N/A';
        const weight = product.carton_weight_kg ? ` | ${product.carton_weight_kg}kg` : '';
        return `${qty} | ${dims}${weight}`;
        
      // Additional information
      case 'synopsis':
        return product.synopsis || 'N/A';
      case 'subtitle':
        return product.subtitle || 'N/A';
      case 'series_name':
        return product.series_name || 'N/A';
      case 'age_range':
        return product.age_range || 'N/A';
      case 'license':
        return product.license || 'N/A';
        
      // Codes
      case 'language_code':
        return product.language_code || 'N/A';
      case 'subject_code':
        return product.subject_code || 'N/A';
      case 'product_availability_code':
        return product.product_availability_code || 'N/A';
        
      default:
        return 'N/A';
    }
  };

  // Helper function for ordinal numbers (1st, 2nd, 3rd, etc.)
  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
      'product_form': 'Format Type',
      'product_form_detail': 'Format Detail',
      'status': 'Status',
      'height': 'Height',
      'width': 'Width', 
      'thickness': 'Thickness',
      'weight': 'Weight',
      'physical_properties': 'Dimensions',
      'format': 'Format',
      'format_extras': 'Format Features',
      'format_extra_comments': 'Format Comments',
      'page_count': 'Pages',
      'edition_number': 'Edition',
      'carton_quantity': 'Carton Qty',
      'carton_length': 'Carton Length',
      'carton_width': 'Carton Width',
      'carton_height': 'Carton Height',
      'carton_weight': 'Carton Weight',
      'carton_dimensions': 'Carton Info',
      'synopsis': 'Synopsis',
      'subtitle': 'Subtitle',
      'series_name': 'Series',
      'age_range': 'Age Range',
      'license': 'License',
      'language_code': 'Language',
      'subject_code': 'Subject',
      'product_availability_code': 'Availability'
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

  // Get a more organized structure for dialog columns
  const organizeDialogColumns = (columns: string[]): Record<string, string[]> => {
    const groups: Record<string, string[]> = {
      'Basic Information': [],
      'Physical Properties': [],
      'Format Details': [],
      'Content Information': [],
      'Carton Information': [],
      'Additional Information': []
    };
    
    columns.forEach(column => {
      if (['title', 'isbn13', 'isbn10', 'price', 'publisher', 'publication_date', 'status'].includes(column)) {
        groups['Basic Information'].push(column);
      } else if (['height', 'width', 'thickness', 'weight', 'physical_properties'].includes(column)) {
        groups['Physical Properties'].push(column);
      } else if (['format', 'format_extras', 'format_extra_comments'].includes(column)) {
        groups['Format Details'].push(column);
      } else if (['page_count', 'edition_number'].includes(column)) {
        groups['Content Information'].push(column);
      } else if (['carton_quantity', 'carton_length', 'carton_width', 'carton_height', 'carton_weight', 'carton_dimensions'].includes(column)) {
        groups['Carton Information'].push(column);
      } else {
        groups['Additional Information'].push(column);
      }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    return groups;
  };

  // Render the card view (default)
  const renderCardView = () => {
    if (cardWidthType === 'fixed') {
      return (
        <div className={generateGridClasses()}>
          {products.map((item) => (
            <Card 
              key={item.product.id} 
              className={cn(
                "overflow-hidden",
                showProductDetails ? "hover:shadow-md transition-shadow cursor-pointer" : ""
              )}
              onClick={() => handleProductSelection(item)}
              style={{ width: `${fixedCardWidth}px`, flexShrink: 0 }}
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
                {cardColumns.map((column) => (
                  <div key={column} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{getDisplayName(column)}:</span>
                    <span className="font-medium text-right ml-2">{getDisplayValue(item.product, column, item.customPrice)}</span>
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
          {products.map((item) => (
            <Card 
              key={item.product.id} 
              className={cn(
                "overflow-hidden",
                showProductDetails ? "hover:shadow-md transition-shadow cursor-pointer" : ""
              )}
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
                {cardColumns.map((column) => (
                  <div key={column} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{getDisplayName(column)}:</span>
                    <span className="font-medium text-right ml-2">{getDisplayValue(item.product, column, item.customPrice)}</span>
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
                  {Object.entries(organizeDialogColumns(dialogColumns)).map(([group, columns]) => (
                    <div key={group} className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">{group}</h3>
                      <div className="space-y-1">
                        {columns.filter(column => column !== 'synopsis').map(column => (
                          <div key={column} className="grid grid-cols-2 gap-2">
                            <span className="text-sm font-medium">{getDisplayName(column)}</span>
                            <span className="text-sm">
                              {getDisplayValue(selectedProduct.product, column, selectedProduct.customPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
