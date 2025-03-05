
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image, Grid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import ProductDialog from "@/components/ProductDialog";

type Product = {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  cover_image_url: string | null;
};

type ViewMode = "gallery" | "table";

interface LinkedProductsGalleryProps {
  formatId: string;
}

export function LinkedProductsGallery({ formatId }: LinkedProductsGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

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

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsProductDialogOpen(false);
    setSelectedProductId(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Linked Products</h3>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Linked Products ({products.length})</h3>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
      
      {viewMode === "gallery" ? (
        <GalleryView products={products} onProductClick={handleProductClick} />
      ) : (
        <TableView products={products} onProductClick={handleProductClick} />
      )}

      <ProductDialog 
        open={isProductDialogOpen} 
        productId={selectedProductId}
        onOpenChange={setIsProductDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}

function ViewToggle({ 
  viewMode, 
  setViewMode 
}: { 
  viewMode: ViewMode; 
  setViewMode: (mode: ViewMode) => void 
}) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === "gallery" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("gallery")}
        title="Gallery view"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("table")}
        title="Table view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}

function GalleryView({ 
  products, 
  onProductClick 
}: { 
  products: Product[];
  onProductClick: (productId: string) => void;
}) {
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
                {product.isbn13 || product.isbn10 || "No ISBN"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableView({ 
  products,
  onProductClick
}: { 
  products: Product[];
  onProductClick: (productId: string) => void;
}) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>ISBN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onProductClick(product.id)}
            >
              <TableCell>
                <div className="h-12 w-9 bg-muted flex items-center justify-center overflow-hidden">
                  {product.cover_image_url ? (
                    <img
                      src={product.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground opacity-20" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.title}</TableCell>
              <TableCell>{product.isbn13 || product.isbn10 || "No ISBN"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
