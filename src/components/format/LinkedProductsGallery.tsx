
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  cover_image_url: string | null;
};

interface LinkedProductsGalleryProps {
  formatId: string;
}

export function LinkedProductsGallery({ formatId }: LinkedProductsGalleryProps) {
  const fetchLinkedProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, isbn13, isbn10, cover_image_url")
      .eq("format_id", formatId);

    if (error) {
      console.error("Error fetching linked products:", error);
      throw new Error(error.message);
    }

    return data as Product[];
  };

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["linked-products", formatId],
    queryFn: fetchLinkedProducts,
    enabled: !!formatId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Linked Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[2/3] bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/20 rounded-md">
        Error loading linked products: {(error as Error).message}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Linked Products</h3>
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
          No products are currently using this format
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Linked Products ({products.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                  {product.isbn13 || product.isbn10 || "No ISBN"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
