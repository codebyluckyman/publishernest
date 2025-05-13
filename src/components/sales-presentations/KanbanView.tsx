
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";
import Image from "@/components/ui/img";
import { formatPrice } from "@/utils/productUtils";

interface KanbanViewProps {
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }>;
  onSelectProduct: (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => void;
}

export function KanbanView({ products, onSelectProduct }: KanbanViewProps) {
  // Group products by publisher
  const groupedProducts = products.reduce((acc, item) => {
    const publisher = item.product.publisher_name || 'Unknown Publisher';
    if (!acc[publisher]) {
      acc[publisher] = [];
    }
    acc[publisher].push(item);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(groupedProducts).map(([publisher, items]) => (
        <div key={publisher} className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">{publisher}</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <Card 
                key={item.product.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectProduct(item)}
              >
                <div className="flex p-3">
                  {item.product.cover_image_url ? (
                    <div className="w-12 h-16 overflow-hidden rounded mr-3">
                      <Image
                        src={item.product.cover_image_url}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center mr-3">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium line-clamp-2 text-sm">{item.product.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.product.isbn13 || 'No ISBN'} 
                      {item.customPrice !== undefined ? 
                        ` • ${formatPrice(item.customPrice, item.product.default_currency)}` : 
                        item.product.list_price ? ` • ${formatPrice(item.product.list_price, item.product.default_currency)}` : ''}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
