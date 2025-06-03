
import { Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "../types/ProductTypes";

interface GalleryViewProps { 
  products: Product[];
  onProductClick: (productId: string) => void;
}

export function GalleryView({ products, onProductClick }: GalleryViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => onProductClick(product.id)}
        >
          <CardContent className="p-0">
            <div className="aspect-[2/3] bg-muted flex items-center justify-center overflow-hidden">
              {product.cover_image_url ? (
                <img
                  src={product.cover_image_url}
                  alt={`Cover for ${product.title}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <Image className="h-12 w-12 text-muted-foreground opacity-20" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-medium line-clamp-2">{product.title}</h4>
              <p className="text-sm text-muted-foreground">
                {product.isbn13 ? `ISBN-13: ${product.isbn13}` : product.isbn10 ? `ISBN-10: ${product.isbn10}` : "No ISBN"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
