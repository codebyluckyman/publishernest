
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from '@/components/ui/carousel';
import { ExternalLink, Pencil, MoreHorizontal, BookOpen } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { ExtendedProduct } from '@/types';

interface ProductSectionProps {
  title: string;
  description?: string;
  items: ExtendedProduct[];
  viewType: 'grid' | 'list' | 'carousel';
  editable?: boolean;
  onEdit?: () => void;
  displayColumns?: string[];
  onProductClick?: (product: ExtendedProduct) => void;
}

export default function ProductSection({
  title,
  description,
  items,
  viewType,
  editable = false,
  onEdit,
  displayColumns = ['price', 'publisher_name', 'isbn13'],
  onProductClick,
}: ProductSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleProductClick = (product: ExtendedProduct) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      setSelectedProduct(product);
      setDialogOpen(true);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          {editable && (
            <Button variant="outline" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Section
            </Button>
          )}
        </div>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">No products in this section</p>
        </div>
      </div>
    );
  }

  if (viewType === 'grid') {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          {editable && (
            <Button variant="outline" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Section
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleProductClick(product)}
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={product.cover_image_url || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
                {product.subtitle && (
                  <p className="text-sm text-gray-500 line-clamp-1">{product.subtitle}</p>
                )}
              </CardHeader>
              <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                {product.price !== undefined && (
                  <p className="font-semibold">{formatCurrency(product.price, product.currency)}</p>
                )}
                <div className="flex items-center space-x-2">
                  {product.publisher_name && (
                    <span className="text-xs text-gray-500">{product.publisher_name}</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedProduct && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProduct.title}</DialogTitle>
                {selectedProduct.subtitle && (
                  <DialogDescription>{selectedProduct.subtitle}</DialogDescription>
                )}
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-center items-center">
                  <img
                    src={selectedProduct.cover_image_url || '/placeholder.svg'}
                    alt={selectedProduct.title}
                    className="max-h-80 object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(selectedProduct.price || 0, selectedProduct.currency)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <dl className="space-y-2">
                      {selectedProduct.publisher_name && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium">Publisher:</dt>
                          <dd className="text-sm">{selectedProduct.publisher_name}</dd>
                        </div>
                      )}
                      {selectedProduct.isbn13 && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium">ISBN:</dt>
                          <dd className="text-sm">{selectedProduct.isbn13}</dd>
                        </div>
                      )}
                      {selectedProduct.isbn10 && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium">ISBN-10:</dt>
                          <dd className="text-sm">{selectedProduct.isbn10}</dd>
                        </div>
                      )}
                      {selectedProduct.format_id && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium">Format:</dt>
                          <dd className="text-sm">View Format</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  {selectedProduct.synopsis && (
                    <div className="border-t pt-2">
                      <h4 className="font-medium mb-1">Synopsis</h4>
                      <p className="text-sm line-clamp-4">{selectedProduct.synopsis}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => navigate(`/products/${selectedProduct.id}`)}
                >
                  View Full Details <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  if (viewType === 'list') {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          {editable && (
            <Button variant="outline" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Section
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {items.map((product) => (
            <div
              key={product.id}
              className="flex border rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition-all"
              onClick={() => handleProductClick(product)}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                <img
                  src={product.cover_image_url || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                  {product.subtitle && (
                    <p className="text-sm text-gray-500 line-clamp-1">{product.subtitle}</p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    {product.price !== undefined && (
                      <span className="font-bold">{formatCurrency(product.price, product.currency)}</span>
                    )}
                    {product.publisher_name && (
                      <span className="text-xs text-gray-500">• {product.publisher_name}</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Carousel view
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {editable && (
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Section
          </Button>
        )}
      </div>
      <div className="relative">
        <Carousel
          ref={carouselRef}
          className="w-full"
          opts={{
            align: 'start',
            loop: false,
          }}
        >
          <CarouselContent>
            {items.map((product) => (
              <CarouselItem key={product.id} className="basis-1/1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <Card 
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-md h-full flex flex-col"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={product.cover_image_url || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="py-3 px-4 flex-grow">
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    {product.subtitle && (
                      <p className="text-sm text-gray-500 line-clamp-1">{product.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                    {product.price !== undefined && (
                      <p className="font-semibold">{formatCurrency(product.price, product.currency)}</p>
                    )}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {selectedProduct && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedProduct.title}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 flex justify-center items-start">
                <img
                  src={selectedProduct.cover_image_url || '/placeholder.svg'}
                  alt={selectedProduct.title}
                  className="max-h-80 object-contain"
                />
              </div>
              <div className="md:col-span-3 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold">{selectedProduct.title}</h2>
                  {selectedProduct.price !== undefined && (
                    <p className="text-2xl font-bold">{formatCurrency(selectedProduct.price, selectedProduct.currency)}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  {selectedProduct.publisher_name && (
                    <div className="flex gap-2">
                      <span className="text-sm font-medium w-24">Publisher:</span>
                      <span className="text-sm">{selectedProduct.publisher_name}</span>
                    </div>
                  )}
                  
                  {selectedProduct.publication_date && (
                    <div className="flex gap-2">
                      <span className="text-sm font-medium w-24">Published:</span>
                      <span className="text-sm">{selectedProduct.publication_date}</span>
                    </div>
                  )}
                  
                  {selectedProduct.synopsis && (
                    <div className="pt-2 space-y-1">
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm">{selectedProduct.synopsis}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
              <Button onClick={() => navigate(`/products/${selectedProduct.id}`)}>
                View Full Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
