
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PresentationDisplaySettings } from "@/types/salesPresentation";
import { formatPrice } from "@/utils/productUtils";
import Image from "@/components/ui/img";
import { ProductWithFormat } from "@/hooks/useProductsWithFormats";
import { useEffect, useState } from "react";

interface CarouselViewProps {
  products: Array<{
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  }>;
  displaySettings?: PresentationDisplaySettings;
  onSelectProduct: (product: {
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  }) => void;
}

export function CarouselView({ products, displaySettings, onSelectProduct }: CarouselViewProps) {
  const cardColumns = displaySettings?.cardColumns || ['price', 'isbn13', 'publisher'];
  const features = displaySettings?.features;
  const showPricing = features?.showPricing !== false;
  const showProductDetails = features?.showProductDetails !== false;
  
  // Extract carousel settings or use defaults
  const carouselSettings = features?.carouselSettings || {};
  const slidesPerView = carouselSettings.slidesPerView || { sm: 1, md: 2, lg: 3 };
  const slideHeight = carouselSettings.slideHeight || 192; // Default to 192px
  const showIndicators = carouselSettings.showIndicators !== false;
  
  // Set up autoplay if enabled
  const [api, setApi] = useState<any>(null);
  
  // Handle autoplay
  useEffect(() => {
    if (!api) return;
    
    if (carouselSettings.autoplay) {
      const autoplayInterval = setInterval(() => {
        api.scrollNext();
      }, carouselSettings.autoplayDelay || 3000);
      
      return () => clearInterval(autoplayInterval);
    }
  }, [api, carouselSettings.autoplay, carouselSettings.autoplayDelay]);
  
  // Calculate responsive classes based on settings
  const getSlideClass = () => {
    return `
      ${slidesPerView.sm === 2 ? 'md:basis-1/2' : 'md:basis-full'}
      ${slidesPerView.md === 1 ? 'lg:basis-full' : 
        slidesPerView.md === 2 ? 'lg:basis-1/2' : 
        'lg:basis-1/3'}
      ${slidesPerView.lg === 1 ? 'xl:basis-full' : 
        slidesPerView.lg === 2 ? 'xl:basis-1/2' : 
        slidesPerView.lg === 3 ? 'xl:basis-1/3' : 
        'xl:basis-1/4'}
    `;
  };
  
  const getDisplayValue = (product: ProductWithFormat, column: string, customPrice?: number) => {
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
        return product.publisher_name || 'N/A';
      case 'publication_date':
        return product.publication_date ? new Date(product.publication_date).toLocaleDateString() : 'N/A';
      case 'product_form':
        return product.product_form || 'N/A';
      case 'product_form_detail':
        return product.product_form_detail || 'N/A';
      case 'status':
        return product.status || 'N/A';
        
      // Physical properties
      case 'height':
        return product.height_measurement ? `${product.height_measurement} mm` : 'N/A';
      case 'width':
        return product.width_measurement ? `${product.width_measurement} mm` : 'N/A';
      case 'thickness':
        return product.thickness_measurement ? `${product.thickness_measurement} mm` : 'N/A';
      case 'weight':
        return product.weight_measurement ? `${product.weight_measurement} g` : 'N/A';
      case 'physical_properties':
        return `H: ${product.height_measurement || '-'}mm × W: ${product.width_measurement || '-'}mm × T: ${product.thickness_measurement || '-'}mm`;
        
      // Format details - Enhanced to use format data
      case 'format':
        if (product.format) {
          return product.format.format_name || 'N/A';
        }
        return 'N/A';
      case 'format_name':
        if (product.format) {
          return product.format.format_name || 'N/A';
        }
        return 'N/A';
      case 'binding_type':
        if (product.format) {
          return product.format.binding_type || 'N/A';
        }
        return 'N/A';
      case 'cover_material':
        if (product.format) {
          return product.format.cover_material || 'N/A';
        }
        return 'N/A';
      case 'internal_material':
        if (product.format) {
          return product.format.internal_material || 'N/A';
        }
        return 'N/A';
      case 'cover_stock_print':
        if (product.format) {
          return product.format.cover_stock_print || 'N/A';
        }
        return 'N/A';
      case 'internal_stock_print':
        if (product.format) {
          return product.format.internal_stock_print || 'N/A';
        }
        return 'N/A';
      case 'orientation':
        if (product.format) {
          return product.format.orientation || 'N/A';
        }
        return 'N/A';
      case 'extent':
        if (product.format) {
          return product.format.extent || 'N/A';
        }
        return 'N/A';
      case 'tps_dimensions':
        if (product.format) {
          return `H: ${product.format.tps_height_mm || '-'}mm × W: ${product.format.tps_width_mm || '-'}mm × D: ${product.format.tps_depth_mm || '-'}mm`;
        }
        return 'N/A';
      case 'plc_dimensions':
        if (product.format) {
          return `H: ${product.format.tps_plc_height_mm || '-'}mm × W: ${product.format.tps_plc_width_mm || '-'}mm × D: ${product.format.tps_plc_depth_mm || '-'}mm`;
        }
        return 'N/A';
      case 'format_extras':
        if (product.format_extras && typeof product.format_extras === 'object') {
          const extras = Object.entries(product.format_extras)
            .filter(([_, value]) => value === true)
            .map(([key]) => key.replace('_', ' '));
          return extras.length > 0 ? extras.join(', ') : 'None';
        }
        return 'N/A';
      case 'format_extra_comments':
        return product.format_extra_comments || 'N/A';
        
      // Content details
      case 'page_count':
        return product.page_count ? `${product.page_count}` : 'N/A';
      case 'edition_number':
        return product.edition_number ? `${product.edition_number}` : 'N/A';
        
      // Carton information
      case 'carton_quantity':
        return product.carton_quantity ? `${product.carton_quantity}` : 'N/A';
      case 'carton_dimensions':
        if (product.carton_length_mm || product.carton_width_mm || product.carton_height_mm) {
          return `L: ${product.carton_length_mm || '-'}mm × W: ${product.carton_width_mm || '-'}mm × H: ${product.carton_height_mm || '-'}mm`;
        }
        return 'N/A';
        
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
  
  return (
    <div className="w-full">
      <Carousel 
        className="w-full px-12" 
        setApi={setApi}
      >
        <CarouselContent>
          {products.map((item) => (
            <CarouselItem key={item.product.id} className={getSlideClass()}>
              <Card 
                className={`h-full overflow-hidden ${showProductDetails ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
                onClick={() => showProductDetails && onSelectProduct(item)}
              >
                {item.product.cover_image_url && (
                  <div 
                    className="w-full overflow-hidden" 
                    style={{ height: `${slideHeight}px` }}
                  >
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
                      <span className="font-medium text-muted-foreground">
                        {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}:
                      </span>
                      <span>{getDisplayValue(item.product, column, item.customPrice)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-2" />
        <CarouselNext className="-right-2" />
      </Carousel>
      
      {/* Show indicators if enabled */}
      {showIndicators && products.length > 1 && (
        <div className="flex justify-center mt-4 space-x-1">
          {products.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all 
                ${index === (api?.selectedScrollSnap?.() || 0) ? 'bg-primary w-4' : 'bg-muted w-1.5'}`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
