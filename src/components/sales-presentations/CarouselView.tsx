
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PresentationDisplaySettings } from "@/types/salesPresentation";
import { Product } from "@/types/product";
import { formatPrice } from "@/utils/productUtils";
import Image from "@/components/ui/img";

interface CarouselViewProps {
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }>;
  displaySettings?: PresentationDisplaySettings;
  onSelectProduct: (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => void;
}

export function CarouselView({ products, displaySettings, onSelectProduct }: CarouselViewProps) {
  const cardColumns = displaySettings?.cardColumns || ['price', 'isbn13', 'publisher'];
  const features = displaySettings?.features;
  const showPricing = features?.showPricing !== false;
  const showProductDetails = features?.showProductDetails !== false;
  
  const getDisplayValue = (product: Product, column: string, customPrice?: number) => {
    // Don't show price if pricing is disabled
    if (column === 'price' && !showPricing) {
      return 'Contact for pricing';
    }
    
    switch (column) {
      case 'price':
        // First check if there's a custom price set
        if (customPrice !== undefined) {
          return formatPrice(customPrice, product.default_currency);
        }
        return formatPrice(product.list_price, product.default_currency);
      case 'isbn13':
        return product.isbn13 || 'N/A';
      case 'publisher':
        return product.publisher_name || 'N/A';
      case 'publication_date':
        return product.publication_date ? new Date(product.publication_date).toLocaleDateString() : 'N/A';
      case 'format':
        return product.format_extra_comments || 'N/A';
      case 'synopsis':
        return product.synopsis || 'N/A';
      default:
        return '';
    }
  };
  
  return (
    <Carousel className="w-full px-12">
      <CarouselContent>
        {products.map((item) => (
          <CarouselItem key={item.product.id} className="md:basis-1/2 lg:basis-1/3">
            <Card 
              className={`h-full overflow-hidden ${showProductDetails ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
              onClick={() => onSelectProduct(item)}
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
  );
}
