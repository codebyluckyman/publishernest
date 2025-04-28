import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/productUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from '@/components/ui/img';

interface PresentationDisplaySettings {
  displayColumns: string[];
}

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

  const getDisplayValue = (product: Product, column: string) => {
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
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        {isEditable && onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Section
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => (
          <Card 
            key={item.product.id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedProduct(item)}
          >
            {item.product.cover_image_url && (
              <div className="w-full h-48 overflow-hidden">
                <Image
                  src={item.product.cover_image_url}
                  alt={item.product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-xl line-clamp-2">{item.product.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {displaySettings?.displayColumns.map((column) => (
                <div key={column} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{column.charAt(0).toUpperCase() + column.slice(1)}:</span>
                  <span>{getDisplayValue(item.product, column)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl">
          {selectedProduct && (
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
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {displaySettings?.displayColumns.map((column) => (
                    <div key={column}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                      </h4>
                      <p>{getDisplayValue(selectedProduct.product, column)}</p>
                    </div>
                  ))}
                </div>
              </div>
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
