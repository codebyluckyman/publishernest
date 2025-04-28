
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Pencil, Star } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  description?: string;
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
    isHighlighted?: boolean;
    badge?: string;
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
  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {isEditable && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => (
            <Card 
              key={item.product.id}
              className={`relative ${item.isHighlighted ? 'ring-2 ring-primary' : ''}`}
            >
              {item.badge && (
                <Badge 
                  className="absolute top-2 right-2"
                  variant={
                    item.badge === 'new' ? 'default' :
                    item.badge === 'featured' ? 'secondary' :
                    item.badge === 'bestseller' ? 'outline' :
                    'default'
                  }
                >
                  {item.badge}
                </Badge>
              )}
              
              {item.product.cover_image_url && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                  <img
                    src={item.product.cover_image_url}
                    alt={item.product.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">{item.product.title}</h3>
                {item.customDescription ? (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.customDescription}
                  </p>
                ) : item.product.synopsis ? (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.product.synopsis}
                  </p>
                ) : null}
                
                <div className="mt-2">
                  {item.customPrice ? (
                    <p className="font-medium">
                      ${item.customPrice.toFixed(2)}
                      {item.product.list_price && item.customPrice < item.product.list_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${item.product.list_price.toFixed(2)}
                        </span>
                      )}
                    </p>
                  ) : item.product.list_price ? (
                    <p className="font-medium">${item.product.list_price.toFixed(2)}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
