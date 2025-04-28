
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/productUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from '@/components/ui/img';

interface ProductSectionProps {
  title: string;
  description?: string;
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
  isEditable = false,
  onEdit
}: ProductSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  } | null>(null);

  const handleProductClick = (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => {
    setSelectedProduct(product);
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
            onClick={() => handleProductClick(item)}
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
            <CardContent className="pb-2">
              {item.customDescription ? (
                <p className="text-muted-foreground text-sm line-clamp-3">{item.customDescription}</p>
              ) : item.product.format_extra_comments ? (
                <p className="text-muted-foreground text-sm line-clamp-3">{item.product.format_extra_comments}</p>
              ) : null}
            </CardContent>
            <CardFooter className="pt-0">
              <p className="font-medium">
                {item.customPrice !== undefined 
                  ? formatPrice(item.customPrice, item.product.default_currency)
                  : formatPrice(item.product.list_price, item.product.default_currency)}
              </p>
            </CardFooter>
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
                  {selectedProduct.customDescription ? (
                    <p>{selectedProduct.customDescription}</p>
                  ) : selectedProduct.product.format_extra_comments ? (
                    <p>{selectedProduct.product.format_extra_comments}</p>
                  ) : null}
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Price</h4>
                    <p className="text-xl font-bold">
                      {selectedProduct.customPrice !== undefined 
                        ? formatPrice(selectedProduct.customPrice, selectedProduct.product.default_currency)
                        : formatPrice(selectedProduct.product.list_price, selectedProduct.product.default_currency)}
                    </p>
                  </div>
                  
                  {selectedProduct.product.isbn13 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">ISBN-13</h4>
                      <p>{selectedProduct.product.isbn13}</p>
                    </div>
                  )}
                  
                  {selectedProduct.product.publisher_name && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Publisher</h4>
                      <p>{selectedProduct.product.publisher_name}</p>
                    </div>
                  )}
                  
                  {selectedProduct.product.publication_date && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Publication Date</h4>
                      <p>{new Date(selectedProduct.product.publication_date).toLocaleDateString()}</p>
                    </div>
                  )}
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
