
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDate } from '@/utils/date';
import { ExtendedProduct } from '@/types/index';
import { PresentationDisplaySettings } from '@/types/salesPresentation';

interface ProductCardDisplayProps {
  product: ExtendedProduct;
  displaySettings: PresentationDisplaySettings;
}

export function ProductCardDisplay({ product, displaySettings }: ProductCardDisplayProps) {
  // Extract display columns from settings
  const { cardColumns = ['price', 'isbn13', 'publisher'] } = displaySettings;
  
  // Format price with currency
  const formattedPrice = product.price ? 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: product.currency || 'USD'
    }).format(product.price) : 
    'Price not available';

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-tight">{product.title}</h3>
          {product.subtitle && (
            <p className="text-sm text-muted-foreground">{product.subtitle}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {cardColumns.includes('price') && (
            <div className="text-sm">
              <span className="font-medium">Price:</span> {formattedPrice}
            </div>
          )}
          
          {cardColumns.includes('isbn13') && product.isbn13 && (
            <div className="text-sm">
              <span className="font-medium">ISBN-13:</span> {product.isbn13}
            </div>
          )}
          
          {cardColumns.includes('publisher') && product.publisher_name && (
            <div className="text-sm">
              <span className="font-medium">Publisher:</span> {product.publisher_name}
            </div>
          )}
          
          {cardColumns.includes('publication_date') && product.publication_date && (
            <div className="text-sm">
              <span className="font-medium">Publication Date:</span> {formatDate(product.publication_date)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        {displaySettings.features?.showPricing && (
          <div className="text-sm font-medium">{formattedPrice}</div>
        )}
      </CardFooter>
    </Card>
  );
}
