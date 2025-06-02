
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { PresentationDisplaySettings, CardColumn, DialogColumn } from '@/types/salesPresentation';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductSectionProps {
  products: Product[];
  displaySettings: PresentationDisplaySettings;
  organizationId: string;
  allowDownloads?: boolean;
}

interface ProductWithCustomData {
  product: Product;
  customPrice?: number;
  customDescription?: string;
}

const columnLabels: Record<CardColumn | DialogColumn, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  isbn13: 'ISBN-13',
  isbn10: 'ISBN-10',
  price: 'Price',
  product_form: 'Product Form',
  product_form_detail: 'Product Form Detail',
  publisher: 'Publisher',
  publication_date: 'Publication Date',
  status: 'Status',
  height: 'Height',
  width: 'Width',
  thickness: 'Thickness',
  weight: 'Weight',
  physical_properties: 'Physical Properties',
  format: 'Format',
  format_extras: 'Format Extras',
  format_extra_comments: 'Format Extra Comments',
  format_name: 'Format Name',
  binding_type: 'Binding Type',
  cover_material: 'Cover Material',
  cover_stock_print: 'Cover Stock/Print',
  internal_material: 'Internal Material',
  internal_stock_print: 'Internal Stock/Print',
  orientation: 'Orientation',
  extent: 'Extent',
  tps_dimensions: 'TPS Dimensions',
  plc_dimensions: 'PLC Dimensions',
  page_count: 'Page Count',
  edition_number: 'Edition Number',
  carton_quantity: 'Carton Quantity',
  carton_length: 'Carton Length',
  carton_width: 'Carton Width',
  carton_height: 'Carton Height',
  carton_weight: 'Carton Weight',
  carton_dimensions: 'Carton Dimensions',
  synopsis: 'Synopsis',
  series_name: 'Series Name',
  age_range: 'Age Range',
  license: 'License',
  language_code: 'Language Code',
  subject_code: 'Subject Code',
  product_availability_code: 'Product Availability Code'
};

const getFieldValue = (product: Product, column: CardColumn | DialogColumn) => {
  switch (column) {
    case 'title':
      return product.title;
    case 'subtitle':
      return product.subtitle;
    case 'isbn13':
      return product.isbn13;
    case 'isbn10':
      return product.isbn10;
    case 'price':
      return product.list_price ? formatCurrency(product.list_price, product.currency_code) : null;
    case 'product_form':
      return product.product_form;
    case 'product_form_detail':
      return product.product_form_detail;
    case 'publisher':
      return product.publisher_name;
    case 'publication_date':
      return product.publication_date ? formatDate(product.publication_date) : null;
    case 'status':
      return product.status;
    case 'height':
      return product.height_measurement ? `${product.height_measurement}mm` : null;
    case 'width':
      return product.width_measurement ? `${product.width_measurement}mm` : null;
    case 'thickness':
      return product.thickness_measurement ? `${product.thickness_measurement}mm` : null;
    case 'weight':
      return product.weight_measurement ? `${product.weight_measurement}g` : null;
    case 'physical_properties':
      const dimensions = [
        product.height_measurement ? `H: ${product.height_measurement}mm` : null,
        product.width_measurement ? `W: ${product.width_measurement}mm` : null,
        product.thickness_measurement ? `T: ${product.thickness_measurement}mm` : null,
        product.weight_measurement ? `${product.weight_measurement}g` : null
      ].filter(Boolean).join(', ');
      return dimensions || null;
    case 'format':
      return product.format?.format_name;
    case 'format_extras':
      if (product.format_extras && typeof product.format_extras === 'object') {
        const extras = Object.entries(product.format_extras)
          .filter(([, value]) => value)
          .map(([key]) => key.replace('_', ' '))
          .join(', ');
        return extras || null;
      }
      return null;
    case 'format_extra_comments':
      return product.format_extra_comments;
    case 'format_name':
      return product.format?.format_name;
    case 'binding_type':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'cover_material':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'cover_stock_print':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'internal_material':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'internal_stock_print':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'orientation':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'extent':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'tps_dimensions':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'plc_dimensions':
      return product.format?.format_name; // Simplified since format object only has id and format_name
    case 'page_count':
      return product.page_count?.toString();
    case 'edition_number':
      return product.edition_number?.toString();
    case 'carton_quantity':
      return product.carton_quantity?.toString();
    case 'carton_length':
      return product.carton_length_mm ? `${product.carton_length_mm}mm` : null;
    case 'carton_width':
      return product.carton_width_mm ? `${product.carton_width_mm}mm` : null;
    case 'carton_height':
      return product.carton_height_mm ? `${product.carton_height_mm}mm` : null;
    case 'carton_weight':
      return product.carton_weight_kg ? `${product.carton_weight_kg}kg` : null;
    case 'carton_dimensions':
      const cartonDims = [
        product.carton_length_mm ? `L: ${product.carton_length_mm}mm` : null,
        product.carton_width_mm ? `W: ${product.carton_width_mm}mm` : null,
        product.carton_height_mm ? `H: ${product.carton_height_mm}mm` : null,
        product.carton_weight_kg ? `Weight: ${product.carton_weight_kg}kg` : null
      ].filter(Boolean).join(', ');
      return cartonDims || null;
    case 'synopsis':
      return product.synopsis;
    case 'series_name':
      return product.series_name;
    case 'age_range':
      return product.age_range;
    case 'license':
      return product.license;
    case 'language_code':
      return product.language_code;
    case 'subject_code':
      return product.subject_code;
    case 'product_availability_code':
      return product.product_availability_code;
    default:
      return null;
  }
};

export function ProductSection({ 
  products, 
  displaySettings, 
  organizationId,
  allowDownloads = false 
}: ProductSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Convert products to include custom data
  const productsWithCustomData: ProductWithCustomData[] = useMemo(() => {
    return products.map(product => ({
      product,
      customPrice: undefined,
      customDescription: undefined
    }));
  }, [products]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleImageClick = (product: Product, imageIndex: number = 0) => {
    setSelectedProduct(product);
    setSelectedImageIndex(imageIndex);
    setShowImageModal(true);
  };

  const renderProductCards = (productsToRender: ProductWithCustomData[]) => {
    const cardColumns = displaySettings.cardColumns || ['price', 'isbn13', 'publisher'];
    const features = displaySettings.features || {};
    const gridLayout = features.cardGridLayout || { sm: 1, md: 2, lg: 3, xl: 4, xxl: 5 };

    // Generate grid classes based on layout configuration
    const gridClasses = [
      `grid-cols-${gridLayout.sm || 1}`,
      `md:grid-cols-${gridLayout.md || 2}`,
      `lg:grid-cols-${gridLayout.lg || 3}`,
      `xl:grid-cols-${gridLayout.xl || 4}`,
      `2xl:grid-cols-${gridLayout.xxl || 5}`
    ].join(' ');

    return (
      <div className={`grid gap-6 ${gridClasses}`}>
        {productsToRender.map(({ product, customPrice, customDescription }) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div onClick={() => handleProductClick(product)}>
              {product.cover_image_url && (
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(product, 0);
                    }}
                  />
                </div>
              )}
              
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                {product.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.subtitle}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {cardColumns.map((column) => {
                  const value = getFieldValue(product, column);
                  if (!value) return null;
                  
                  return (
                    <div key={column} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{columnLabels[column]}:</span>
                      <span className="font-medium text-right max-w-[60%] truncate">
                        {column === 'price' && customPrice !== undefined 
                          ? formatCurrency(customPrice, product.currency_code)
                          : value
                        }
                      </span>
                    </div>
                  );
                })}
                
                {customDescription && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">{customDescription}</p>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderCarouselView = (productsToRender: ProductWithCustomData[]) => {
    return (
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {productsToRender.map(({ product }) => (
            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => handleProductClick(product)}>
                  {product.cover_image_url && (
                    <AspectRatio ratio={3/4}>
                      <img
                        src={product.cover_image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {displaySettings.cardColumns?.slice(0, 3).map((column) => {
                        const value = getFieldValue(product, column);
                        if (!value) return null;
                        
                        return (
                          <div key={column} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{columnLabels[column]}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  };

  const currentView = displaySettings.defaultView || 'card';

  return (
    <div className="space-y-6">
      {currentView === 'carousel' ? (
        renderCarouselView(productsWithCustomData)
      ) : (
        renderProductCards(productsWithCustomData)
      )}

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProduct.title}</DialogTitle>
                {selectedProduct.subtitle && (
                  <p className="text-muted-foreground">{selectedProduct.subtitle}</p>
                )}
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Images Section */}
                <div className="space-y-4">
                  {selectedProduct.cover_image_url && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Cover Image</h4>
                      <img
                        src={selectedProduct.cover_image_url}
                        alt={`${selectedProduct.title} cover`}
                        className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(selectedProduct, 0)}
                      />
                    </div>
                  )}
                  
                  {selectedProduct.internal_images && selectedProduct.internal_images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Internal Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.internal_images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`${selectedProduct.title} internal ${index + 1}`}
                            className="w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(selectedProduct, index + 1)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    {displaySettings.dialogColumns?.map((column) => {
                      const value = getFieldValue(selectedProduct, column);
                      if (!value) return null;
                      
                      return (
                        <div key={column} className="flex justify-between items-start gap-4">
                          <span className="text-sm text-muted-foreground min-w-0 flex-shrink-0">
                            {columnLabels[column]}:
                          </span>
                          <span className="text-sm font-medium text-right min-w-0">
                            {column === 'synopsis' ? (
                              <div className="max-w-none text-left">{value}</div>
                            ) : (
                              value
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {allowDownloads && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Implement download functionality
                          console.log('Download product details for:', selectedProduct.id);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Product Details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-2">
          {selectedProduct && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Get all images */}
              {(() => {
                const allImages = [
                  ...(selectedProduct.cover_image_url ? [selectedProduct.cover_image_url] : []),
                  ...(selectedProduct.internal_images || [])
                ];
                
                if (allImages.length === 0) return null;
                
                const currentImage = allImages[selectedImageIndex];
                
                return (
                  <>
                    <img
                      src={currentImage}
                      alt={`${selectedProduct.title} - Image ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-[85vh] object-contain"
                    />
                    
                    {/* Navigation buttons */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === 0 ? allImages.length - 1 : prev - 1
                          )}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === allImages.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
