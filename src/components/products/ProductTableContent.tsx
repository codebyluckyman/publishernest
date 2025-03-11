import { BookOpen, Pencil, Eye, Image, PlusCircle, ArrowUpDown, ChevronUp, ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SortDirection, SortField } from "./ProductTable";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  handleCopyProduct?: (id: string) => Promise<string>;
  formatDate: (date: string | null) => string;
  formatPrice: (price: number | null, currencyCode?: string | null) => string;
  getProductFormLabel: (form: string | null) => string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const ProductTableContent = ({
  products,
  isLoading,
  currentOrganization,
  handleViewProduct,
  handleEditProduct,
  handleAddProduct,
  handleCopyProduct,
  formatDate,
  formatPrice,
  getProductFormLabel,
  sortField,
  sortDirection,
  onSort
}: ProductTableContentProps) => {
  const [copyingProductId, setCopyingProductId] = useState<string | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  const handleCopyClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyingProductId(id);
    setIsCopyDialogOpen(true);
  };

  const handleConfirmCopy = async () => {
    if (!copyingProductId || !handleCopyProduct) return;
    
    setIsCopying(true);
    try {
      const newProductId = await handleCopyProduct(copyingProductId);
      setIsCopyDialogOpen(false);
      setCopyingProductId(null);
    } catch (error) {
      console.error("Error copying product:", error);
    } finally {
      setIsCopying(false);
    }
  };

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
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Cover</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => onSort('title')}
                >
                  Title {renderSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => onSort('publisher_name')}
                >
                  Publisher {renderSortIcon('publisher_name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => onSort('publication_date')}
                >
                  Pub Date {renderSortIcon('publication_date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-1 -ml-3 font-medium flex items-center"
                  onClick={() => onSort('list_price')}
                >
                  RRP {renderSortIcon('list_price')}
                </Button>
              </TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
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
                  {handleCopyProduct && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleCopyClick(product.id, e)}
                      title="Copy product"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a copy of the selected product. The new product will have the same details but with "(Copy)" added to the title.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCopying}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCopy} 
              disabled={isCopying}
              className="bg-primary hover:bg-primary/90"
            >
              {isCopying ? "Copying..." : "Copy Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductTableContent;
