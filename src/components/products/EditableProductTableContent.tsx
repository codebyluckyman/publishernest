
import { BookOpen, Image, PlusCircle, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SortDirection, SortField } from "@/types/product";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { EditableTextCell } from "./editable-cells/EditableTextCell";
import { EditablePriceCell } from "./editable-cells/EditablePriceCell";
import { EditableDateCell } from "./editable-cells/EditableDateCell";
import { EditableSelectCell } from "./editable-cells/EditableSelectCell";
import { useProductEdit } from "@/context/ProductEditContext";
import { ProductActionMenu } from "./ProductActionMenu";
import { formatMonthYear } from "@/utils/productUtils";

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
  format_id: string | null;
  series_name: string | null;
  license: string | null;
  age_range: string | null;
  format?: {
    id: string;
    format_name: string | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
    tps_height_mm: number | null;
    tps_width_mm: number | null;
    tps_depth_mm: number | null;
    tps_plc_height_mm: number | null;
    tps_plc_width_mm: number | null;
    tps_plc_depth_mm: number | null;
    extent: string | null;
    binding_type: string | null;
    cover_material: string | null;
    internal_material: string | null;
    cover_stock_print: string | null;
    internal_stock_print: string | null;
    orientation: string | null;
    end_papers_material: string | null;
    end_papers_print: string | null;
    spacers_material: string | null;
    spacers_stock_print: string | null;
    sticker_material: string | null;
    sticker_stock_print: string | null;
  } | null;
}

interface EditableProductTableContentProps {
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

const EditableProductTableContent = ({
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
}: EditableProductTableContentProps) => {
  const [copyingProductId, setCopyingProductId] = useState<string | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { isEditMode } = useProductEdit();

  const {
    currentData: paginatedProducts,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  } = usePagination<any>({
    data: products || [],
    initialPageSize: 10,
  });

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  const handleConfirmCopy = async () => {
    if (!copyingProductId || !handleCopyProduct) return;
    
    setIsCopying(true);
    try {
      const newProductId = await handleCopyProduct(copyingProductId);
      setIsCopyDialogOpen(false);
      setCopyingProductId(null);
      
      if (newProductId) {
        handleEditProduct(newProductId);
      }
    } catch (error) {
      console.error("Error copying product:", error);
    } finally {
      setIsCopying(false);
    }
  };

  // Product form options
  const productFormOptions = [
    { value: "BA", label: "Book" },
    { value: "BB", label: "Hardcover" },
    { value: "BC", label: "Paperback" },
    { value: "JB", label: "Journal" },
    { value: "DG", label: "Electronic" },
    { value: "XA", label: "Custom" },
  ];

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
              <TableHead>Series</TableHead>
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
              <TableHead>Pub Month</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Age Range</TableHead>
              <TableHead>Format</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product: Product) => (
              <TableRow 
                key={product.id} 
                className={`hover:bg-muted/70 ${isEditMode ? "" : "cursor-pointer"}`}
                onClick={isEditMode ? undefined : () => handleViewProduct(product.id)}
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
                <TableCell className="font-medium">
                  <EditableTextCell 
                    value={product.title} 
                    productId={product.id}
                    fieldName="title"
                  />
                </TableCell>
                <TableCell>
                  <EditableTextCell 
                    value={product.isbn13 || product.isbn10 || ''} 
                    productId={product.id}
                    fieldName="isbn13"
                  />
                </TableCell>
                <TableCell>
                  <EditableTextCell 
                    value={product.series_name || ''} 
                    productId={product.id}
                    fieldName="series_name"
                  />
                </TableCell>
                <TableCell>
                  <EditableDateCell 
                    value={product.publication_date} 
                    productId={product.id}
                    fieldName="publication_date"
                  />
                </TableCell>
                <TableCell>
                  {formatMonthYear(product.publication_date)}
                </TableCell>
                <TableCell>
                  <EditableTextCell 
                    value={product.license || ''} 
                    productId={product.id}
                    fieldName="license"
                  />
                </TableCell>
                <TableCell>
                  <EditableTextCell 
                    value={product.age_range || ''} 
                    productId={product.id}
                    fieldName="age_range"
                  />
                </TableCell>
                <TableCell>
                  {product.format?.format_name || 'N/A'}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                  <ProductActionMenu 
                    product={product}
                    onViewProduct={handleViewProduct}
                    onEditProduct={handleEditProduct}
                    onCopyProduct={handleCopyProduct}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onPageSizeChange={changePageSize}
      />

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

export default EditableProductTableContent;
