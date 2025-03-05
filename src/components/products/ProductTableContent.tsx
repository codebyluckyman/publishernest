
import { BookOpen, Pencil, Eye, Image, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  product_form: string | null;
  publisher_name: string | null;
  publication_date: string | null;
  list_price: number | null;
  default_price: number | null;
  default_currency: string | null;
  created_at: string;
  updated_at: string;
  cover_image_url: string | null;
}

interface ProductTableContentProps {
  products: Product[] | undefined;
  isLoading: boolean;
  currentOrganization: any;
  handleViewProduct: (id: string) => void;
  handleEditProduct: (id: string) => void;
  handleAddProduct: () => void;
  formatDate: (date: string | null) => string;
  formatPrice: (price: number | null, currencyCode?: string | null) => string;
  getProductFormLabel: (form: string | null) => string;
}

const ProductTableContent = ({
  products,
  isLoading,
  currentOrganization,
  handleViewProduct,
  handleEditProduct,
  handleAddProduct,
  formatDate,
  formatPrice,
  getProductFormLabel
}: ProductTableContentProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 space-y-3">
        <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="text-lg font-medium">No Products Found</h3>
        <p className="text-sm max-w-md mx-auto">
          {!currentOrganization
            ? "Please select an organization to view products."
            : "Get started by adding your first product to the catalog."}
        </p>
        {currentOrganization && (
          <Button className="mt-4 gap-1" onClick={handleAddProduct}>
            <PlusCircle className="h-4 w-4" />
            Add First Product
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70px]">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Publisher</TableHead>
            <TableHead>Pub Date</TableHead>
            <TableHead>RRP</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id} 
              className="cursor-pointer hover:bg-muted/70" 
              onClick={() => handleViewProduct(product.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="w-10 h-14 overflow-hidden rounded border bg-muted">
                  {product.cover_image_url ? (
                    <img 
                      src={product.cover_image_url} 
                      alt={`Cover for ${product.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Image className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.title}</TableCell>
              <TableCell>{product.isbn13 || product.isbn10 || "N/A"}</TableCell>
              <TableCell>{getProductFormLabel(product.product_form)}</TableCell>
              <TableCell>{product.publisher_name || "N/A"}</TableCell>
              <TableCell>{formatDate(product.publication_date)}</TableCell>
              <TableCell>
                {product.default_price !== null 
                  ? formatPrice(product.default_price, product.default_currency)
                  : formatPrice(product.list_price)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()} className="space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleViewProduct(product.id)}
                  title="View product"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEditProduct(product.id)}
                  title="Edit product"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTableContent;
