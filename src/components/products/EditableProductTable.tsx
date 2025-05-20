
import { useEffect } from "react";
import ProductTable from "./ProductTable";
import { Organization } from "@/types/organization";
import { useProductEdit } from "@/context/ProductEditContext";

interface EditableProductTableProps {
  searchQuery: string;
  filters: {
    product_form: string | string[];
    publisher_name: string | string[];
    pub_month: string | string[] | null;
    license: string | string[] | null;
    format_id: string | string[] | null;
    series_name: string | string[] | null;
  };
  currentOrganization: Organization | null;
  onViewProduct: (productId: string) => void;
  onEditProduct: (productId: string) => void;
  onAddProduct: () => void;
  refreshTrigger?: number;
}

const EditableProductTable = ({
  searchQuery,
  filters,
  currentOrganization,
  onViewProduct,
  onEditProduct,
  onAddProduct,
  refreshTrigger = 0
}: EditableProductTableProps) => {
  const { setRefreshCallback, isEditMode } = useProductEdit();

  // Set up the refresh callback function when component mounts or refreshTrigger changes
  useEffect(() => {
    const triggerRefresh = () => {
      // The refetch happens automatically when refreshTrigger changes
      // This is handled by the useProductTableState hook's dependency on refreshTrigger
    };
    
    setRefreshCallback(() => triggerRefresh);
    
    // Clean up when component unmounts
    return () => setRefreshCallback(() => {});
  }, [setRefreshCallback, refreshTrigger]);

  return (
    <ProductTable
      searchQuery={searchQuery}
      filters={filters}
      currentOrganization={currentOrganization}
      onViewProduct={onViewProduct}
      onEditProduct={onEditProduct}
      onAddProduct={onAddProduct}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default EditableProductTable;
