
import { useEffect, useState } from "react";
import { fetchProducts } from "@/utils/productUtils";
import { formatDate, formatPrice, getProductFormLabel } from "@/utils/productUtils";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableProductTableContent from "./EditableProductTableContent";
import { useQuery } from "@tanstack/react-query";
import { Product, SortDirection, SortField } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditableProductTableProps {
  searchQuery: string;
  filters: {
    product_form: string | null;
    publisher_name: string | null;
    pub_month: string | null;
    license: string | null;
    format_id: string | null;
  };
  currentOrganization: any;
  onViewProduct: (id: string) => void;
  onEditProduct: (id: string) => void;
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
  refreshTrigger = 0,
}: EditableProductTableProps) => {
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      currentOrganization?.id,
      searchQuery,
      filters,
      sortField,
      sortDirection,
      refreshTrigger,
    ],
    queryFn: () => fetchProducts(currentOrganization, searchQuery, filters, sortField, sortDirection),
    enabled: !!currentOrganization,
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopyProduct = async (productId: string): Promise<string> => {
    try {
      // Get the product to copy
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError || !product) {
        throw new Error(fetchError?.message || "Failed to fetch product");
      }

      // Create a copy with modified title
      const productCopy = {
        ...product,
        id: undefined, // Let Supabase generate a new ID
        title: `${product.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined,
      };

      // Insert the copy
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert(productCopy)
        .select()
        .single();

      if (insertError || !newProduct) {
        throw new Error(insertError?.message || "Failed to create product copy");
      }

      toast.success("Product copied successfully");
      refetch();
      return newProduct.id;
    } catch (error: any) {
      toast.error(`Error copying product: ${error.message}`);
      throw error;
    }
  };

  return (
    <EditableProductTableContent
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

export default EditableProductTable;
