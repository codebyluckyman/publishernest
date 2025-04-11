
import { Organization } from "@/types/organization";
import ProductTableContent from "./ProductTableContent";
import { ProductEmptyState } from "./ProductEmptyState";
import { useProductTableState } from "@/hooks/useProductTableState";
import { formatDate, formatPrice, getProductFormLabel } from "@/utils/productUtils";
import { SortDirection, SortField } from "@/types/product";

// Re-export these types so ProductTableContent can use them
export type { SortDirection, SortField };

interface ProductTableProps {
  searchQuery: string;
  filters: {
    product_form: string | null;
    publisher_name: string | null;
  };
  currentOrganization: Organization | null;
  onViewProduct: (productId: string) => void;
  onEditProduct: (productId: string) => void;
  onAddProduct: () => void;
  refreshTrigger?: number;
}

const ProductTable = ({
  searchQuery,
  filters,
  currentOrganization,
  onViewProduct,
  onEditProduct,
  onAddProduct,
  refreshTrigger = 0
}: ProductTableProps) => {
  const {
    products,
    isLoading,
    sortField,
    sortDirection,
    handleSort,
    handleCopyProduct
  } = useProductTableState({
    searchQuery,
    filters,
    currentOrganization,
    refreshTrigger
  });

  if (isLoading) {
    return null;
  }

  if (!products || products.length === 0) {
    return <ProductEmptyState hasOrganization={!!currentOrganization} onAddProduct={onAddProduct} />;
  }

  return (
    <ProductTableContent 
      products={products}
      isLoading={isLoading}
      currentOrganization={currentOrganization}
      handleViewProduct={onViewProduct}
      handleEditProduct={onEditProduct}
      handleAddProduct={onAddProduct}
      handleCopyProduct={handleCopyProduct}
      formatDate={formatDate}
      formatPrice={formatPrice}
      getProductFormLabel={getProductFormLabel}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
    />
  );
};

export default ProductTable;
